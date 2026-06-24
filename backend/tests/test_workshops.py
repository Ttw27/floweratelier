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
    def test_list_workshops_four_seeded(self, session):
        r = session.get(f"{API}/workshops")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        slugs = {w["slug"] for w in data}
        assert {"christmas-door-wreath", "halloween-wreath",
                "care-home-bouquet", "pub-social-club-night"}.issubset(slugs), slugs
        # check prices populated and booking_mode present
        for w in data:
            assert w["price_per_guest"] >= 0
            assert "slug" in w and "name" in w
            assert "booking_mode" in w
            assert w["booking_mode"] in ("direct", "enquire")

    def test_workshop_modes_split(self, session):
        r = session.get(f"{API}/workshops")
        data = r.json()
        by_slug = {w["slug"]: w for w in data}
        # direct
        assert by_slug["christmas-door-wreath"]["booking_mode"] == "direct"
        assert by_slug["christmas-door-wreath"]["price_per_guest"] == 95.0
        assert by_slug["halloween-wreath"]["booking_mode"] == "direct"
        assert by_slug["halloween-wreath"]["price_per_guest"] == 75.0
        # enquire
        ch = by_slug["care-home-bouquet"]
        assert ch["booking_mode"] == "enquire"
        assert ch["price_per_guest"] == 18.0
        assert isinstance(ch["enquire_bullets"], list) and len(ch["enquire_bullets"]) > 0
        assert isinstance(ch["enquire_venues"], list) and len(ch["enquire_venues"]) > 0
        assert ch["whatsapp_message"]
        assert ch["enquire_pitch"]
        pb = by_slug["pub-social-club-night"]
        assert pb["booking_mode"] == "enquire"
        assert pb["price_per_guest"] == 45.0
        assert len(pb["enquire_bullets"]) > 0
        assert len(pb["enquire_venues"]) > 0
        assert "Petals Atelier" in pb["whatsapp_message"] or "workshop" in pb["whatsapp_message"].lower()

    def test_enquire_workshop_sessions_empty_but_200(self, session):
        """Enquire workshops should not have sessions seeded, but endpoint should still 200."""
        for slug in ("care-home-bouquet", "pub-social-club-night"):
            r = session.get(f"{API}/workshops/{slug}/sessions")
            assert r.status_code == 200, f"{slug}: {r.text}"
            assert r.json() == [], f"{slug} should have no sessions, got {r.json()}"

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


# ===== Enquire admin CRUD round-trip =====
class TestEnquireAdminCRUD:
    def test_create_enquire_then_flip_to_direct_roundtrip(self, session, admin_headers):
        slug = f"test-enq-{uuid.uuid4().hex[:6]}"
        payload = {
            "slug": slug,
            "name": "TEST Enquire Workshop",
            "tag": "TEST",
            "season": "TEST",
            "short_description": "TEST short",
            "description": "TEST long",
            "includes": ["a", "b"],
            "duration": "1h",
            "group_size": "10",
            "location_default": "Venue",
            "image_url": "https://example.com/x.jpg",
            "price_per_guest": 30.0,
            "deposit_amount": 0.0,
            "full_payment_discount_pct": 0.0,
            "sort_order": 99,
            "active": True,
            "booking_mode": "enquire",
            "enquire_pitch": "TEST pitch",
            "enquire_bullets": ["bullet one", "bullet two", "bullet three"],
            "enquire_venues": ["Pubs", "Care homes"],
            "whatsapp_message": "Hi from TEST",
        }
        cr = session.post(f"{API}/admin/workshops", json=payload, headers=admin_headers)
        assert cr.status_code == 200, cr.text
        wid = cr.json()["id"]

        # Verify via admin GET — fields persisted
        gr = session.get(f"{API}/admin/workshops", headers=admin_headers)
        assert gr.status_code == 200
        found = next((x for x in gr.json() if x["id"] == wid), None)
        assert found, "created workshop missing from admin list"
        assert found["booking_mode"] == "enquire"
        assert found["enquire_bullets"] == ["bullet one", "bullet two", "bullet three"]
        assert found["enquire_venues"] == ["Pubs", "Care homes"]
        assert found["whatsapp_message"] == "Hi from TEST"
        assert found["enquire_pitch"] == "TEST pitch"

        # PUT back to direct
        upd = {**payload, "booking_mode": "direct"}
        ur = session.put(f"{API}/admin/workshops/{wid}", json=upd, headers=admin_headers)
        assert ur.status_code == 200, ur.text
        assert ur.json()["booking_mode"] == "direct"

        # Verify round-trip
        gr2 = session.get(f"{API}/admin/workshops", headers=admin_headers)
        found2 = next((x for x in gr2.json() if x["id"] == wid), None)
        assert found2["booking_mode"] == "direct"

        # cleanup
        d = session.delete(f"{API}/admin/workshops/{wid}", headers=admin_headers)
        assert d.status_code == 200, d.text


# ===== Inquiry: workshop_host =====
class TestWorkshopHostInquiry:
    def test_post_inquiry_workshop_host_and_admin_lists_it(self, session, admin_headers):
        payload = {
            "name": "TEST Pub Owner",
            "email": f"TEST_pub_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+44 7000",
            "message": "We'd like to host a flower workshop night.\nVenue: The Crown\nDate: 15/03/2026\nGuests: 18",
            "service_type": "workshop_host",
        }
        r = session.post(f"{API}/inquiries", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        # endpoint returns inquiry id (or echoes data)
        # confirm retrieval via admin
        gr = session.get(f"{API}/admin/inquiries", headers=admin_headers)
        assert gr.status_code == 200, gr.text
        all_inq = gr.json()
        # Find ours
        mine = [i for i in all_inq if i.get("email") == payload["email"]]
        assert len(mine) >= 1, f"newly posted inquiry not retrievable; all={len(all_inq)}"
        assert mine[0]["service_type"] == "workshop_host"
        assert mine[0]["name"] == "TEST Pub Owner"


# ===== Seed regression =====
class TestSeedRegression:
    def test_seed_workshops_reset_true_creates_4_workshops_and_4_sessions(self, session, admin_headers):
        r = session.post(f"{API}/seed/workshops?reset=true", headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["workshops"] == 4, data
        # 2 direct workshops × 2 sessions each = 4
        assert data["sessions"] == 4, data
        # And the public list still has 4
        pr = session.get(f"{API}/workshops")
        slugs = {w["slug"] for w in pr.json()}
        assert {"christmas-door-wreath", "halloween-wreath",
                "care-home-bouquet", "pub-social-club-night"} == slugs


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
