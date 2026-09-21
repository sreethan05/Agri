"""
Automated CI/CD Unit & Integration Tests for Agri Backend API
Can be executed via standard python unittest or pytest.
"""

import os
import sys
import unittest

# Add parent directory to path so main and auth can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
import main

class TestAgriBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(main.app)

    def test_01_health_check(self):
        """Verify API health check endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertTrue(data.get("model_loaded"))
        self.assertEqual(data.get("num_classes"), 15)

    def test_02_disease_classes(self):
        """Verify disease classes metadata"""
        response = self.client.get("/classes")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        classes = data.get("classes", [])
        self.assertEqual(len(classes), 15)
        # Verify sample classes are present
        class_names = [c.get("name") if isinstance(c, dict) else c for c in classes]
        self.assertTrue(any("Tomato" in name for name in class_names))

    def test_03_weather_endpoint(self):
        """Verify weather advisory endpoint with coordinate queries"""
        response = self.client.get("/weather?lat=17.385&lon=78.4867")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("main", data)
        self.assertIn("temp", data["main"])
        self.assertIn("humidity", data["main"])

    def test_04_market_prices(self):
        """Verify APMC mandi market commodity prices"""
        response = self.client.get("/market-prices?state=Telangana")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("records", data)
        records = data.get("records", [])
        self.assertGreater(len(records), 0)
        first_item = records[0]
        self.assertIn("commodity", first_item)
        self.assertIn("modal_price", first_item)

    def test_05_auth_login(self):
        """Verify demo/local user authentication and JWT token generation"""
        payload = {
            "email": "test@agri.ai",
            "password": "test123456"
        }
        response = self.client.post("/login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data.get("token_type"), "bearer")
        self.assertIn("user", data)
        self.assertEqual(data["user"].get("email"), "test@agri.ai")

    def test_06_authenticated_history(self):
        """Verify authenticated user can fetch prediction history"""
        # Login first
        login_res = self.client.post("/login", json={"email": "test@agri.ai", "password": "test123456"})
        token = login_res.json().get("access_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.get("/history", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predictions", data)
        self.assertIsInstance(data.get("predictions"), list)

if __name__ == "__main__":
    unittest.main()
