import requests
import sys
import json
from datetime import datetime, timedelta

class FloristAPITester:
    def __init__(self, base_url="https://petals-online-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seeding initial data"""
        success, response = self.run_test(
            "Seed Data",
            "POST",
            "api/seed",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@petals.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "email": test_email,
                "password": "test123",
                "name": "Test User"
            }
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   User token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@petals.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "api/categories",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} categories")
            return True
        return False

    def test_get_products(self):
        """Test getting products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "api/products",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} products")
            self.test_product_id = response[0]['id']
            return True
        return False

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.run_test(
            "Get Featured Products",
            "GET",
            "api/products",
            200,
            params={"featured": True}
        )
        if success and isinstance(response, list):
            featured_count = len([p for p in response if p.get('featured')])
            print(f"   Found {featured_count} featured products")
            return True
        return False

    def test_get_single_product(self):
        """Test getting a single product"""
        if not hasattr(self, 'test_product_id'):
            return False
        
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"api/products/{self.test_product_id}",
            200
        )
        return success and 'id' in response

    def test_cart_operations(self):
        """Test cart operations"""
        if not hasattr(self, 'test_product_id'):
            return False

        # Add to cart
        success1, _ = self.run_test(
            "Add to Cart",
            "POST",
            "api/cart/add",
            200,
            data={
                "product_id": self.test_product_id,
                "quantity": 2
            },
            params={"session_id": self.session_id}
        )

        # Get cart
        success2, cart_response = self.run_test(
            "Get Cart",
            "GET",
            "api/cart",
            200,
            params={"session_id": self.session_id}
        )

        # Update gift message
        success3, _ = self.run_test(
            "Update Gift Message",
            "PUT",
            "api/cart/gift-message",
            200,
            data={"message": "Happy Birthday!"},
            params={"session_id": self.session_id}
        )

        # Update quantity
        success4, _ = self.run_test(
            "Update Cart Quantity",
            "PUT",
            "api/cart/update",
            200,
            data={
                "product_id": self.test_product_id,
                "quantity": 3
            },
            params={"session_id": self.session_id}
        )

        return all([success1, success2, success3, success4])

    def test_order_creation(self):
        """Test order creation"""
        success, response = self.run_test(
            "Create Order",
            "POST",
            "api/orders",
            200,
            data={
                "delivery_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "delivery_address": {
                    "line1": "123 Test Street",
                    "line2": "Apt 4B",
                    "city": "London",
                    "postcode": "SW1A 1AA"
                },
                "gift_message": "Test gift message",
                "recipient_name": "John Doe",
                "recipient_phone": "07123456789"
            },
            params={"session_id": self.session_id}
        )
        
        if success and 'id' in response:
            self.test_order_id = response['id']
            print(f"   Order created with ID: {self.test_order_id}")
            return True
        return False

    def test_subscription_plans(self):
        """Test subscription plans"""
        success, response = self.run_test(
            "Get Subscription Plans",
            "GET",
            "api/subscriptions/plans",
            200
        )
        return success and isinstance(response, list) and len(response) > 0

    def test_admin_stats(self):
        """Test admin stats"""
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "api/admin/stats",
            200,
            use_admin=True
        )
        return success and 'total_orders' in response

    def test_admin_orders(self):
        """Test admin orders"""
        success, response = self.run_test(
            "Get Admin Orders",
            "GET",
            "api/admin/orders",
            200,
            use_admin=True
        )
        return success and isinstance(response, list)

    def test_checkout_session(self):
        """Test checkout session creation"""
        if not hasattr(self, 'test_order_id'):
            return False
            
        success, response = self.run_test(
            "Create Checkout Session",
            "POST",
            "api/checkout/session",
            200,
            data={
                "order_id": self.test_order_id,
                "origin_url": "https://petals-online-1.preview.emergentagent.com"
            }
        )
        return success and 'url' in response

def main():
    print("🌸 Starting Florist E-commerce API Tests 🌸")
    print("=" * 50)
    
    tester = FloristAPITester()
    
    # Test sequence
    tests = [
        ("Seed Data", tester.test_seed_data),
        ("Admin Login", tester.test_admin_login),
        ("User Registration", tester.test_user_registration),
        ("Get Categories", tester.test_get_categories),
        ("Get Products", tester.test_get_products),
        ("Get Featured Products", tester.test_get_featured_products),
        ("Get Single Product", tester.test_get_single_product),
        ("Cart Operations", tester.test_cart_operations),
        ("Order Creation", tester.test_order_creation),
        ("Subscription Plans", tester.test_subscription_plans),
        ("Admin Stats", tester.test_admin_stats),
        ("Admin Orders", tester.test_admin_orders),
        ("Checkout Session", tester.test_checkout_session)
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())