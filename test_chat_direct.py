import requests
import json

url = "http://localhost:8000/chat/query"
payload = {
    "query": "What is the Indian Constitution?",
    "top_k": 5,
    "chat_history": []
}

print("Sending request to:", url)
print("Payload:", json.dumps(payload, indent=2))
print("\n" + "="*60)

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print("\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
