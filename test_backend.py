import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✓ Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    try:
        payload = {
            "query": "What is the Indian Constitution?",
            "top_k": 5,
            "chat_history": []
        }
        response = requests.post(f"{BASE_URL}/chat/", json=payload)
        print(f"✓ Chat endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response preview: {data.get('answer', '')[:100]}...")
            return True
        else:
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Chat endpoint failed: {e}")
        return False

def test_documents_list():
    """Test list documents endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/documents/list")
        print(f"✓ List documents: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Documents count: {len(data.get('documents', []))}")
            return True
        else:
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ List documents failed: {e}")
        return False

def test_cors():
    """Test CORS headers"""
    try:
        headers = {"Origin": "http://localhost:3000"}
        response = requests.options(f"{BASE_URL}/chat", headers=headers)
        cors_header = response.headers.get("Access-Control-Allow-Origin")
        print(f"✓ CORS check: {cors_header}")
        return cors_header is not None
    except Exception as e:
        print(f"✗ CORS check failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("BACKEND API TESTING")
    print("=" * 60)
    
    results = {
        "Health": test_health(),
        "Chat": test_chat(),
        "Documents": test_documents_list(),
        "CORS": test_cors()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    passed = sum(results.values())
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    for test, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test}")
