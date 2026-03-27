import requests

BASE_URL = "http://127.0.0.1:8000"

USERNAME = "garage1"
PASSWORD = "Garage123!"

# 1. Get JWT token
token_response = requests.post(
    f"{BASE_URL}/api/token/",
    json={"username": USERNAME, "password": PASSWORD}
)

if token_response.status_code != 200:
    print("❌ Failed to obtain token:", token_response.text)
    exit()

access_token = token_response.json()["access"]
print("✅ Garage token obtained")

# 2. Access garage-only endpoint
headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(
    f"{BASE_URL}/api/accounts/garage-only/",
    headers=headers
)

print("Status Code:", response.status_code)
print("Response:", response.text)
