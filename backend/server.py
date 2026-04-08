from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'florist-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category_id: str
    images: List[str]
    sizes: Optional[List[Dict]] = None
    in_stock: bool = True
    featured: bool = False
    occasion_tags: List[str] = []

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category_id: str
    category_name: Optional[str] = None
    images: List[str]
    sizes: Optional[List[Dict]] = None
    in_stock: bool
    featured: bool
    occasion_tags: List[str]
    created_at: str

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = ""
    image: Optional[str] = ""

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    image: str
    product_count: int = 0

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: Optional[str] = None
    box_personalization: Optional[Dict] = None  # {box_color, ribbon_color, box_message}

class CartResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[Dict]
    gift_message: Optional[str] = None
    subtotal: float
    created_at: str

class OrderCreate(BaseModel):
    delivery_date: str
    delivery_address: Dict
    gift_message: Optional[str] = None
    recipient_name: str
    recipient_phone: str
    box_personalization: Optional[Dict] = None  # {color: str, ribbon_color: str, custom_message: str}

class BoxPersonalizationOptions(BaseModel):
    box_colors: List[str] = ["Classic White", "Blush Pink", "Sage Green", "Navy Blue", "Kraft Natural"]
    ribbon_colors: List[str] = ["Gold", "Silver", "White", "Ivory", "Dusty Rose", "Forest Green", "Navy"]
    max_message_length: int = 50

class OrderResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    items: List[Dict]
    delivery_date: str
    delivery_address: Dict
    gift_message: Optional[str] = None
    recipient_name: str
    recipient_phone: str
    box_personalization: Optional[Dict] = None
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    payment_status: str
    is_saturday_delivery: bool = False
    created_at: str

class SubscriptionCreate(BaseModel):
    plan_type: str  # weekly, biweekly, monthly
    delivery_address: Dict
    recipient_name: str
    recipient_phone: str

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan_type: str
    price: float
    delivery_address: Dict
    recipient_name: str
    recipient_phone: str
    status: str
    next_delivery: Optional[str] = None
    created_at: str

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    return user

async def require_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await require_user(credentials)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, data.email)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.email,
            name=data.name,
            is_admin=False,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"], user.get("is_admin", False))
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(require_user)):
    return UserResponse(**user)

# ==================== CATEGORY ENDPOINTS ====================

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        count = await db.products.count_documents({"category_id": cat["id"]})
        cat["product_count"] = count
    return categories

@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(data: CategoryCreate, admin = Depends(require_admin)):
    cat_id = str(uuid.uuid4())
    cat_doc = {
        "id": cat_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(cat_doc)
    return CategoryResponse(id=cat_id, **data.model_dump(), product_count=0)

# ==================== PRODUCT ENDPOINTS ====================

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    occasion: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
):
    query = {}
    if category:
        cat = await db.categories.find_one({"slug": category}, {"_id": 0})
        if cat:
            query["category_id"] = cat["id"]
    if occasion:
        query["occasion_tags"] = occasion
    if featured is not None:
        query["featured"] = featured
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    
    # Add category names
    cat_ids = list(set(p["category_id"] for p in products))
    categories = await db.categories.find({"id": {"$in": cat_ids}}, {"_id": 0}).to_list(100)
    cat_map = {c["id"]: c["name"] for c in categories}
    
    for p in products:
        p["category_name"] = cat_map.get(p["category_id"], "")
    
    return products

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cat = await db.categories.find_one({"id": product["category_id"]}, {"_id": 0})
    product["category_name"] = cat["name"] if cat else ""
    return product

