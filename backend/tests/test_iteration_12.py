"""Iteration 12 — Pre-deployment regression smoke tests.

Covers backend health on all public API endpoints + admin auth + all 10 service pages.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://petals-online-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@petalsatelier.com"
ADMIN_PASSWORD = "admin123"

SERVICE_SLUGS = [
    "weddings", "sympathy", "corporate",
    "house-installs", "shop-front-installs", "film-tv-photoshoot",
    "in-shop-displays", "traveller-weddings", "traveller-funerals",
    "faith-weddings",
]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"no token in {data}"
    return token


# ---- Backend health smoke ----

class TestBackendHealth:
    def test_products(self, session):
        r = session.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_portfolio(self, session):
        r = session.get(f"{API}/portfolio", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_categories(self, session):
        r = session.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_settings(self, session):
        r = session.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200
        # settings should be a dict-like object
        assert isinstance(r.json(), dict)

    def test_cards(self, session):
        r = session.get(f"{API}/cards", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_addons(self, session):
        r = session.get(f"{API}/addons", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_boxes(self, session):
        r = session.get(f"{API}/boxes", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_workshops(self, session):
        # Could be /workshops or /workshops/programmes; try main listing
        r = session.get(f"{API}/workshops", timeout=15)
        assert r.status_code == 200, f"workshops returned {r.status_code}: {r.text[:200]}"

    def test_templates(self, session):
        r = session.get(f"{API}/templates", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_page_content_weddings(self, session):
        r = session.get(f"{API}/page-content/weddings", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("slug") == "weddings"


# ---- All 10 service-page slugs reachable ----

@pytest.mark.parametrize("slug", SERVICE_SLUGS)
def test_page_content_all_slugs(session, slug):
    r = session.get(f"{API}/page-content/{slug}", timeout=15)
    assert r.status_code == 200, f"{slug} -> {r.status_code}"
    body = r.json()
    assert body.get("slug") == slug


# ---- Admin auth ----

class TestAdminAuth:
    def test_admin_login_success(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 10

    def test_admin_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code in (400, 401, 403)


# ---- Admin endpoints reachable with token ----

class TestAdminEndpoints:
    def test_admin_portfolio_list(self, session, admin_token):
        r = session.get(f"{API}/admin/portfolio", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_page_content_round_trip_weddings(self, session, admin_token):
        # GET current
        r = session.get(f"{API}/page-content/weddings", timeout=15)
        assert r.status_code == 200
        current = r.json()
        # PUT same payload to confirm save works
        payload = {k: v for k, v in current.items() if k not in ("id", "_id", "created_at", "updated_at")}
        r2 = session.put(
            f"{API}/admin/page-content/weddings",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=15,
        )
        assert r2.status_code == 200, f"PUT weddings -> {r2.status_code}: {r2.text[:300]}"
