"""Iteration 11 — Faith Weddings & Traveller Funerals CMS (extra field) tests.

Covers:
- GET public page-content with `extra` payload (traditions / letter_tributes / bespoke_builds / classic_tributes)
- Admin login + PUT round-trip of `extra` payload through Pydantic Dict[str,Any]
- POST /api/seed/page-content?reset=true reseeds all 10 records
- Regression: all 10 service slugs reachable
"""
import os
import copy
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "admin@petalsatelier.com"
ADMIN_PASS = "admin123"

SERVICE_SLUGS = [
    "weddings", "sympathy", "corporate",
    "shop-front-installs", "house-installs", "film-tv-photoshoot",
    "traveller-weddings", "in-shop-displays",
    "faith-weddings", "traveller-funerals",
]


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("access_token") or data.get("token")
    assert tok, f"No access_token in login response: {data}"
    return tok


@pytest.fixture(scope="session")
def admin(api, admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# ============ GET /api/page-content/faith-weddings ============

class TestFaithWeddingsGet:
    def test_faith_weddings_returns_extra_traditions_with_6_items(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/faith-weddings")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "extra" in data
        traditions = data["extra"].get("traditions")
        assert isinstance(traditions, list), f"traditions not a list: {type(traditions)}"
        assert len(traditions) == 6, f"expected 6 traditions, got {len(traditions)}"

    def test_each_tradition_has_required_fields(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/faith-weddings")
        traditions = r.json()["extra"]["traditions"]
        required = ["id", "name", "intro", "details", "palette", "price", "image"]
        for t in traditions:
            for k in required:
                assert k in t, f"tradition {t.get('id')} missing field {k}"
            assert isinstance(t["details"], list)
            assert isinstance(t["palette"], list)
            assert len(t["palette"]) >= 1
            for c in t["palette"]:
                assert isinstance(c, str) and c.startswith("#"), f"palette color not hex: {c}"

    def test_faith_tradition_ids_match_spec(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/faith-weddings")
        ids = [t["id"] for t in r.json()["extra"]["traditions"]]
        assert set(ids) == {"sikh", "hindu", "jewish", "muslim", "greek", "chinese"}


# ============ GET /api/page-content/traveller-funerals ============

class TestTravellerFuneralsGet:
    def test_traveller_funerals_has_extra_fields(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        assert r.status_code == 200, r.text
        extra = r.json()["extra"]
        assert "letter_tributes" in extra
        assert "bespoke_builds" in extra
        assert "classic_tributes" in extra

    def test_letter_tributes_4_items(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        lt = r.json()["extra"]["letter_tributes"]
        assert isinstance(lt, list) and len(lt) == 4, f"expected 4 letter_tributes, got {len(lt)}"
        for item in lt:
            assert "size" in item and "price" in item and "desc" in item

    def test_bespoke_builds_6_items(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        bb = r.json()["extra"]["bespoke_builds"]
        assert isinstance(bb, list) and len(bb) == 6, f"expected 6 bespoke_builds, got {len(bb)}"
        for item in bb:
            assert "name" in item and "desc" in item and "price" in item

    def test_classic_tributes_12_items(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        ct = r.json()["extra"]["classic_tributes"]
        assert isinstance(ct, list) and len(ct) == 12, f"expected 12 classic_tributes, got {len(ct)}"

    def test_traveller_funerals_hero_fields(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        data = r.json()
        # used by frontend for traveller-funerals-title and eyebrow
        assert data["hero_eyebrow"]
        assert data["hero_title_line1"]
        assert data["hero_subheading"]


# ============ PUT round-trip ============

class TestExtraRoundTrip:
    def test_put_faith_weddings_round_trip_palette(self, api, admin):
        # Read current
        cur = api.get(f"{BASE_URL}/api/page-content/faith-weddings").json()
        original = copy.deepcopy(cur)
        try:
            # Mutate: change first tradition's palette to a new swatch list
            cur["extra"]["traditions"][0]["palette"] = ["#123456", "#ABCDEF", "#FF00FF"]
            cur["extra"]["traditions"][0]["details"] = ["TEST_detail_1", "TEST_detail_2"]
            # Build PUT payload (PageContentCreate shape — slug auto-set by path)
            payload = {k: v for k, v in cur.items() if k != "id"}
            r = admin.put(f"{BASE_URL}/api/admin/page-content/faith-weddings", json=payload)
            assert r.status_code == 200, f"PUT failed: {r.status_code} {r.text}"
            resp = r.json()
            assert resp["extra"]["traditions"][0]["palette"] == ["#123456", "#ABCDEF", "#FF00FF"]
            assert resp["extra"]["traditions"][0]["details"] == ["TEST_detail_1", "TEST_detail_2"]
            # GET to verify persisted
            r2 = api.get(f"{BASE_URL}/api/page-content/faith-weddings")
            assert r2.status_code == 200
            persisted = r2.json()["extra"]["traditions"][0]
            assert persisted["palette"] == ["#123456", "#ABCDEF", "#FF00FF"]
            assert persisted["details"] == ["TEST_detail_1", "TEST_detail_2"]
        finally:
            # Restore original
            restore = {k: v for k, v in original.items() if k != "id"}
            admin.put(f"{BASE_URL}/api/admin/page-content/faith-weddings", json=restore)

    def test_put_traveller_funerals_round_trip(self, api, admin):
        cur = api.get(f"{BASE_URL}/api/page-content/traveller-funerals").json()
        original = copy.deepcopy(cur)
        try:
            cur["extra"]["letter_tributes"].append(
                {"size": "TEST_5ft", "price": "TEST_£1500", "desc": "TEST_desc"}
            )
            cur["extra"]["bespoke_builds"].append(
                {"name": "TEST_build", "desc": "TEST_desc", "price": "TEST_£999"}
            )
            cur["extra"]["classic_tributes"].append("TEST_classic_extra")
            payload = {k: v for k, v in cur.items() if k != "id"}
            r = admin.put(f"{BASE_URL}/api/admin/page-content/traveller-funerals", json=payload)
            assert r.status_code == 200, f"PUT failed: {r.status_code} {r.text}"
            # Verify persisted via GET
            after = api.get(f"{BASE_URL}/api/page-content/traveller-funerals").json()
            assert len(after["extra"]["letter_tributes"]) == 5
            assert len(after["extra"]["bespoke_builds"]) == 7
            assert len(after["extra"]["classic_tributes"]) == 13
            assert after["extra"]["letter_tributes"][-1]["size"] == "TEST_5ft"
            assert after["extra"]["bespoke_builds"][-1]["name"] == "TEST_build"
            assert "TEST_classic_extra" in after["extra"]["classic_tributes"]
        finally:
            restore = {k: v for k, v in original.items() if k != "id"}
            admin.put(f"{BASE_URL}/api/admin/page-content/traveller-funerals", json=restore)


# ============ Seed reset ============

class TestSeedReset:
    def test_seed_reset_reseeds_10_pages(self, admin):
        r = admin.post(f"{BASE_URL}/api/seed/page-content?reset=true")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["total"] == 10, f"expected total=10, got {data}"
        assert data["inserted"] == 10, f"expected inserted=10, got {data}"

    def test_all_10_slugs_present(self, api):
        for slug in SERVICE_SLUGS:
            r = api.get(f"{BASE_URL}/api/page-content/{slug}")
            assert r.status_code == 200, f"{slug} -> {r.status_code}"

    def test_faith_after_reset_still_has_extra(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/faith-weddings")
        traditions = r.json()["extra"]["traditions"]
        assert len(traditions) == 6

    def test_traveller_funerals_after_reset_still_has_extra(self, api):
        r = api.get(f"{BASE_URL}/api/page-content/traveller-funerals")
        extra = r.json()["extra"]
        assert len(extra["letter_tributes"]) == 4
        assert len(extra["bespoke_builds"]) == 6
        assert len(extra["classic_tributes"]) == 12


# ============ Regression: standard tier editor pages still work ============

class TestStandardTierRegression:
    def test_put_weddings_tiers_round_trip(self, api, admin):
        cur = api.get(f"{BASE_URL}/api/page-content/weddings").json()
        original = copy.deepcopy(cur)
        try:
            # Push the same payload (no-op semantics) and confirm 200
            payload = {k: v for k, v in cur.items() if k != "id"}
            r = admin.put(f"{BASE_URL}/api/admin/page-content/weddings", json=payload)
            assert r.status_code == 200, r.text
            assert len(r.json()["tiers"]) == 4
        finally:
            restore = {k: v for k, v in original.items() if k != "id"}
            admin.put(f"{BASE_URL}/api/admin/page-content/weddings", json=restore)

    def test_seed_idempotent_no_reset(self, admin):
        r = admin.post(f"{BASE_URL}/api/seed/page-content")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 10
        assert data["inserted"] == 0  # already seeded
