import requests
import sys
import json
from datetime import datetime

class BoxPersonalizationTester:
    def __init__(self, base_url="https://petals-online-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.product_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)

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

    def test_get_product_for_personalization(self):
        """Get a product to test personalization with"""
        success, response = self.run_test(
            "Get Products for Personalization Test",
            "GET",
            "api/products",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            self.product_id = response[0]['id']
            print(f"   Using product ID: {self.product_id}")
            return True
        return False

    def test_add_to_cart_with_box_personalization(self):
        """Test adding item to cart with box personalization"""
        if not self.product_id:
            return False

        box_personalization = {
            "box_color": "blush-pink",
            "ribbon_color": "gold", 
            "box_message": "Happy Birthday!"
        }

        success, response = self.run_test(
            "Add to Cart with Box Personalization",
            "POST",
            "api/cart/add",
            200,
            data={
                "product_id": self.product_id,
                "quantity": 1,
                "box_personalization": box_personalization
            },
            params={"session_id": self.session_id}
        )
        return success

    def test_get_cart_with_personalization(self):
        """Test getting cart with personalization details"""
        success, response = self.run_test(
            "Get Cart with Personalization",
            "GET",
            "api/cart",
            200,
            params={"session_id": self.session_id}
        )
        
        if success and 'items' in response and len(response['items']) > 0:
            item = response['items'][0]
            if 'box_personalization' in item:
                box_data = item['box_personalization']
                print(f"   ✅ Box personalization found: {box_data}")
                
                # Verify the personalization data
                expected_data = {
                    "box_color": "blush-pink",
                    "ribbon_color": "gold",
                    "box_message": "Happy Birthday!"
                }
                
                if (box_data.get('box_color') == expected_data['box_color'] and
                    box_data.get('ribbon_color') == expected_data['ribbon_color'] and
                    box_data.get('box_message') == expected_data['box_message']):
                    print(f"   ✅ Personalization data matches expected values")
                    return True
                else:
                    print(f"   ❌ Personalization data mismatch. Expected: {expected_data}, Got: {box_data}")
                    return False
            else:
                print(f"   ❌ No box personalization found in cart item")
                return False
        return False

    def test_add_multiple_items_different_personalization(self):
        """Test adding multiple items with different personalization"""
        if not self.product_id:
            return False

        # Add second item with different personalization
        box_personalization_2 = {
            "box_color": "sage-green",
            "ribbon_color": "silver",
            "box_message": "Thank you!"
        }

        success, response = self.run_test(
            "Add Second Item with Different Personalization",
            "POST",
            "api/cart/add",
            200,
            data={
                "product_id": self.product_id,
                "quantity": 1,
                "box_personalization": box_personalization_2
            },
            params={"session_id": self.session_id}
        )
        
        if not success:
            return False

        # Get cart and verify both items exist with different personalization
        success2, cart_response = self.run_test(
            "Get Cart with Multiple Personalized Items",
            "GET",
            "api/cart",
            200,
            params={"session_id": self.session_id}
        )
        
        if success2 and 'items' in cart_response and len(cart_response['items']) == 2:
            print(f"   ✅ Found {len(cart_response['items'])} items in cart")
            
            # Check that both items have different personalization
            personalizations = []
            for item in cart_response['items']:
                if 'box_personalization' in item:
                    personalizations.append(item['box_personalization'])
            
            if len(personalizations) == 2:
                print(f"   ✅ Both items have personalization data")
                print(f"   Item 1: {personalizations[0]}")
                print(f"   Item 2: {personalizations[1]}")
                return True
            else:
                print(f"   ❌ Expected 2 personalized items, found {len(personalizations)}")
                return False
        else:
            print(f"   ❌ Expected 2 items in cart, found {len(cart_response.get('items', []))}")
            return False

    def test_add_item_without_personalization(self):
        """Test adding item without personalization (should work normally)"""
        if not self.product_id:
            return False

        success, response = self.run_test(
            "Add Item Without Personalization",
            "POST",
            "api/cart/add",
            200,
            data={
                "product_id": self.product_id,
                "quantity": 1
                # No box_personalization field
            },
            params={"session_id": self.session_id}
        )
        return success

def main():
    print("🎁 Starting Box Personalization API Tests 🎁")
    print("=" * 50)
    
    tester = BoxPersonalizationTester()
    
    # Test sequence
    tests = [
        ("Get Product for Testing", tester.test_get_product_for_personalization),
        ("Add to Cart with Box Personalization", tester.test_add_to_cart_with_box_personalization),
        ("Get Cart with Personalization", tester.test_get_cart_with_personalization),
        ("Add Multiple Items Different Personalization", tester.test_add_multiple_items_different_personalization),
        ("Add Item Without Personalization", tester.test_add_item_without_personalization)
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
    print("📊 BOX PERSONALIZATION TEST RESULTS")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All box personalization tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())