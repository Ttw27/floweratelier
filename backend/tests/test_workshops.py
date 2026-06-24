"""
Backend pytest suite for Workshop Booking Funnel.
Covers public/admin workshop endpoints, sessions, bookings, checkout, webhook branch,
and regression checks for existing endpoints.
"""
import os
import re
import uuid
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "https://petals-online-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@petalsatelier.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_headers(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    tok = r.json()["access_token"]
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ===== Public Workshop endpoints =====
class TestPublicWorkshops:
    def test_list_workshops_three_seeded(self, session):
        r = session.get(f"{API}/workshops")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        slugs = {w["slug"] for w in data}
        assert {"christmas-door-wreath", "halloween-wreath", "care-home-bouquet"}.issubset(slugs), slugs
        # check prices populated
        for w in data:
            assert w["price_per_guest"] >= 0
            assert "slug" in w and "name" in w

    def test_workshop_detail_by_slug(self, session):
        r = session.get(f"{API}/workshops/christmas-door-wreath")
        assert r.status_code == 200, r.text
        w = r.json()
        assert w["slug"] == "christmas-door-wreath"
        assert w["price_per_guest"] == 95.0
        assert w["deposit_amount"] == 45.0
        assert w["full_payment_discount_pct"] == 5.0

    def test_workshop_detail_unknown_slug(self, session):
        r = session.get(f"{API}/workshops/does-not-exist-xyz")
        assert r.status_code == 404

    def test_workshop_sessions_by_slug(self, session):
        r = session.get(f"{API}/workshops/christmas-door-wreath/sessions")
        assert r.status_code == 200, r.text
        sessions = r.json()
        assert isinstance(sessions, list)
        assert len(sessions) >= 1, "expected at least one upcoming session"


# ===== Workshop bookings pricing =====
class TestWorkshopBookings:
    def _get_session(self, session, slug):
        r = session.get(f"{API}/workshops/{slug}/sessions")
        assert r.status_code == 200
        s_list = r.json()
        # pick first session with capacity remaining
        for s in s_list:
            if (s["capacity"] - s.get("spots_booked", 0)) >= 2:
                return s
        return s_list[0]

    def test_deposit_2_guests_pricing(self, session):
        ws_session = self._get_session(session, "christmas-door-wreath")
        payload = {
            "session_id": ws_session["id"],
            "name": "TEST Booker",
            "email": f"TEST_book_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+44 7000",
            "guests": 2,
            "dietary_requirements": "Vegetarian",
            "notes": "Test deposit booking",
            "payment_choice": "deposit",
        }
        r = session.post(f"{API}/workshop-bookings", json=payload)
        assert r.status_code == 200, r.text
        b = r.json()
        # 95 * 2 = 190 subtotal; deposit 45 * 2 = 90 due; balance 100
        assert b["subtotal"] == 190.0
        assert b["amount_due_now"] == 90.0
        assert b["balance_due_on_day"] == 100.0
        assert b["discount_amount"] == 0.0
        assert b["payment_choice"] == "deposit"
        assert b["status"] == "pending"
        assert b["workshop_name"]

    def test_full_payment_1_guest_5pct_discount(self, session):
        ws_session = self._get_session(session, "christmas-door-wreath")
        payload = {
            "session_id": ws_session["id"],
            "name": "TEST Full",
            "email": f"TEST_full_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+44 7000",
            "guests": 1,
            "payment_choice": "full",
        }
        r = session.post(f"{API}/workshop-bookings", json=payload)
        assert r.status_code == 200, r.text
        b = r.json()
        # 95 - 5% = 90.25, discount=4.75
        assert b["subtotal"] == 95.0
        assert b["amount_due_now"] == 90.25
        assert b["discount_amount"] == 4.75
        assert b["balance_due_on_day"] == 0.0

    def test_oversell_rejected(self, session, admin_headers):
        """Set capacity=1 then book 2 guests."""
        # Find christmas workshop
        wr = session.get(f"{API}/workshops/christmas-door-wreath")
        wid = wr.json()["id"]
        # Create a tiny capacity session via admin
        new_session = {
            "workshop_id": wid,
            "date": "2099-12-15",
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "TEST capacity test",
            "capacity": 1,
            "spots_booked": 0,
            "notes": "TEST oversell",
            "active": True,
        }
        sr = session.post(f"{API}/admin/workshop-sessions", json=new_session, headers=admin_headers)
        assert sr.status_code in (200, 201), sr.text
        sid = sr.json()["id"]
        # try to book 2
        payload = {
            "session_id": sid,
            "name": "TEST Over",
            "email": f"TEST_over_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+44 7000",
            "guests": 2,
            "payment_choice": "deposit",
        }
        r = session.post(f"{API}/workshop-bookings", json=payload)
        assert r.status_code == 400, r.text
        assert "spot" in r.text.lower()
        # cleanup
        session.delete(f"{API}/admin/workshop-sessions/{sid}", headers=admin_headers)


