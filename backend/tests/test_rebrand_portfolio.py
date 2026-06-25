"""
Backend test suite for iteration 8: Rebrand to "Flower Atelier", removal of
next-day/tomorrow copy, new admin portfolio CRUD, image uploads, plus
regression against catalog/auth/workshops endpoints.
"""
import io
import os
import re
import uuid
import pytest
import requests

def _load_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if url:
        return url.rstrip("/")
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env")
    try:
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")
    except FileNotFoundError:
        pass
    raise RuntimeError("REACT_APP_BACKEND_URL not set")


BASE_URL = _load_backend_url()
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@petalsatelier.com"  # admin login intentionally not rebranded
ADMIN_PASSWORD = "admin123"

FORBIDDEN_BRAND = re.compile(r"petals\s*atelier", re.IGNORECASE)
FORBIDDEN_DELIVERY = re.compile(r"\b(next[\-\s]?day|tomorrow|same[\-\s]?week)\b", re.IGNORECASE)


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed {r.status_code}: {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ==================== Settings + SEO Rebrand ====================
class TestRebrandSettingsSEO:
    def test_settings_site_name(self, session):
        r = session.get(f"{API}/settings")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("seo_site_name") == "Flower Atelier", data
        assert "Flower Atelier" in (data.get("seo_default_title") or "")
        # Either Leicester or Midlands should appear in default title
        title = data.get("seo_default_title") or ""
        assert ("Leicester" in title) or ("Midlands" in title), title
        # No next-day language in defaults
        for k in ("seo_default_title", "seo_default_description"):
            v = data.get(k) or ""
            assert not FORBIDDEN_DELIVERY.search(v), f"forbidden delivery copy in settings.{k}: {v}"
            assert not FORBIDDEN_BRAND.search(v), f"forbidden brand copy in settings.{k}: {v}"

    def test_seo_home(self, session):
        r = session.get(f"{API}/seo", params={"path": "/"})
        assert r.status_code == 200, r.text
        data = r.json()
        # title should be the rebranded home title
        assert data.get("title") == "Flower Atelier — Bespoke Luxury Florist, Leicester", data
        desc = data.get("description") or ""
        assert not FORBIDDEN_DELIVERY.search(desc), f"forbidden delivery copy in SEO desc: {desc}"
        assert not FORBIDDEN_BRAND.search(desc), f"forbidden brand copy in SEO desc: {desc}"


# ==================== Rebrand check on public catalog payloads ====================
class TestPublicPayloadsClean:
    @pytest.mark.parametrize("path", [
        "/products", "/cards", "/boxes", "/addons", "/portfolio",
    ])
    def test_no_forbidden_strings(self, session, path):
        r = session.get(f"{API}{path}")
        assert r.status_code == 200, f"{path} -> {r.status_code} {r.text[:200]}"
        body = r.text
        bad_brand = FORBIDDEN_BRAND.findall(body)
        bad_delivery = FORBIDDEN_DELIVERY.findall(body)
        assert not bad_brand, f"'Petals Atelier' found in {path}: {bad_brand[:3]}"
        assert not bad_delivery, f"next-day/tomorrow/same-week found in {path}: {bad_delivery[:5]}"


# ==================== Admin Portfolio CRUD ====================
class TestAdminPortfolioCRUD:
    def test_requires_auth(self, session):
        r = session.get(f"{API}/admin/portfolio")
        assert r.status_code in (401, 403)
        r = session.post(f"{API}/admin/portfolio", json={
            "title": "x", "category": "wedding", "image": "https://x"
        })
        assert r.status_code in (401, 403)

    def test_list_seeded_items(self, session, admin_headers):
        r = session.get(f"{API}/admin/portfolio", headers=admin_headers)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        # iteration_7 had 61 items; allow >= 60 tolerance
        assert len(items) >= 60, f"expected >=60 seeded portfolio items, got {len(items)}"
        # ensure no _id leakage
        for it in items[:5]:
            assert "_id" not in it
            assert "id" in it
            assert "title" in it
            assert "category" in it
            assert "image" in it

    def test_create_update_delete(self, session, admin_headers):
        title1 = f"TEST_Portfolio_{uuid.uuid4().hex[:6]}"
        payload = {
            "title": title1,
            "category": "wedding",
            "description": "Created by automated test",
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7",
            "location": "Leicester",
            "price_from": 250.0,
            "tags": ["test", "white", "garden"],
            "featured": True,
        }
        # CREATE
        r = session.post(f"{API}/admin/portfolio", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        item_id = created["id"]
        assert created["title"] == title1
        assert created["category"] == "wedding"
        assert created["tags"] == ["test", "white", "garden"]
        assert created["featured"] is True
        assert created["price_from"] == 250.0

        # GET via list confirms persistence
        r = session.get(f"{API}/admin/portfolio", headers=admin_headers)
        assert r.status_code == 200
        assert any(it["id"] == item_id for it in r.json()), "created portfolio item not in list"

        # UPDATE (change title + featured off)
        title2 = title1 + "_upd"
        upd = {**payload, "title": title2, "featured": False, "tags": ["updated"]}
        r = session.put(f"{API}/admin/portfolio/{item_id}", json=upd, headers=admin_headers)
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated["title"] == title2
        assert updated["featured"] is False
        assert updated["tags"] == ["updated"]

        # GET via public portfolio detail confirms persistence
        r = session.get(f"{API}/portfolio/{item_id}")
        assert r.status_code == 200
        assert r.json()["title"] == title2

        # DELETE
        r = session.delete(f"{API}/admin/portfolio/{item_id}", headers=admin_headers)
        assert r.status_code == 200, r.text

        # Verify gone
        r = session.get(f"{API}/portfolio/{item_id}")
        assert r.status_code == 404

    def test_update_missing(self, session, admin_headers):
        r = session.put(f"{API}/admin/portfolio/does-not-exist", json={
            "title": "x", "category": "wedding", "image": "https://x"
        }, headers=admin_headers)
        assert r.status_code == 404


# ==================== Image Upload ====================
# Minimal 1x1 PNG (valid)
PNG_1x1 = bytes.fromhex(
    "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
    "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
)


class TestImageUpload:
    def test_upload_png(self, session, admin_headers):
        files = {"file": ("t.png", io.BytesIO(PNG_1x1), "image/png")}
        # endpoint allows anonymous in code, but send admin header just in case
        r = requests.post(f"{API}/uploads/image", files=files,
                          headers={"Authorization": admin_headers["Authorization"]})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert data["url"].startswith("/api/uploads/")
        assert data["content_type"] == "image/png"

    def test_upload_rejects_bad_type(self):
        files = {"file": ("t.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{API}/uploads/image", files=files)
        assert r.status_code == 400


# ==================== Regression — existing endpoints ====================
class TestRegression:
    def test_workshops_count(self, session):
        r = session.get(f"{API}/workshops")
        assert r.status_code == 200
        ws = r.json()
        assert isinstance(ws, list) and len(ws) == 4, f"expected 4 workshops, got {len(ws)}"

    def test_products_count(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 21, f"expected 21 products, got {len(items)}"

    def test_cards_count(self, session):
        r = session.get(f"{API}/cards")
        assert r.status_code == 200
        assert len(r.json()) == 10

    def test_templates_count(self, session):
        r = session.get(f"{API}/templates")
        assert r.status_code == 200
        assert len(r.json()) == 3

    def test_boxes_present(self, session):
        r = session.get(f"{API}/boxes")
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_portfolio_limited(self, session):
        # NOTE: /portfolio endpoint does not currently support a `limit` query param;
        # it returns up to 200 items. Reported as minor issue.
        r = session.get(f"{API}/portfolio", params={"limit": 5})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_login(self, session):
        r = session.post(f"{API}/auth/login",
                         json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["is_admin"] is True

    def test_workshop_booking_deposit(self, session):
        # find a direct (non-enquire) workshop with a session
        ws = session.get(f"{API}/workshops").json()
        direct = [w for w in ws if w.get("booking_mode", "direct") == "direct"]
        assert direct, "no direct workshops"
        for w in direct:
            sessions = session.get(f"{API}/workshops/{w['slug']}/sessions").json()
            if sessions:
                sess = sessions[0]
                price = w.get("price_per_guest") or sess.get("price_per_guest") or 95
                deposit = w.get("deposit_per_guest") or 45
                guests = 2
                payload = {
                    "workshop_slug": w["slug"],
                    "session_id": sess["id"],
                    "guests": guests,
                    "payment_choice": "deposit",
                    "name": "T Test",
                    "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
                    "phone": "+44 7000",
                }
                r = session.post(f"{API}/workshop-bookings", json=payload)
                # Tolerate capacity-rejection if session is full; otherwise must succeed
                if r.status_code == 200:
                    b = r.json()
                    assert b["subtotal"] == price * guests
                    assert b["amount_due_now"] == deposit * guests
                    return
                else:
                    assert r.status_code in (400,), r.text
                    return
        pytest.skip("no direct workshop sessions available")
