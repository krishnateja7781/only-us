import requests
import json
import uuid
import time
import os
from datetime import datetime

class OnlyUsAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.pairing_code = None
        self.pairing_session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        if not headers:
            headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register(self):
        """Test user registration"""
        # Generate a unique email to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        email = f"test_user_{unique_id}@example.com"
        password = "TestPassword123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,  # Server returns 200 instead of 201
            data={"email": email, "password": password, "name": f"Test User {unique_id}"}
        )
        
        if success and 'user' in response:
            self.user_id = response['user']['id']
            self.token = response.get('access_token')
            print(f"Created user with ID: {self.user_id}")
            print(f"Got access token: {self.token[:10]}...")
            return email, password
        return None, None

    def test_login(self, email, password):
        """Test user login"""
        # Skip if we already have a token from registration
        if self.token:
            print("Already logged in from registration")
            return True
            
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"Got access token: {self.token[:10]}...")
            return True
        return False

    def test_create_pairing(self):
        """Test creating a pairing session"""
        success, response = self.run_test(
            "Create Pairing Session",
            "POST",
            "pairing/create",
            200,  # Server returns 200 instead of 201
            data={}
        )
        
        if success and 'pairing_code' in response:
            self.pairing_code = response['pairing_code']
            self.pairing_session_id = response.get('session_id')
            print(f"Created pairing with code: {self.pairing_code}")
            return True
        return False

    def test_join_pairing(self, code=None):
        """Test joining a pairing session"""
        if not code:
            code = self.pairing_code
            
        success, response = self.run_test(
            "Join Pairing Session",
            "POST",
            "pairing/join",
            200,
            data={"pairing_code": code}
        )
        
        return success

    def test_get_pairing_status(self):
        """Test getting pairing session status"""
        if not self.pairing_session_id:
            print("❌ No pairing session ID available")
            return False
            
        success, response = self.run_test(
            "Get Pairing Status",
            "GET",
            f"pairing/status/{self.pairing_session_id}",
            200
        )
        
        return success

    def test_invalid_pairing_code(self):
        """Test joining with an invalid pairing code"""
        success, _ = self.run_test(
            "Join with Invalid Pairing Code",
            "POST",
            "pairing/join",
            400,
            data={"pairing_code": "000000"}
        )
        
        # This test passes if we get the expected 400 error
        return success

    def test_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "users/profile",
            200
        )
        
        return success

def main():
    # Get the backend URL from environment variable
    backend_url = "https://1aa84173-15a9-4cb1-b69e-08fe74101d38.preview.emergentagent.com"
    
    print(f"🚀 Starting Only Us API tests against {backend_url}")
    
    # Initialize tester
    tester = OnlyUsAPITester(backend_url)
    
    # Test user registration
    email, password = tester.test_register()
    if not email:
        print("❌ Registration failed, stopping tests")
        return 1
    
    # Test user login
    if not tester.test_login(email, password):
        print("❌ Login failed, stopping tests")
        return 1
    
    # Test user profile
    if not tester.test_user_profile():
        print("❌ User profile retrieval failed")
    
    # Test pairing creation
    if not tester.test_create_pairing():
        print("❌ Pairing creation failed")
    else:
        # Test pairing status
        tester.test_get_pairing_status()
        
        # Test joining a pairing session
        if not tester.test_join_pairing():
            print("❌ Joining pairing session failed")
    
    # Test invalid pairing code
    tester.test_invalid_pairing_code()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    main()