# ===== Workshop checkout (Stripe) =====
class TestWorkshopCheckout:
    def test_checkout_session_returns_stripe_url(self, session):
        # create booking first
        sr = session.get(f"{API}/workshops/christmas-door-wreath/sessions")
        ws_session = sr.json()[0]
        bk = session.post(f"{API}/workshop-bookings", json={
            "session_id": ws_session["id"],
            "name": "TEST Checkout",
            "email": f"TEST_co_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+44 7000",
            "guests": 1,
            "payment_choice": "deposit",
        })
        assert bk.status_code == 200, bk.text
        booking = bk.json()
        assert booking["amount_due_now"] > 0

        r = session.post(f"{API}/workshop-checkout/session", json={
            "booking_id": booking["id"],
            "origin_url": BASE_URL,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert "stripe.com" in data["url"], data["url"]
        assert data["amount"] == booking["amount_due_now"]


# ===== Admin auth required =====
class TestAdminAuthRequired:
    @pytest.mark.parametrize("method,path,body", [
        ("get", "/admin/workshops", None),
        ("post", "/admin/workshops", {"slug": "x", "name": "x", "tag": "x", "season": "x",
                                      "short_description": "x", "description": "x"}),
        ("get", "/admin/workshop-sessions", None),
        ("post", "/admin/workshop-sessions", {"workshop_id": "x", "date": "2099-01-01"}),
        ("get", "/admin/workshop-bookings", None),
        ("post", "/seed/workshops", None),
    ])
    def test_requires_admin(self, session, method, path, body):
        fn = getattr(session, method)
        r = fn(f"{API}{path}", json=body) if body else fn(f"{API}{path}")
        assert r.status_code in (401, 403), f"{method.upper()} {path} => {r.status_code} {r.text}"


# ===== Admin CRUD =====
class TestAdminCRUD:
    def test_workshop_crud_with_session_blocking_delete(self, session, admin_headers):
        # Create
        payload = {
            "slug": f"test-ws-{uuid.uuid4().hex[:6]}",
            "name": "TEST Workshop",
            "tag": "TEST",
            "season": "TEST",
            "short_description": "TEST short",
            "description": "TEST long",
            "includes": ["a", "b"],
            "duration": "1h",
            "group_size": "10",
            "location_default": "Studio",
            "image_url": "https://example.com/x.jpg",
            "price_per_guest": 50.0,
            "deposit_amount": 20.0,
            "full_payment_discount_pct": 5.0,
            "sort_order": 99,
            "active": True,
        }
        cr = session.post(f"{API}/admin/workshops", json=payload, headers=admin_headers)
        assert cr.status_code == 200, cr.text
        w = cr.json()
        wid = w["id"]

        # Update
        upd = {**payload, "name": "TEST Workshop Updated"}
        ur = session.put(f"{API}/admin/workshops/{wid}", json=upd, headers=admin_headers)
        assert ur.status_code == 200, ur.text
        assert ur.json()["name"] == "TEST Workshop Updated"

        # Add a session
        sr = session.post(f"{API}/admin/workshop-sessions", json={
            "workshop_id": wid, "date": "2099-06-01", "start_time": "10:00",
            "capacity": 5, "spots_booked": 0, "active": True,
        }, headers=admin_headers)
        assert sr.status_code == 200, sr.text
        sid = sr.json()["id"]

        # DELETE workshop should fail while session exists
        d1 = session.delete(f"{API}/admin/workshops/{wid}", headers=admin_headers)
        assert d1.status_code in (400, 409), d1.text

        # Delete session, then workshop
        ds = session.delete(f"{API}/admin/workshop-sessions/{sid}", headers=admin_headers)
        assert ds.status_code == 200, ds.text

        d2 = session.delete(f"{API}/admin/workshops/{wid}", headers=admin_headers)
        assert d2.status_code == 200, d2.text


# ===== Webhook branch verification =====
class TestWebhookBranch:
    def test_webhook_handler_contains_workshop_booking_branch(self):
        """Static verification that the webhook handler has the 'workshop_booking' branch."""
        with open("/app/backend/server.py") as f:
            src = f.read()
        # find the webhook function and ensure the branch exists
        assert re.search(r'@api_router\.post\("/webhook/stripe"\)', src)
        assert 'kind == "workshop_booking"' in src or "kind == 'workshop_booking'" in src


# ===== Regression checks for existing endpoints =====
class TestRegression:
    def test_products(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0

    def test_boxes(self, session):
        r = session.get(f"{API}/boxes")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_cards(self, session):
        r = session.get(f"{API}/cards")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_templates(self, session):
        r = session.get(f"{API}/templates")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_auth_login_admin(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["is_admin"] is True
