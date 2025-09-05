import requests
import json

# API base URL
BASE_URL = 'http://127.0.0.1:8000/api/v1'

def test_authentication():
    # Login to get token
    login_data = {
        'email': 'kruthikhakrishna@gmail.com',
        'password': 'vishali@1'  # Replace with your actual password
    }
    
    print("Testing authentication...")
    response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    print(f"Login response: {response.status_code}")
    print(response.json())
    
    if response.status_code == 200:
        token = response.json().get('key')
        print(f"\nGot token: {token}")
        return token
    return None

def test_protected_endpoints(token):
    if not token:
        print("No token available. Skipping protected endpoint tests.")
        return
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Test getting user profile
    print("\nTesting user profile endpoint...")
    response = requests.get(f'{BASE_URL}/users/users/me/', headers=headers)
    print(f"User profile response: {response.status_code}")
    print(response.json())
    
    # Test getting hospitals list
    print("\nTesting hospitals endpoint...")
    response = requests.get(f'{BASE_URL}/hospitals/', headers=headers)
    print(f"Hospitals response: {response.status_code}")
    print(response.json())
    
    # Test getting specialties list
    print("\nTesting specialties endpoint...")
    response = requests.get(f'{BASE_URL}/specialties/', headers=headers)
    print(f"Specialties response: {response.status_code}")
    print(response.json())

if __name__ == '__main__':
    token = test_authentication()
    test_protected_endpoints(token) 