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
    media: Optional[List[Dict]] = None
    sizes: Optional[List[Dict]] = None
    in_stock: bool = True
    featured: bool = False
    occasion_tags: List[str] = []
    is_bouquet: bool = True

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category_id: str
    category_name: Optional[str] = None
    images: List[str]
    media: Optional[List[Dict]] = None
    sizes: Optional[List[Dict]] = None
    in_stock: bool
    featured: bool
    occasion_tags: List[str]
    is_bouquet: bool = True
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
    box_personalization: Optional[Dict] = None  # {color, ribbon_color, custom_message}
    # Bloom & Wild send-flow extras (all optional, populated by PDP stepper)
    card_id: Optional[str] = None
    card_message: Optional[str] = None
    box_choice: Optional[str] = None              # "kraft" | "vase" | "personalised"
    box_design_url: Optional[str] = None          # rendered preview from Phase 3 designer
    addon_ids: Optional[List[str]] = None

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

class PortfolioItemResponse(BaseModel):
    id: str
    title: str
    category: str  # wedding, sympathy, corporate, house, shop
    description: str
    image: str
    location: Optional[str] = None
    price_from: Optional[float] = None
    tags: List[str] = []
    featured: bool = False
    created_at: str

class PortfolioInquiry(BaseModel):
    portfolio_item_id: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    event_date: Optional[str] = None
    budget: Optional[str] = None
    message: str
    service_type: Optional[str] = None

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
    """Get delivery date options and box personalization choices.
    Honours admin-configurable rules from site_settings:
      - delivery_min_lead_days
      - delivery_blocked_weekdays (0=Mon..6=Sun)
      - delivery_blocked_dates (YYYY-MM-DD list)
      - delivery_window_days
    """
    from datetime import date
    settings = await _get_settings_dict()
    min_lead = max(0, int(settings.get("delivery_min_lead_days", 4)))
    blocked_wkd = set(int(d) for d in settings.get("delivery_blocked_weekdays", [6]))
    blocked_dates = set(settings.get("delivery_blocked_dates", []))
    window = max(7, int(settings.get("delivery_window_days", 28)))

    today = date.today()
    available_dates = []
    check_date = today + timedelta(days=min_lead)

    end_date = today + timedelta(days=min_lead + window)
    while check_date <= end_date:
        iso = check_date.isoformat()
        if check_date.weekday() not in blocked_wkd and iso not in blocked_dates:
            is_saturday = check_date.weekday() == 5
            available_dates.append({
                "date": iso,
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
        "rules": {
            "min_lead_days": min_lead,
            "blocked_weekdays": sorted(list(blocked_wkd)),
            "blocked_dates": sorted(list(blocked_dates)),
        },
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
    settings = await _get_settings_dict()
    min_lead = max(0, int(settings.get("delivery_min_lead_days", 4)))
    blocked_wkd = set(int(d) for d in settings.get("delivery_blocked_weekdays", [6]))
    blocked_dates = set(settings.get("delivery_blocked_dates", []))
    min_delivery_date = today + timedelta(days=min_lead)

    if delivery_date < min_delivery_date:
        raise HTTPException(status_code=400, detail=f"Delivery date must be at least {min_lead} days from today")

    if delivery_date.weekday() in blocked_wkd:
        raise HTTPException(status_code=400, detail="Delivery is unavailable on this weekday")

    if delivery_date.isoformat() in blocked_dates:
        raise HTTPException(status_code=400, detail="Delivery is unavailable on this date")

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

# ==================== PORTFOLIO & INQUIRY ENDPOINTS ====================

@api_router.get("/portfolio", response_model=List[PortfolioItemResponse])
async def get_portfolio(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    items = await db.portfolio.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api_router.get("/portfolio/{item_id}", response_model=PortfolioItemResponse)
async def get_portfolio_item(item_id: str):
    item = await db.portfolio.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return item

@api_router.post("/inquiries")
async def create_inquiry(data: PortfolioInquiry):
    inquiry_id = str(uuid.uuid4())
    inquiry_doc = {
        "id": inquiry_id,
        **data.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.inquiries.insert_one(inquiry_doc)
    logger.info(f"New inquiry received: {inquiry_id} from {data.email}")
    return {"id": inquiry_id, "message": "Inquiry received. We will be in touch within 24 hours."}

@api_router.get("/admin/inquiries")
async def get_admin_inquiries(admin = Depends(require_admin)):
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return inquiries

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data(reset: bool = False):
    # Always reseed if reset=true or if versioning changes
    existing_version = await db.system.find_one({"key": "seed_version"}, {"_id": 0})
    current_version = "v6-ready-collection-r3"
    already_current = existing_version and existing_version.get("value") == current_version

    if already_current and not reset:
        return {"message": "Data already seeded", "version": current_version}

    # Wipe catalog/portfolio data for a clean reseed
    await db.categories.delete_many({})
    await db.products.delete_many({})
    await db.portfolio.delete_many({})

    # Premium luxury categories (light aesthetic)
    categories = [
        {"id": str(uuid.uuid4()), "name": "Signature Bouquets", "slug": "signature-bouquets", "description": "Hand-tied, editorial arrangements — from £80", "image": "https://images.pexels.com/photos/33886749/pexels-photo-33886749.png"},
        {"id": str(uuid.uuid4()), "name": "Weddings", "slug": "wedding", "description": "Bridal couture floristry and ceremonial design", "image": "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=800"},
        {"id": str(uuid.uuid4()), "name": "Sympathy", "slug": "sympathy", "description": "Thoughtful, dignified tributes crafted with care", "image": "https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=800"},
        {"id": str(uuid.uuid4()), "name": "Celebration", "slug": "celebration", "description": "Arrangements for anniversaries, birthdays and milestones", "image": "https://images.pexels.com/photos/33886745/pexels-photo-33886745.png"},
        {"id": str(uuid.uuid4()), "name": "Garden Roses", "slug": "garden-roses", "description": "Signature long-stem and English garden roses", "image": "https://images.unsplash.com/photo-1760373071711-960143464e34?w=800"},
        {"id": str(uuid.uuid4()), "name": "Orchids & Exotics", "slug": "exotics", "description": "Rare cultivars and sculptural stems", "image": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800"},
        {"id": str(uuid.uuid4()), "name": "Ready Tributes", "slug": "ready-tributes", "description": "Standard-size pieces — order direct, no consultation required", "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800"},
    ]
    for cat in categories:
        cat["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.categories.insert_many(categories)

    # Premium products £80+ — light-luxury imagery
    products = [
        {
            "id": str(uuid.uuid4()), "name": "The Mayfair",
            "description": "An editorial composition of garden roses, peonies and ranunculus in ivory and blush — hand-tied and presented in our signature ivory box.",
            "price": 185.00, "original_price": None, "category_id": categories[0]["id"],
            "images": ["https://images.pexels.com/photos/33886749/pexels-photo-33886749.png"],
            "sizes": [{"name": "Petite", "price_modifier": 0}, {"name": "Maison", "price_modifier": 65}, {"name": "Grande", "price_modifier": 140}],
            "in_stock": True, "featured": True, "occasion_tags": ["anniversary", "birthday", "celebration"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Eternal Ivory",
            "description": "White peonies, cream garden roses, astilbe and delicate eucalyptus — a study in quiet elegance.",
            "price": 125.00, "original_price": None, "category_id": categories[0]["id"],
            "images": ["https://images.pexels.com/photos/33886745/pexels-photo-33886745.png"],
            "sizes": [{"name": "Classic", "price_modifier": 0}, {"name": "Luxe", "price_modifier": 55}, {"name": "Grand", "price_modifier": 110}],
            "in_stock": True, "featured": True, "occasion_tags": ["anniversary", "thank-you", "celebration"],
        },
        {
            "id": str(uuid.uuid4()), "name": "The Belgravia Bride",
            "description": "A couture bridal bouquet of David Austin roses, ranunculus and trailing jasmine. Includes complimentary boutonnière.",
            "price": 245.00, "original_price": None, "category_id": categories[1]["id"],
            "images": ["https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1200"],
            "sizes": [{"name": "Bridal", "price_modifier": 0}, {"name": "Statement", "price_modifier": 95}],
            "in_stock": True, "featured": True, "occasion_tags": ["wedding"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Quiet Grace",
            "description": "A sympathy tribute of white lilies, lisianthus and soft sage — crafted with discretion and respect.",
            "price": 165.00, "original_price": None, "category_id": categories[2]["id"],
            "images": ["https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1200"],
            "sizes": [{"name": "Classic", "price_modifier": 0}, {"name": "Grand Spray", "price_modifier": 75}, {"name": "Standing Tribute", "price_modifier": 145}],
            "in_stock": True, "featured": False, "occasion_tags": ["sympathy", "funeral"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Rose Couture — 100 Stem",
            "description": "One hundred long-stem garden roses in ivory and blush, presented in our ribboned maison box. The ultimate romantic gesture.",
            "price": 345.00, "original_price": None, "category_id": categories[4]["id"],
            "images": ["https://images.unsplash.com/photo-1760373071711-960143464e34?w=1200"],
            "sizes": [{"name": "50 Stem", "price_modifier": -120}, {"name": "100 Stem", "price_modifier": 0}, {"name": "150 Stem", "price_modifier": 180}],
            "in_stock": True, "featured": True, "occasion_tags": ["anniversary", "proposal", "celebration"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Phalaenopsis Atelier",
            "description": "A cascading phalaenopsis arrangement in a hand-thrown ceramic vessel — living sculpture that lasts for months.",
            "price": 195.00, "original_price": None, "category_id": categories[5]["id"],
            "images": ["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200"],
            "sizes": [{"name": "Double Stem", "price_modifier": 0}, {"name": "Triple Stem", "price_modifier": 75}, {"name": "Cascade", "price_modifier": 160}],
            "in_stock": True, "featured": True, "occasion_tags": ["birthday", "thank-you", "corporate"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Jardin de Provence",
            "description": "A painterly gathering of sweet peas, roses and hellebores in soft lavender and dusty rose tones.",
            "price": 135.00, "original_price": None, "category_id": categories[0]["id"],
            "images": ["https://images.unsplash.com/photo-1587271636175-4f7c5e5d9cfa?w=1200"],
            "sizes": [{"name": "Signature", "price_modifier": 0}, {"name": "Luxe", "price_modifier": 60}],
            "in_stock": True, "featured": False, "occasion_tags": ["birthday", "anniversary"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Celebration Blush",
            "description": "A joyful composition in soft blush and peach — roses, ranunculus, tulips and spray stocks for life's milestones.",
            "price": 115.00, "original_price": None, "category_id": categories[3]["id"],
            "images": ["https://images.unsplash.com/photo-1737276681566-bd86b399dafe?w=1200"],
            "sizes": [{"name": "Luxe", "price_modifier": 0}, {"name": "Grande", "price_modifier": 55}, {"name": "Extraordinaire", "price_modifier": 110}],
            "in_stock": True, "featured": True, "occasion_tags": ["birthday", "congratulations", "celebration"],
        },

        # ───── THE READY COLLECTION ─────
        # Order-direct standard-size pieces — no consultation required
        {
            "id": str(uuid.uuid4()), "name": "Letter Tribute — 1ft 'DAD'",
            "description": "A 1-foot floral letter tribute in red carnation and white chrysanthemum on a bespoke timber frame. Standard size, ready for next-day delivery anywhere in the UK.",
            "price": 180.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "1ft", "price_modifier": 0}, {"name": "2ft", "price_modifier": 140}],
            "in_stock": True, "featured": True, "occasion_tags": ["ready", "traveller_funeral", "sympathy", "letter"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Letter Tribute — 1ft 'MUM'",
            "description": "A 1-foot 'MUM' floral letter in classic white chrysanthemum with red rose detailing, on bespoke timber frame.",
            "price": 180.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "1ft", "price_modifier": 0}, {"name": "2ft", "price_modifier": 140}],
            "in_stock": True, "featured": True, "occasion_tags": ["ready", "traveller_funeral", "sympathy", "letter"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Letter Tribute — 1ft 'NAN'",
            "description": "A 1-foot 'NAN' floral letter tribute, hand-built in soft pastel chrysanthemum and ivory rose.",
            "price": 180.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "1ft", "price_modifier": 0}, {"name": "2ft", "price_modifier": 140}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "traveller_funeral", "sympathy", "letter"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Classic Heart Tribute",
            "description": "A traditional 14-inch heart tribute in red roses with white lily detail and hand-tied satin ribbon. Standard-size, no consultation required.",
            "price": 220.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Large 18\"", "price_modifier": 85}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "sympathy", "traveller_funeral", "heart"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Classic White Wreath",
            "description": "A 14-inch circular wreath in white chrysanthemum, lily and seasonal greenery — a timeless standard form for any service.",
            "price": 165.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1200"],
            "sizes": [{"name": "14\"", "price_modifier": 0}, {"name": "18\"", "price_modifier": 70}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "sympathy", "wreath"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Floral Cross — 2ft",
            "description": "A traditional 2-foot floral cross in white chrysanthemum with optional gold or silver ribbon trim. Ready to dispatch.",
            "price": 280.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200"],
            "sizes": [{"name": "2ft", "price_modifier": 0}, {"name": "3ft", "price_modifier": 160}],
            "in_stock": True, "featured": True, "occasion_tags": ["ready", "sympathy", "traveller_funeral", "cross"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Gates of Heaven — 2ft",
            "description": "A classic 2-foot Gates of Heaven tribute with cross detailing, in white chrysanthemum with delicate ribbon work.",
            "price": 380.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200"],
            "sizes": [{"name": "2ft", "price_modifier": 0}, {"name": "3ft", "price_modifier": 220}],
            "in_stock": True, "featured": True, "occasion_tags": ["ready", "traveller_funeral", "sympathy", "gates"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Sympathy Casket Spray — Classic",
            "description": "A standard-size casket spray in white roses, lily and lisianthus — designed to sit beautifully on a closed casket.",
            "price": 275.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200"],
            "sizes": [{"name": "Standard", "price_modifier": 0}, {"name": "Large", "price_modifier": 95}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "sympathy", "casket"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Quiet Lily Tribute",
            "description": "A respectful hand-tied bouquet of white lily and pale roses — sent with a hand-finished sympathy card.",
            "price": 140.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1200"],
            "sizes": [{"name": "Classic", "price_modifier": 0}, {"name": "Luxe", "price_modifier": 60}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "sympathy", "bouquet"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Bridesmaid Posy — Standard",
            "description": "A standard-size bridesmaid posy in ivory garden roses, lisianthus and seasonal foliage. Multiple posies ship together — perfect when consultation isn't needed.",
            "price": 85.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "Posy", "price_modifier": 0}, {"name": "Luxe Posy", "price_modifier": 35}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "wedding", "traveller_wedding", "bridesmaid"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Wedding Buttonhole",
            "description": "A classic buttonhole / boutonnière in ivory spray rose, eucalyptus and pearl pin. Sold individually — order direct for the wedding party.",
            "price": 25.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "Classic", "price_modifier": 0}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "wedding", "traveller_wedding", "buttonhole"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Ready Bridal Posy — Ivory",
            "description": "A ready-to-order bridal posy in ivory garden roses, lily-of-the-valley and trailing eucalyptus — for intimate ceremonies and registry weddings.",
            "price": 245.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200"],
            "sizes": [{"name": "Bridal", "price_modifier": 0}],
            "in_stock": True, "featured": True, "occasion_tags": ["ready", "wedding", "bridal"],
        },
        {
            "id": str(uuid.uuid4()), "name": "Mehndi Garland — Marigold",
            "description": "A standard-length marigold and rose garland for Mehndi events — ready to order when consultation isn't required.",
            "price": 95.00, "original_price": None, "category_id": categories[6]["id"],
            "images": ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200"],
            "sizes": [{"name": "Standard 4ft", "price_modifier": 0}, {"name": "6ft", "price_modifier": 40}],
            "in_stock": True, "featured": False, "occasion_tags": ["ready", "faith_wedding", "mehndi"],
        },
    ]
    for prod in products:
        prod["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_many(products)

    # Bespoke portfolio items (past works) — 6 per category for a fuller mini-grid
    portfolio_items = [
        # ───── WEDDINGS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Kensington Orangery Wedding",
            "category": "wedding",
            "description": "A blush & ivory ceremony arch with trailing roses, garden anemones and seasonal greenery — designed for a summer wedding in West London.",
            "image": "https://images.unsplash.com/photo-1631377058001-185f5f811bf2?w=1400",
            "location": "Kensington, London", "price_from": 3500.0,
            "tags": ["arch", "ceremony", "blush", "ivory"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Whitehall Reception Tablescape",
            "category": "wedding",
            "description": "Low-profile runners of ranunculus, roses and clouds of gypsophila — designed to sit below eye-line for intimate conversation.",
            "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400",
            "location": "Whitehall, London", "price_from": 2200.0,
            "tags": ["tablescape", "reception", "runner"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Cotswolds Country House Wedding",
            "category": "wedding",
            "description": "Wild, garden-gathered florals across a marquee installation for a 200-guest country wedding.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Stow-on-the-Wold, Cotswolds", "price_from": 7500.0,
            "tags": ["marquee", "country", "wild"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Claridge's Ballroom Reception",
            "category": "wedding",
            "description": "Twelve elevated centrepieces of phalaenopsis, peony and trailing amaranthus for a black-tie ballroom dinner.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Claridge's, Mayfair", "price_from": 8500.0,
            "tags": ["ballroom", "elevated", "black-tie"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Italian Villa Destination Wedding",
            "category": "wedding",
            "description": "A Mediterranean-inspired ceremony aisle and dinner installation for a destination wedding on Lake Como.",
            "image": "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1400",
            "location": "Lake Como, Italy", "price_from": 12000.0,
            "tags": ["destination", "italy", "aisle"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Intimate Chelsea Registry",
            "category": "wedding",
            "description": "A delicate bridal posy and matching boutonnière in cream garden roses and lily-of-the-valley.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Chelsea Old Town Hall", "price_from": 450.0,
            "tags": ["intimate", "posy", "registry"], "featured": False,
        },

        # ───── SYMPATHY (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Quiet Farewell Tribute",
            "category": "sympathy",
            "description": "A bespoke memorial piece in soft white and sage — created for a family who wished to honour a mother who loved English gardens.",
            "image": "https://images.unsplash.com/photo-1602285415607-faa4007a0bca?w=1400",
            "location": "Private service", "price_from": 450.0,
            "tags": ["sympathy", "memorial", "white"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Letter Tribute — MOTHER",
            "category": "sympathy",
            "description": "A hand-crafted floral lettering tribute in ivory roses and white lisianthus — a quiet, dignified final tribute.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Private service", "price_from": 650.0,
            "tags": ["tribute", "lettering", "ivory"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Coffin Spray — Garden Whites",
            "category": "sympathy",
            "description": "A trailing coffin spray of white roses, lisianthus and seasonal greenery — soft, dignified, deeply considered.",
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1400",
            "location": "St. Marylebone Crematorium", "price_from": 350.0,
            "tags": ["coffin spray", "white"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Standing Easel — Soft Lilac",
            "category": "sympathy",
            "description": "A standing easel tribute in soft lilac, white and silver-greens, designed for a celebration of life service.",
            "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1400",
            "location": "Westminster", "price_from": 280.0,
            "tags": ["easel", "lilac"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Heart Tribute — Eternal Love",
            "category": "sympathy",
            "description": "A classic heart-shaped tribute of red roses and white lily, finished with a hand-tied ribbon and personal card.",
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1400",
            "location": "North London Cemetery", "price_from": 220.0,
            "tags": ["heart", "classic", "red"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Wreath — Wild Meadow",
            "category": "sympathy",
            "description": "A circular wreath of wildflowers, seeded eucalyptus and ranunculus — for someone who loved the countryside.",
            "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1400",
            "location": "Devon", "price_from": 320.0,
            "tags": ["wreath", "wild"], "featured": False,
        },

        # ───── CORPORATE (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Mayfair Private Members' Club",
            "category": "corporate",
            "description": "Weekly floral installs across three bars and a dining room — a rotating programme of seasonal statement arrangements.",
            "image": "https://images.unsplash.com/photo-1768508949823-26255327c264?w=1400",
            "location": "Mayfair, London", "price_from": 1800.0,
            "tags": ["corporate", "weekly install", "hospitality"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Product Launch — Bond Street",
            "category": "corporate",
            "description": "A statement entrance arch and six reception pedestals in monochrome ivory for a luxury fashion launch.",
            "image": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400",
            "location": "Bond Street, London", "price_from": 4500.0,
            "tags": ["corporate", "launch", "event"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Royal Opera House Gala",
            "category": "corporate",
            "description": "Twenty-four cocktail-table arrangements and a grand foyer installation for a charity gala dinner.",
            "image": "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1400",
            "location": "Royal Opera House, Covent Garden", "price_from": 6800.0,
            "tags": ["gala", "charity", "foyer"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Tech Awards — The Shard",
            "category": "corporate",
            "description": "A geometric, modern installation of structured greenery and white roses for an industry awards ceremony.",
            "image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400",
            "location": "The Shard, London", "price_from": 5200.0,
            "tags": ["awards", "modern", "architectural"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Five-Star Hotel Lobby Programme",
            "category": "corporate",
            "description": "Bi-weekly grand lobby installations with seasonal palette rotation — ongoing two-year programme.",
            "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
            "location": "Knightsbridge, London", "price_from": 2400.0,
            "tags": ["hotel", "lobby", "programme"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Press Day — Mayfair Maison",
            "category": "corporate",
            "description": "A press-day floral styling with bouquet stations and a photogenic arch for a fashion house's press preview.",
            "image": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400",
            "location": "Mayfair, London", "price_from": 3200.0,
            "tags": ["press", "fashion", "styling"], "featured": False,
        },

        # ───── HOUSE INSTALLS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Notting Hill Residence",
            "category": "house",
            "description": "A fortnightly house-floral programme across entrance hall, kitchen island and dining table for a private residence.",
            "image": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400",
            "location": "Notting Hill, London", "price_from": 750.0,
            "tags": ["house install", "residential", "subscription"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Chelsea Townhouse Staircase",
            "category": "house",
            "description": "A cascading seasonal installation down a three-floor staircase for a private anniversary dinner at home.",
            "image": "https://images.unsplash.com/photo-1543699936-c901ddbf0c05?w=1400",
            "location": "Chelsea, London", "price_from": 2800.0,
            "tags": ["house install", "statement", "cascade"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Holland Park Drawing Room",
            "category": "house",
            "description": "A weekly drawing-room arrangement in a hand-thrown ceramic vessel — alongside fresh kitchen and bedside posies.",
            "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400",
            "location": "Holland Park, London", "price_from": 450.0,
            "tags": ["weekly", "drawing room"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Belgravia Hallway Installation",
            "category": "house",
            "description": "A monumental entrance hallway installation for a private dinner — designed to greet guests on arrival.",
            "image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400",
            "location": "Belgravia, London", "price_from": 1850.0,
            "tags": ["entrance", "statement"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Hampstead Country Kitchen",
            "category": "house",
            "description": "A bi-weekly kitchen-led programme: a large central arrangement plus smaller pieces for the breakfast nook and pantry.",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400",
            "location": "Hampstead, London", "price_from": 380.0,
            "tags": ["kitchen", "bi-weekly"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Country Estate — Annual Programme",
            "category": "house",
            "description": "A full annual programme across principal rooms of a country estate, including seasonal swap-outs and special-occasion installs.",
            "image": "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=1400",
            "location": "Surrey", "price_from": 12000.0,
            "tags": ["estate", "annual", "programme"], "featured": True,
        },

        # ───── TRAVELLER WEDDINGS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Cinderella Carriage Entrance",
            "category": "traveller_wedding",
            "description": "A 12-foot floral horse-drawn carriage centrepiece for a traveller wedding entrance — built in white roses, baby's breath and lily.",
            "image": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400",
            "location": "Essex", "price_from": 8500.0,
            "tags": ["carriage", "grand entrance", "white"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "4ft Floral Light-Up Letters",
            "category": "traveller_wedding",
            "description": "Custom-built 4-foot light-up letters spelling the couple's names, hand-finished with roses, hydrangea and trailing greenery.",
            "image": "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1400",
            "location": "Kent", "price_from": 3200.0,
            "tags": ["letters", "light-up", "names"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Castle Ceremony Backdrop",
            "category": "traveller_wedding",
            "description": "A fairytale-castle floral backdrop for the ceremony — towers, turrets and trailing roses in cream and pale pink.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Hertfordshire", "price_from": 12500.0,
            "tags": ["castle", "backdrop", "fairytale"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Statement Top Table Run",
            "category": "traveller_wedding",
            "description": "A 30-foot continuous floral runner across the top table — peonies, garden roses, hydrangea and trailing amaranthus.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Essex", "price_from": 4800.0,
            "tags": ["top table", "runner", "statement"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Floral Cake Wall — 8ft",
            "category": "traveller_wedding",
            "description": "An 8-foot wide floral wall framing a 7-tier wedding cake — ivory roses, blush peonies and crystal accents.",
            "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400",
            "location": "Surrey", "price_from": 3800.0,
            "tags": ["cake wall", "backdrop", "ivory"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Horse & Carriage Floral Drape",
            "category": "traveller_wedding",
            "description": "A full floral drape for the bridal horse and carriage on arrival — to match the ceremony palette throughout.",
            "image": "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1400",
            "location": "Surrey", "price_from": 1650.0,
            "tags": ["horse", "carriage", "drape"], "featured": False,
        },

        # ───── TRAVELLER FUNERALS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "3ft 'DAD' Letter Tribute",
            "category": "traveller_funeral",
            "description": "A 3-foot floral letter tribute in red carnations and white chrysanthemum, set in a bespoke timber frame.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "London", "price_from": 650.0,
            "tags": ["letter tribute", "3ft", "dad"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Floral Caravan Build",
            "category": "traveller_funeral",
            "description": "A 6-foot 3D floral caravan tribute — fully built on a steel frame with white chrysanthemum, red carnation detailing and a personalised registration plate.",
            "image": "https://images.unsplash.com/photo-1502943693086-33b5b1cfdf2f?w=1400",
            "location": "Essex", "price_from": 2800.0,
            "tags": ["3D build", "caravan", "bespoke frame"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Floral Horse Tribute",
            "category": "traveller_funeral",
            "description": "A life-size 3D floral horse tribute with floral mane, in honour of a passionate horseman — white and pale blue carnations.",
            "image": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1400",
            "location": "Kent", "price_from": 3500.0,
            "tags": ["3D build", "horse", "white"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Gates of Heaven — 5ft",
            "category": "traveller_funeral",
            "description": "A 5-foot Gates of Heaven tribute with cross detailing, in white chrysanthemum with gold and silver ribbon work.",
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1400",
            "location": "London", "price_from": 850.0,
            "tags": ["gates of heaven", "tribute", "white"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Floral Pint & Glass Tribute",
            "category": "traveller_funeral",
            "description": "A bespoke 3-foot floral pint glass tribute for a beloved publican — finished with a foam-head detail and amber-tone carnations.",
            "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1400",
            "location": "Birmingham", "price_from": 580.0,
            "tags": ["3D build", "personalised", "pint"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Football Crest Tribute",
            "category": "traveller_funeral",
            "description": "A 4-foot football club crest tribute in club colours — hand-built on bespoke timber frame, finished with the team name.",
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1400",
            "location": "Glasgow", "price_from": 720.0,
            "tags": ["crest", "football", "personalised"], "featured": False,
        },

        # ───── FAITH & CULTURAL WEDDINGS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Sikh Anand Karaj — Gurdwara Garlands",
            "category": "faith_wedding",
            "description": "Marigold and rose garlands for the gurdwara, palki canopy decoration, and mala for the groom and bride.",
            "image": "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=1400",
            "location": "Southall, London", "price_from": 4200.0,
            "tags": ["sikh", "gurdwara", "garlands"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Hindu Mandap Installation",
            "category": "faith_wedding",
            "description": "A four-pillar floral mandap with marigold thoran, varmala for garland exchange, and full kalash decoration.",
            "image": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1400",
            "location": "Wembley, London", "price_from": 6800.0,
            "tags": ["hindu", "mandap", "marigold"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Jewish Chuppah Canopy",
            "category": "faith_wedding",
            "description": "A floral chuppah of white peonies, garden roses and orchids — with matching ketubah signing table arrangement.",
            "image": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400",
            "location": "Hampstead, London", "price_from": 5400.0,
            "tags": ["jewish", "chuppah", "white"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Muslim Nikah — Cream & Gold",
            "category": "faith_wedding",
            "description": "A Nikah ceremony floral design in cream, gold and white — with a separate vibrant palette for the mehndi event.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Edgware Road, London", "price_from": 5800.0,
            "tags": ["muslim", "nikah", "cream gold"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Greek Orthodox Stephana & Church Arch",
            "category": "faith_wedding",
            "description": "Crown stephana for the bride and groom, plus a floral arch at the church entrance in white and ivory.",
            "image": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1400",
            "location": "Bayswater, London", "price_from": 3200.0,
            "tags": ["greek orthodox", "stephana", "church"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Chinese Tea Ceremony — Red & Gold",
            "category": "faith_wedding",
            "description": "A tea ceremony floral installation in red and gold, with double-happiness symbolism and traditional peony arrangements.",
            "image": "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1400",
            "location": "Chinatown, London", "price_from": 2800.0,
            "tags": ["chinese", "tea ceremony", "red gold"], "featured": False,
        },

        # ───── SHOP FRONT INSTALLS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Bond Street Boutique Window — Spring",
            "category": "shop_front",
            "description": "A six-foot floral entryway installation for a Bond Street fashion house, refreshed quarterly.",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400",
            "location": "Bond Street, London", "price_from": 4800.0,
            "tags": ["window", "fashion", "quarterly"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Sloane Street Jeweller — Christmas",
            "category": "shop_front",
            "description": "An ivory and gold floral window for a flagship jeweller — built for a 6-week Christmas display.",
            "image": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400",
            "location": "Sloane Street, London", "price_from": 6200.0,
            "tags": ["jewellery", "christmas", "window"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Beauty Hall Entrance — Knightsbridge",
            "category": "shop_front",
            "description": "Twin floral pillars framing a department store beauty hall entrance, swapped seasonally.",
            "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400",
            "location": "Knightsbridge, London", "price_from": 3400.0,
            "tags": ["beauty", "department store", "pillars"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Chelsea Bridal Boutique Façade",
            "category": "shop_front",
            "description": "A cascading floral façade above the entrance of a Chelsea bridal boutique, refreshed monthly.",
            "image": "https://images.unsplash.com/photo-1575081838238-d06e716afa28?w=1400",
            "location": "King's Road, Chelsea", "price_from": 2800.0,
            "tags": ["bridal", "façade", "cascading"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Mayfair Wine Merchant — Summer Edit",
            "category": "shop_front",
            "description": "A relaxed garden-style window install for a Mayfair wine merchant, set with summer florals.",
            "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1400",
            "location": "Mayfair, London", "price_from": 2200.0,
            "tags": ["wine", "summer", "garden style"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Notting Hill Lifestyle Store",
            "category": "shop_front",
            "description": "A flowering archway above the entrance of a Notting Hill interiors store, refreshed seasonally.",
            "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1400",
            "location": "Westbourne Grove", "price_from": 2400.0,
            "tags": ["interiors", "archway", "seasonal"], "featured": False,
        },

        # ───── IN-SHOP BESPOKE DISPLAYS (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Beauty Counter — Mascara Launch",
            "category": "in_shop_display",
            "description": "Six matching florals across the beauty counter for a luxury mascara launch — colour-coded to the product palette.",
            "image": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400",
            "location": "Selfridges, London", "price_from": 1850.0,
            "tags": ["beauty", "launch", "counter"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Watch Showroom — Soft Whites",
            "category": "in_shop_display",
            "description": "Minimal white arrangements on six display plinths for a watch showroom — refreshed bi-weekly.",
            "image": "https://images.unsplash.com/photo-1543699936-c901ddbf0c05?w=1400",
            "location": "New Bond Street", "price_from": 950.0,
            "tags": ["watch", "minimal", "white"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Bridal Boutique — Fitting Rooms",
            "category": "in_shop_display",
            "description": "Bespoke posies for each fitting room and a sculptural centre arrangement for the salon.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Hampstead, London", "price_from": 720.0,
            "tags": ["bridal", "fitting room"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Concept Store — Brand Activation",
            "category": "in_shop_display",
            "description": "A three-week floral takeover of a Soho concept store — entrance, central display and back-room styling.",
            "image": "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1400",
            "location": "Soho, London", "price_from": 4400.0,
            "tags": ["concept", "takeover", "brand"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Patisserie Counter Florals",
            "category": "in_shop_display",
            "description": "Delicate sugared-pastel florals across a Mayfair patisserie counter, swapped twice weekly.",
            "image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400",
            "location": "Mayfair, London", "price_from": 450.0,
            "tags": ["patisserie", "weekly", "pastel"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Showroom Reception — Hospitality Group",
            "category": "in_shop_display",
            "description": "A large signature reception arrangement plus four meeting-room posies, weekly.",
            "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
            "location": "London", "price_from": 680.0,
            "tags": ["showroom", "reception", "weekly"], "featured": False,
        },

        # ───── FILM, TV & PHOTOSHOOT (6) ─────
        {
            "id": str(uuid.uuid4()), "title": "Vogue Editorial — Spring Beauty",
            "category": "film_tv",
            "description": "Set florals for a Vogue beauty editorial — soft, painterly, all blush and ivory.",
            "image": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400",
            "location": "Studio shoot", "price_from": 2200.0,
            "tags": ["editorial", "beauty", "magazine"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Music Video — Floral Bath Scene",
            "category": "film_tv",
            "description": "A petal-filled bath and surrounding floral installation for a major-label music video shoot.",
            "image": "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=1400",
            "location": "East London Studios", "price_from": 4800.0,
            "tags": ["music video", "set design", "petals"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Period Drama — Country House Florals",
            "category": "film_tv",
            "description": "Period-accurate floral arrangements across a country house set for a streaming drama series.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Buckinghamshire", "price_from": 6500.0,
            "tags": ["period drama", "set", "country house"], "featured": True,
        },
        {
            "id": str(uuid.uuid4()), "title": "Fashion Lookbook — Garden Florals",
            "category": "film_tv",
            "description": "Wild garden florals styled across a Cotswolds country garden shoot for an emerging designer lookbook.",
            "image": "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400",
            "location": "Cotswolds", "price_from": 1850.0,
            "tags": ["lookbook", "fashion", "garden"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Beauty Campaign — Macro Florals",
            "category": "film_tv",
            "description": "Bespoke single-stem hero florals for a global skincare campaign — macro-photographed for product imagery.",
            "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400",
            "location": "Soho Studios", "price_from": 1450.0,
            "tags": ["campaign", "skincare", "macro"], "featured": False,
        },
        {
            "id": str(uuid.uuid4()), "title": "Talk Show — Daily Studio Florals",
            "category": "film_tv",
            "description": "A two-year programme of daily floral arrangements for a long-running daytime talk show studio set.",
            "image": "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1400",
            "location": "Television Centre, London", "price_from": 720.0,
            "tags": ["tv", "studio", "daily"], "featured": False,
        },

        # ───── SHOP / WINDOW ─────
        {
            "id": str(uuid.uuid4()), "title": "Atelier Window — Spring Edit",
            "category": "shop",
            "description": "Our own boutique window for Spring — a hanging cloud of blush hydrangea, ranunculus and sweet peas.",
            "image": "https://images.unsplash.com/photo-1575081838238-d06e716afa28?w=1400",
            "location": "Our Atelier", "price_from": None,
            "tags": ["window", "shop display", "seasonal"], "featured": False,
        },
    ]
    for item in portfolio_items:
        item["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.portfolio.insert_many(portfolio_items)

    # Ensure admin user exists (idempotent)
    admin_email = "admin@petalsatelier.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hash_password("admin123"),
            "name": "Admin",
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(admin_doc)

    # Record version
    await db.system.update_one(
        {"key": "seed_version"},
        {"$set": {"key": "seed_version", "value": current_version, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )

    return {
        "message": "Light-luxury catalogue seeded successfully",
        "version": current_version,
        "categories": len(categories),
        "products": len(products),
        "portfolio_items": len(portfolio_items),
    }

# ==================== SITE SETTINGS ====================

class SiteSettings(BaseModel):
    utility_bar_text: str = ""
    utility_bar_enabled: bool = True
    whatsapp_number: str = ""  # E.164 digits-only, e.g. "447123456789"
    whatsapp_enabled: bool = True
    whatsapp_default_message: str = "Hello Petals Atelier — I'd like to enquire about your floristry."
    # Tracking pixels
    meta_pixel_id: str = ""
    ga4_id: str = ""           # e.g. G-XXXXXXX
    gtm_id: str = ""           # e.g. GTM-XXXXXX (optional)
    cookie_consent_required: bool = True  # UK GDPR: hold pixels until user accepts
    # Delivery rules (used by /delivery/options + order validation)
    delivery_min_lead_days: int = 4
    delivery_blocked_weekdays: List[int] = [6]   # 0=Mon..6=Sun, default Sun blocked
    delivery_blocked_dates: List[str] = []       # ["2026-12-24", "2026-12-25"]
    delivery_window_days: int = 28               # how many days ahead to surface
    # Default SEO fallbacks (used when a route has no per-page override)
    seo_default_title: str = "Petals Atelier — London Luxury Floristry"
    seo_default_description: str = "Bespoke wedding, sympathy and corporate floristry in London. Editorial design, dignified service, delivered nationwide."
    seo_default_og_image: str = ""
    seo_site_name: str = "Petals Atelier"

DEFAULT_SETTINGS = SiteSettings(
    utility_bar_text="",
    whatsapp_number="447123456789",
    whatsapp_default_message="Hello Petals Atelier — I'd like to enquire about your floristry.",
).model_dump()

@api_router.get("/settings")
async def get_settings():
    doc = await db.site_settings.find_one({"_id": "global"}, {"_id": 0})
    if not doc:
        await db.site_settings.update_one(
            {"_id": "global"},
            {"$set": DEFAULT_SETTINGS},
            upsert=True,
        )
        return DEFAULT_SETTINGS
    merged = {**DEFAULT_SETTINGS, **doc}
    return merged

@api_router.put("/settings")
async def update_settings(data: SiteSettings, admin=Depends(require_admin)):
    payload = data.model_dump()
    await db.site_settings.update_one(
        {"_id": "global"},
        {"$set": payload},
        upsert=True,
    )
    return payload

async def _get_settings_dict() -> dict:
    doc = await db.site_settings.find_one({"_id": "global"}, {"_id": 0})
    return {**DEFAULT_SETTINGS, **(doc or {})}

# ==================== CARDS & ADD-ONS ====================

class CardCreate(BaseModel):
    name: str
    image_url: str
    description: Optional[str] = ""
    price: float = 0.0
    category: Optional[str] = "general"   # birthday | thank-you | sympathy | wedding | general
    sort_order: int = 0
    active: bool = True

class CardResponse(CardCreate):
    id: str

class AddonCreate(BaseModel):
    name: str
    image_url: str
    description: Optional[str] = ""
    price: float
    sub_type: str   # "treat" | "candle" | "jewellery_box"
    sort_order: int = 0
    active: bool = True

class AddonResponse(AddonCreate):
    id: str

ALLOWED_ADDON_SUBTYPES = {"treat", "candle", "jewellery_box"}


@api_router.get("/cards", response_model=List[CardResponse])
async def list_cards(active_only: bool = True):
    q = {"active": True} if active_only else {}
    docs = await db.cards.find(q).sort([("sort_order", 1), ("name", 1)]).to_list(length=500)
    return [CardResponse(**{**d, "id": d["id"]}) for d in docs]

@api_router.post("/admin/cards", response_model=CardResponse)
async def create_card(data: CardCreate, admin=Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.cards.insert_one(doc)
    return CardResponse(**doc)

@api_router.put("/admin/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, data: CardCreate, admin=Depends(require_admin)):
    payload = data.model_dump()
    res = await db.cards.update_one({"id": card_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, "Card not found")
    return CardResponse(id=card_id, **payload)

@api_router.delete("/admin/cards/{card_id}")
async def delete_card(card_id: str, admin=Depends(require_admin)):
    res = await db.cards.delete_one({"id": card_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Card not found")
    return {"deleted": card_id}


@api_router.get("/addons", response_model=List[AddonResponse])
async def list_addons(sub_type: Optional[str] = None, active_only: bool = True):
    q = {}
    if active_only:
        q["active"] = True
    if sub_type:
        if sub_type not in ALLOWED_ADDON_SUBTYPES:
            raise HTTPException(400, "Invalid sub_type")
        q["sub_type"] = sub_type
    docs = await db.addons.find(q).sort([("sort_order", 1), ("name", 1)]).to_list(length=500)
    return [AddonResponse(**{**d, "id": d["id"]}) for d in docs]

@api_router.post("/admin/addons", response_model=AddonResponse)
async def create_addon(data: AddonCreate, admin=Depends(require_admin)):
    if data.sub_type not in ALLOWED_ADDON_SUBTYPES:
        raise HTTPException(400, "sub_type must be treat | candle | jewellery_box")
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.addons.insert_one(doc)
    return AddonResponse(**doc)

@api_router.put("/admin/addons/{addon_id}", response_model=AddonResponse)
async def update_addon(addon_id: str, data: AddonCreate, admin=Depends(require_admin)):
    if data.sub_type not in ALLOWED_ADDON_SUBTYPES:
        raise HTTPException(400, "sub_type must be treat | candle | jewellery_box")
    payload = data.model_dump()
    res = await db.addons.update_one({"id": addon_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, "Addon not found")
    return AddonResponse(id=addon_id, **payload)

@api_router.delete("/admin/addons/{addon_id}")
async def delete_addon(addon_id: str, admin=Depends(require_admin)):
    res = await db.addons.delete_one({"id": addon_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Addon not found")
    return {"deleted": addon_id}


CARD_SEED = [
    {"name": "With Love", "category": "general", "image_url": "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=640&q=70", "description": "Cream linen card with gold-foil hearts.", "sort_order": 10},
    {"name": "Happy Birthday", "category": "birthday", "image_url": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=640&q=70", "description": "Hand-painted floral cover.", "sort_order": 20},
    {"name": "Thank You", "category": "thank-you", "image_url": "https://images.unsplash.com/photo-1499744937866-d7e566a20a61?w=640&q=70", "description": "Letter-pressed ivory card.", "sort_order": 30},
    {"name": "Congratulations", "category": "general", "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=640&q=70", "description": "Modern blush typography.", "sort_order": 40},
    {"name": "On Your Wedding Day", "category": "wedding", "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70", "description": "Botanical illustration in champagne tones.", "sort_order": 50},
    {"name": "With Sympathy", "category": "sympathy", "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=640&q=70", "description": "Quiet ivory card with soft lily motif.", "sort_order": 60},
    {"name": "New Baby", "category": "general", "image_url": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=640&q=70", "description": "Pastel floral embroidered cover.", "sort_order": 70},
    {"name": "Just Because", "category": "general", "image_url": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=70", "description": "Plain ivory linen — let the message speak.", "sort_order": 80},
    {"name": "Get Well Soon", "category": "general", "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=640&q=70", "description": "Watercolour wildflowers on cream.", "sort_order": 90},
    {"name": "Anniversary", "category": "general", "image_url": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=640&q=70", "description": "Gold-stamped roses on deep ivory.", "sort_order": 100},
]

ADDON_SEED = [
    # Treats (teddies, chocolates, drinks)
    {"name": "Petals Plush Bear", "sub_type": "treat", "price": 24.0, "image_url": "https://images.unsplash.com/photo-1559454403-b8fb88521f43?w=640&q=70", "description": "Hand-stitched cream teddy, 30cm.", "sort_order": 10},
    {"name": "Ivory Knit Bear", "sub_type": "treat", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=640&q=70", "description": "Cable-knit organic cotton bear.", "sort_order": 20},
    {"name": "House Truffle Box", "sub_type": "treat", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=640&q=70", "description": "Twelve hand-rolled single-origin truffles.", "sort_order": 30},
    {"name": "Salted Caramel Selection", "sub_type": "treat", "price": 22.0, "image_url": "https://images.unsplash.com/photo-1582176604856-e824b4736522?w=640&q=70", "description": "Eight artisan caramels from a Dorset chocolatier.", "sort_order": 40},
    {"name": "Veuve Clicquot 200ml", "sub_type": "treat", "price": 25.0, "image_url": "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=640&q=70", "description": "Quarter-bottle of yellow-label champagne.", "sort_order": 50},
    {"name": "English Sparkling Magnum", "sub_type": "treat", "price": 65.0, "image_url": "https://images.unsplash.com/photo-1592753011519-d83d35ed8b3e?w=640&q=70", "description": "Sussex-grown brut, 1.5L.", "sort_order": 60},
    {"name": "Prosecco Mini-Bottle", "sub_type": "treat", "price": 12.0, "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=640&q=70", "description": "20cl prosecco DOC.", "sort_order": 70},
    {"name": "Botanical Gin 50cl", "sub_type": "treat", "price": 38.0, "image_url": "https://images.unsplash.com/photo-1567696911980-2c8c43a6db48?w=640&q=70", "description": "Hand-distilled with rose petals.", "sort_order": 80},

    # Candles — 20 designs
    {"name": "Atelier No. 01 — Fig", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1602874801006-9da3f8e1d05a?w=640&q=70", "description": "Deep, leafy fig in hand-poured soy.", "sort_order": 10},
    {"name": "Atelier No. 02 — Tuberose", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=640&q=70", "description": "Velvety, white-floral.", "sort_order": 20},
    {"name": "Atelier No. 03 — Cassis", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1608181831718-e7e9da12e9bf?w=640&q=70", "description": "Black-currant leaf, sharp & cool.", "sort_order": 30},
    {"name": "Atelier No. 04 — Rose Absolute", "sub_type": "candle", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1599371619178-1c5d9bc4b06e?w=640&q=70", "description": "May-rose petals, true to the bloom.", "sort_order": 40},
    {"name": "Atelier No. 05 — Oud & Amber", "sub_type": "candle", "price": 38.0, "image_url": "https://images.unsplash.com/photo-1574263867128-b3e1b9ed59a1?w=640&q=70", "description": "Smoke, resin and warmth.", "sort_order": 50},
    {"name": "Atelier No. 06 — Neroli", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1599371619207-42f15bd5f97b?w=640&q=70", "description": "Bitter-orange blossom.", "sort_order": 60},
    {"name": "Atelier No. 07 — Jasmine Sambac", "sub_type": "candle", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1602874801006-9da3f8e1d05a?w=640&q=70", "description": "Indolic, heady night-bloom.", "sort_order": 70},
    {"name": "Atelier No. 08 — Cedar", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=640&q=70", "description": "Atlas cedar & dry wood.", "sort_order": 80},
    {"name": "Atelier No. 09 — Bergamot", "sub_type": "candle", "price": 26.0, "image_url": "https://images.unsplash.com/photo-1608181831718-e7e9da12e9bf?w=640&q=70", "description": "Calabrian bergamot, lifted citrus.", "sort_order": 90},
    {"name": "Atelier No. 10 — Tonka", "sub_type": "candle", "price": 30.0, "image_url": "https://images.unsplash.com/photo-1574263867128-b3e1b9ed59a1?w=640&q=70", "description": "Almond, hay, soft vanilla.", "sort_order": 100},
    {"name": "Atelier No. 11 — Sandalwood", "sub_type": "candle", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1599371619178-1c5d9bc4b06e?w=640&q=70", "description": "Mysore sandalwood, creamy & long.", "sort_order": 110},
    {"name": "Atelier No. 12 — Lavender Provence", "sub_type": "candle", "price": 26.0, "image_url": "https://images.unsplash.com/photo-1599371619207-42f15bd5f97b?w=640&q=70", "description": "Sun-bleached French lavender.", "sort_order": 120},
    {"name": "Atelier No. 13 — Vetiver", "sub_type": "candle", "price": 30.0, "image_url": "https://images.unsplash.com/photo-1602874801006-9da3f8e1d05a?w=640&q=70", "description": "Earthy, smoky root.", "sort_order": 130},
    {"name": "Atelier No. 14 — Peony", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=640&q=70", "description": "Fresh garden peony.", "sort_order": 140},
    {"name": "Atelier No. 15 — Mimosa", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1608181831718-e7e9da12e9bf?w=640&q=70", "description": "Soft, powdery & golden.", "sort_order": 150},
    {"name": "Atelier No. 16 — Ylang Ylang", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1574263867128-b3e1b9ed59a1?w=640&q=70", "description": "Tropical white floral.", "sort_order": 160},
    {"name": "Atelier No. 17 — Black Pepper & Pomelo", "sub_type": "candle", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1599371619178-1c5d9bc4b06e?w=640&q=70", "description": "Sharp pink pepper over pomelo.", "sort_order": 170},
    {"name": "Atelier No. 18 — Smoked Vanilla", "sub_type": "candle", "price": 30.0, "image_url": "https://images.unsplash.com/photo-1599371619207-42f15bd5f97b?w=640&q=70", "description": "Bourbon vanilla & woodsmoke.", "sort_order": 180},
    {"name": "Atelier No. 19 — White Tea", "sub_type": "candle", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1602874801006-9da3f8e1d05a?w=640&q=70", "description": "Clean, quiet, restorative.", "sort_order": 190},
    {"name": "Atelier No. 20 — Petals Signature", "sub_type": "candle", "price": 38.0, "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=640&q=70", "description": "Our house blend — rose, fig, oud.", "sort_order": 200},

    # Jewellery boxes
    {"name": "Ivory Linen Jewellery Box — Small", "sub_type": "jewellery_box", "price": 22.0, "image_url": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=640&q=70", "description": "Linen-wrapped, suede-lined, 9×9cm.", "sort_order": 10},
    {"name": "Ivory Linen Jewellery Box — Medium", "sub_type": "jewellery_box", "price": 28.0, "image_url": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=640&q=70", "description": "12×12cm, holds rings + earrings.", "sort_order": 20},
    {"name": "Atelier Velvet Box — Blush", "sub_type": "jewellery_box", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=640&q=70", "description": "Cotton velvet, signature blush.", "sort_order": 30},
    {"name": "Atelier Velvet Box — Sage", "sub_type": "jewellery_box", "price": 32.0, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=640&q=70", "description": "Cotton velvet, deep sage.", "sort_order": 40},
    {"name": "Heritage Wooden Box", "sub_type": "jewellery_box", "price": 48.0, "image_url": "https://images.unsplash.com/photo-1610540854094-0c8ce0ce2c6c?w=640&q=70", "description": "Solid oak with brass clasp.", "sort_order": 50},
    {"name": "Marble & Brass Trinket Box", "sub_type": "jewellery_box", "price": 42.0, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=640&q=70", "description": "Carrara marble base, brass lid.", "sort_order": 60},
]

@api_router.post("/seed/cards-addons")
async def seed_cards_addons(reset: bool = False, admin=Depends(require_admin)):
    if reset:
        await db.cards.delete_many({})
        await db.addons.delete_many({})
    cards_count = await db.cards.count_documents({})
    if cards_count == 0:
        for c in CARD_SEED:
            doc = {**c, "id": str(uuid.uuid4()), "active": True, "price": c.get("price", 0.0)}
            await db.cards.insert_one(doc)
    addons_count = await db.addons.count_documents({})
    if addons_count == 0:
        for a in ADDON_SEED:
            doc = {**a, "id": str(uuid.uuid4()), "active": True}
            await db.addons.insert_one(doc)
    return {
        "cards": await db.cards.count_documents({}),
        "addons_total": await db.addons.count_documents({}),
        "treats": await db.addons.count_documents({"sub_type": "treat"}),
        "candles": await db.addons.count_documents({"sub_type": "candle"}),
        "jewellery_boxes": await db.addons.count_documents({"sub_type": "jewellery_box"}),
    }


# ==================== SEO ====================

class SEOPage(BaseModel):
    path: str          # e.g. "/", "/weddings", "/traveller-weddings"
    title: str = ""
    description: str = ""
    keywords: str = ""
    og_image: str = ""
    canonical: str = ""
    robots: str = "index,follow"
    structured_data: Optional[Dict] = None

@api_router.get("/seo")
async def get_seo_for_path(path: str = "/"):
    """Public — returns merged SEO meta for a given route, with defaults."""
    settings = await _get_settings_dict()
    fallback = {
        "path": path,
        "title": settings.get("seo_default_title", ""),
        "description": settings.get("seo_default_description", ""),
        "keywords": "",
        "og_image": settings.get("seo_default_og_image", ""),
        "canonical": "",
        "robots": "index,follow",
        "structured_data": None,
        "site_name": settings.get("seo_site_name", "Petals Atelier"),
    }
    doc = await db.seo_pages.find_one({"path": path}, {"_id": 0})
    if not doc:
        return fallback
    merged = {**fallback, **doc}
    # Ensure non-empty title/description fall back to defaults
    if not merged.get("title"):
        merged["title"] = fallback["title"]
    if not merged.get("description"):
        merged["description"] = fallback["description"]
    if not merged.get("og_image"):
        merged["og_image"] = fallback["og_image"]
    return merged

@api_router.get("/admin/seo")
async def list_seo_pages(admin=Depends(require_admin)):
    docs = await db.seo_pages.find({}, {"_id": 0}).sort("path", 1).to_list(length=500)
    return docs

@api_router.put("/admin/seo")
async def upsert_seo_page(data: SEOPage, admin=Depends(require_admin)):
    payload = data.model_dump()
    await db.seo_pages.update_one(
        {"path": payload["path"]},
        {"$set": payload},
        upsert=True,
    )
    return payload

@api_router.delete("/admin/seo")
async def delete_seo_page(path: str, admin=Depends(require_admin)):
    await db.seo_pages.delete_one({"path": path})
    return {"deleted": path}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Petals Atelier - Luxury Floristry API"}

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