@api_router.post("/products", response_model=ProductResponse)
async def create_product(data: ProductCreate, admin = Depends(require_admin)):
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    cat = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    return ProductResponse(id=product_id, **data.model_dump(), category_name=cat["name"] if cat else "", created_at=product_doc["created_at"])

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, data: ProductCreate, admin = Depends(require_admin)):
    result = await db.products.update_one({"id": product_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    cat = await db.categories.find_one({"id": product["category_id"]}, {"_id": 0})
    product["category_name"] = cat["name"] if cat else ""
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== CART ENDPOINTS ====================

@api_router.get("/cart")
async def get_cart(session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    if not query.get("user_id") and not query.get("session_id"):
        return {"id": "", "items": [], "subtotal": 0, "gift_message": None}
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        return {"id": "", "items": [], "subtotal": 0, "gift_message": None}
    
    # Enrich cart items with product details
    enriched_items = []
    subtotal = 0
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price"] * item["quantity"]
            subtotal += item_total
            enriched_items.append({
                **item,
                "name": product["name"],
                "price": product["price"],
                "image": product["images"][0] if product["images"] else "",
                "item_total": item_total,
                "box_personalization": item.get("box_personalization")
            })
    
    cart["items"] = enriched_items
    cart["subtotal"] = round(subtotal, 2)
    return cart

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, session_id: Optional[str] = None, user = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        cart_id = str(uuid.uuid4())
        cart = {
            "id": cart_id,
            "user_id": user["id"] if user else None,
            "session_id": session_id if not user else None,
            "items": [],
            "gift_message": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Check if item already exists (same product, size, and box personalization)
    existing_idx = None
    for idx, existing in enumerate(cart["items"]):
        if (existing["product_id"] == item.product_id and 
            existing.get("size") == item.size and
            existing.get("box_personalization") == item.box_personalization):
            existing_idx = idx
            break
    
    if existing_idx is not None:
        cart["items"][existing_idx]["quantity"] += item.quantity
    else:
        cart["items"].append(item.model_dump())
    
    await db.carts.update_one(query, {"$set": cart}, upsert=True)
    return {"message": "Item added to cart"}

@api_router.put("/cart/update")
async def update_cart_item(item: CartItem, session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    for existing in cart["items"]:
        if existing["product_id"] == item.product_id and existing.get("size") == item.size:
            if item.quantity <= 0:
                cart["items"].remove(existing)
            else:
                existing["quantity"] = item.quantity
            break
    
    await db.carts.update_one(query, {"$set": {"items": cart["items"]}})
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart["items"] = [i for i in cart["items"] if i["product_id"] != product_id]
    await db.carts.update_one(query, {"$set": {"items": cart["items"]}})
    return {"message": "Item removed"}

@api_router.put("/cart/gift-message")
async def update_gift_message(message: dict, session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    await db.carts.update_one(query, {"$set": {"gift_message": message.get("message", "")}})
    return {"message": "Gift message updated"}

@api_router.delete("/cart/clear")
async def clear_cart(session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    await db.carts.delete_one(query)
    return {"message": "Cart cleared"}

# ==================== DELIVERY & BOX PERSONALIZATION ====================

STANDARD_DELIVERY_FEE = 5.99
SATURDAY_DELIVERY_FEE = 8.99
FREE_DELIVERY_THRESHOLD = 50.0

@api_router.get("/delivery/options")
async def get_delivery_options():
    """Get delivery date options and box personalization choices"""
    from datetime import date
    today = date.today()
    
    # Calculate available dates (starting from 2 days ahead, excluding Sundays)
    available_dates = []
    check_date = today + timedelta(days=2)
    
    for _ in range(14):  # Next 2 weeks
        if check_date.weekday() != 6:  # Not Sunday (0=Monday, 6=Sunday)
            is_saturday = check_date.weekday() == 5
            available_dates.append({
                "date": check_date.isoformat(),
                "day_name": check_date.strftime("%A"),
                "formatted": check_date.strftime("%B %d, %Y"),
                "is_saturday": is_saturday,
                "delivery_fee": SATURDAY_DELIVERY_FEE if is_saturday else STANDARD_DELIVERY_FEE
            })
        check_date += timedelta(days=1)
    
    box_options = {
        "box_colors": [
            {"id": "classic-white", "name": "Classic White", "hex": "#FFFFFF"},
            {"id": "blush-pink", "name": "Blush Pink", "hex": "#F2CFC0"},
            {"id": "sage-green", "name": "Sage Green", "hex": "#E8ECE1"},
            {"id": "navy-blue", "name": "Navy Blue", "hex": "#233520"},
            {"id": "kraft-natural", "name": "Kraft Natural", "hex": "#C9A66B"}
        ],
        "ribbon_colors": [
            {"id": "gold", "name": "Gold", "hex": "#D4AF37"},
            {"id": "silver", "name": "Silver", "hex": "#C0C0C0"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "ivory", "name": "Ivory", "hex": "#FFFFF0"},
            {"id": "dusty-rose", "name": "Dusty Rose", "hex": "#C07A65"},
            {"id": "forest-green", "name": "Forest Green", "hex": "#228B22"},
            {"id": "navy", "name": "Navy", "hex": "#000080"}
        ],
        "max_box_message_length": 50
    }
    
    return {
        "available_dates": available_dates,
        "box_personalization": box_options,
        "delivery_fees": {
            "standard": STANDARD_DELIVERY_FEE,
            "saturday": SATURDAY_DELIVERY_FEE,
            "free_threshold": FREE_DELIVERY_THRESHOLD
        }
    }

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(data: OrderCreate, session_id: Optional[str] = None, user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate delivery date
    from datetime import date
    try:
        delivery_date = datetime.strptime(data.delivery_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    today = date.today()
    min_delivery_date = today + timedelta(days=2)
    
    if delivery_date < min_delivery_date:
        raise HTTPException(status_code=400, detail="Delivery date must be at least 2 days from today")
    
    if delivery_date.weekday() == 6:  # Sunday
        raise HTTPException(status_code=400, detail="Sunday delivery is not available")
    
    is_saturday = delivery_date.weekday() == 5
    
    # Calculate totals
    subtotal = 0
    order_items = []
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price"] * item["quantity"]
            subtotal += item_total
            order_items.append({
                **item,
                "name": product["name"],
                "price": product["price"],
                "image": product["images"][0] if product["images"] else "",
                "item_total": item_total
            })
    
    # Calculate delivery fee
    if subtotal >= FREE_DELIVERY_THRESHOLD:
        delivery_fee = 0
    elif is_saturday:
        delivery_fee = SATURDAY_DELIVERY_FEE
    else:
        delivery_fee = STANDARD_DELIVERY_FEE
    
    total = round(subtotal + delivery_fee, 2)
    
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": user["id"] if user else None,
        "items": order_items,
        "delivery_date": data.delivery_date,
        "delivery_address": data.delivery_address,
        "gift_message": data.gift_message or cart.get("gift_message"),
        "recipient_name": data.recipient_name,
        "recipient_phone": data.recipient_phone,
        "box_personalization": data.box_personalization,
        "subtotal": round(subtotal, 2),
        "delivery_fee": delivery_fee,
        "total": total,
        "is_saturday_delivery": is_saturday,
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(user = Depends(require_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, user = Depends(get_current_user)):
    query = {"id": order_id}
    if user:
        query["user_id"] = user["id"]
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ==================== ADMIN ORDER ENDPOINTS ====================

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(status: Optional[str] = None, admin = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, admin = Depends(require_admin)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status_data["status"]}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ==================== SUBSCRIPTION ENDPOINTS ====================

SUBSCRIPTION_PRICES = {
    "weekly": 29.99,
    "biweekly": 34.99,
    "monthly": 39.99
}

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    return [
        {"id": "weekly", "name": "Weekly Blooms", "price": 29.99, "description": "Fresh flowers delivered every week"},
        {"id": "biweekly", "name": "Bi-Weekly Blooms", "price": 34.99, "description": "Fresh flowers delivered every two weeks"},
        {"id": "monthly", "name": "Monthly Blooms", "price": 39.99, "description": "Fresh flowers delivered every month"}
    ]

@api_router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(data: SubscriptionCreate, user = Depends(require_user)):
    if data.plan_type not in SUBSCRIPTION_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    sub_id = str(uuid.uuid4())
    sub_doc = {
        "id": sub_id,
        "user_id": user["id"],
        "plan_type": data.plan_type,
        "price": SUBSCRIPTION_PRICES[data.plan_type],
        "delivery_address": data.delivery_address,
        "recipient_name": data.recipient_name,
        "recipient_phone": data.recipient_phone,
        "status": "pending",
        "next_delivery": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.subscriptions.insert_one(sub_doc)
    return SubscriptionResponse(**sub_doc)

@api_router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(user = Depends(require_user)):
    subs = await db.subscriptions.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return subs

@api_router.delete("/subscriptions/{sub_id}")
async def cancel_subscription(sub_id: str, user = Depends(require_user)):
    result = await db.subscriptions.update_one(
        {"id": sub_id, "user_id": user["id"]},
        {"$set": {"status": "cancelled"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription cancelled"}

# ==================== PAYMENT ENDPOINTS ====================

@api_router.post("/checkout/session")
async def create_checkout_session(request: Request, checkout_data: CheckoutRequest):
    order = await db.orders.find_one({"id": checkout_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = f"{checkout_data.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{checkout_data.origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/checkout"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(order["total"]),
        currency="gbp",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": checkout_data.order_id,
            "user_id": order.get("user_id", "guest")
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": checkout_data.order_id,
        "user_id": order.get("user_id"),
        "amount": order["total"],
        "currency": "gbp",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction:
        if status.payment_status == "paid" and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            # Update order status
            await db.orders.update_one(
                {"id": transaction["order_id"]},
                {"$set": {"payment_status": "paid", "status": "confirmed"}}
            )
            # Clear cart
            if transaction.get("user_id"):
                await db.carts.delete_one({"user_id": transaction["user_id"]})
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            order_id = webhook_response.metadata.get("order_id")
            if order_id:
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}}
                )
                await db.payment_transactions.update_one(
                    {"order_id": order_id},
                    {"$set": {"payment_status": "paid"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ==================== ADMIN DASHBOARD ENDPOINTS ====================

@api_router.get("/admin/stats")
async def get_admin_stats(admin = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Revenue calculation
    paid_orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0, "total": 1}).to_list(1000)
    total_revenue = sum(o["total"] for o in paid_orders)
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    
    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "total_revenue": round(total_revenue, 2),
        "recent_orders": recent_orders
    }

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing_cats = await db.categories.count_documents({})
    if existing_cats > 0:
        return {"message": "Data already seeded"}
    
    # Seed categories
    categories = [
        {"id": str(uuid.uuid4()), "name": "Birthday", "slug": "birthday", "description": "Perfect flowers for birthday celebrations", "image": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400"},
        {"id": str(uuid.uuid4()), "name": "Anniversary", "slug": "anniversary", "description": "Romantic flowers for anniversaries", "image": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400"},
        {"id": str(uuid.uuid4()), "name": "Sympathy", "slug": "sympathy", "description": "Thoughtful arrangements for difficult times", "image": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400"},
        {"id": str(uuid.uuid4()), "name": "Thank You", "slug": "thank-you", "description": "Express gratitude with beautiful blooms", "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400"},
        {"id": str(uuid.uuid4()), "name": "Roses", "slug": "roses", "description": "Classic and elegant rose arrangements", "image": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400"},
        {"id": str(uuid.uuid4()), "name": "Plants", "slug": "plants", "description": "Long-lasting potted plants", "image": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400"}
    ]
    
    for cat in categories:
        cat["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.categories.insert_many(categories)
    
    # Seed products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Rose & Lily Elegance",
            "description": "A stunning arrangement of fresh roses and oriental lilies, perfect for any special occasion.",
            "price": 49.99,
            "original_price": 64.99,
            "category_id": categories[4]["id"],
            "images": ["https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/90a90391c07e0c35d79733aaf9fde040095ee04bb0fae08557c56af10e0dc600.png"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Deluxe", "price_modifier": 15}, {"name": "Premium", "price_modifier": 30}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["birthday", "anniversary", "thank-you"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Spring Meadow Bouquet",
            "description": "A vibrant mix of seasonal blooms capturing the essence of spring.",
            "price": 39.99,
            "original_price": None,
            "category_id": categories[0]["id"],
            "images": ["https://static.prod-images.emergentagent.com/jobs/77ed8462-0ac3-44b4-858b-fec4491532f7/images/c3e02374003409a1a8a8529e9e73dcbdf29e00fe424556c11b7c8e1bb19d37eb.png"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Deluxe", "price_modifier": 12}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["birthday", "thank-you"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Romantic Red Roses",
            "description": "Classic long-stem red roses, the ultimate symbol of love and romance.",
            "price": 54.99,
            "original_price": 69.99,
            "category_id": categories[4]["id"],
            "images": ["https://images.unsplash.com/photo-1603983856087-c175061451de?w=600"],
            "sizes": [{"name": "12 Roses", "price_modifier": 0}, {"name": "24 Roses", "price_modifier": 35}, {"name": "36 Roses", "price_modifier": 65}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["anniversary", "birthday"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Peaceful Whites",
            "description": "A serene arrangement of white lilies and roses, perfect for expressing sympathy.",
            "price": 44.99,
            "original_price": None,
            "category_id": categories[2]["id"],
            "images": ["https://images.unsplash.com/photo-1774959725056-9556b06c8806?w=600"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Large", "price_modifier": 20}],
            "in_stock": True,
            "featured": False,
            "occasion_tags": ["sympathy"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sunshine Celebration",
            "description": "Bright sunflowers and cheerful daisies to brighten anyone's day.",
            "price": 34.99,
            "original_price": None,
            "category_id": categories[3]["id"],
            "images": ["https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Deluxe", "price_modifier": 10}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["thank-you", "birthday"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Orchid Paradise",
            "description": "Elegant phalaenopsis orchid in a decorative ceramic pot.",
            "price": 59.99,
            "original_price": 74.99,
            "category_id": categories[5]["id"],
            "images": ["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600"],
            "sizes": [{"name": "Single Stem", "price_modifier": 0}, {"name": "Double Stem", "price_modifier": 25}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["birthday", "anniversary", "thank-you"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pastel Dreams",
            "description": "Soft pastel blooms in pink, lavender, and cream for a gentle touch.",
            "price": 42.99,
            "original_price": None,
            "category_id": categories[0]["id"],
            "images": ["https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Premium", "price_modifier": 18}],
            "in_stock": True,
            "featured": False,
            "occasion_tags": ["birthday", "thank-you"]
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Golden Anniversary",
            "description": "Luxurious golden and cream roses for milestone celebrations.",
            "price": 79.99,
            "original_price": 99.99,
            "category_id": categories[1]["id"],
            "images": ["https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Grand", "price_modifier": 40}],
            "in_stock": True,
            "featured": True,
            "occasion_tags": ["anniversary"]
        }
    ]
    
    for prod in products:
        prod["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.insert_many(products)
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "email": "admin@petals.com",
        "password": hash_password("admin123"),
        "name": "Admin User",
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_doc)
    
    return {"message": "Data seeded successfully", "categories": len(categories), "products": len(products)}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Petals Online Florist API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
