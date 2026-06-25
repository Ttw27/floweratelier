"""Page Content CMS + WhatsApp consolidation + regression tests (iteration 9)."""
import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "admin@petalsatelier.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    return data.get("token") or data.get("access_token")


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ===== seed =====
class TestSeed:
    def test_seed_page_content(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/seed/page-content", headers=admin_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["total"] == 10, f"expected total=10, got {data}"
        # second call → inserted=0
        r2 = requests.post(f"{BASE_URL}/api/seed/page-content", headers=admin_headers, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["inserted"] == 0


# ===== Public GET =====
class TestPublicGet:
    def test_get_weddings(self):
        r = requests.get(f"{BASE_URL}/api/page-content/weddings", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["hero_eyebrow"] == "Weddings"
        assert d["hero_title_line1"] == "Your day,"
        assert d["hero_title_italic"] == "bloom."
        assert len(d["tiers"]) == 4
        titles = [t["title"] for t in d["tiers"]]
        assert "Bridal Couture Bouquet" in titles
        for t in d["tiers"]:
            assert "title" in t and "description" in t
            assert "price_label" in t and "image_url" in t

    def test_get_unknown_slug(self):
        r = requests.get(f"{BASE_URL}/api/page-content/no-such-slug-zzz", timeout=15)
        assert r.status_code == 404

    def test_inactive_returns_404(self, admin_headers):
        # patch in-shop-displays to inactive, fetch, then re-activate
        slug = "in-shop-displays"
        cur = requests.get(f"{BASE_URL}/api/page-content/{slug}", timeout=15).json()
        cur["active"] = False
        put = requests.put(f"{BASE_URL}/api/admin/page-content/{slug}",
                           json=cur, headers=admin_headers, timeout=15)
        assert put.status_code == 200
        r = requests.get(f"{BASE_URL}/api/page-content/{slug}", timeout=15)
        assert r.status_code == 404
        # restore
        cur["active"] = True
        requests.put(f"{BASE_URL}/api/admin/page-content/{slug}",
                     json=cur, headers=admin_headers, timeout=15)


# ===== Admin auth =====
class TestAdmin:
    def test_list_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/page-content", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_with_admin(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/page-content", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 10
        slugs = {d["slug"] for d in data}
        for expected in ["weddings", "sympathy", "corporate", "shop-front-installs",
                         "house-installs", "film-tv-photoshoot", "traveller-weddings",
                         "traveller-funerals", "faith-weddings", "in-shop-displays"]:
            assert expected in slugs, f"missing slug {expected}"

    def test_create_duplicate_slug_fails(self, admin_headers):
        payload = {"slug": "weddings", "label": "Dup", "tiers": []}
        r = requests.post(f"{BASE_URL}/api/admin/page-content", json=payload,
                          headers=admin_headers, timeout=15)
        assert r.status_code == 400

    def test_create_new_slug(self, admin_headers):
        slug = "TEST-newpage-zzz"
        payload = {"slug": slug, "label": "Test", "hero_eyebrow": "T",
                   "hero_title_line1": "Hi", "tiers": []}
        # cleanup if leftover
        requests.delete(f"{BASE_URL}/api/admin/page-content/{slug}", headers=admin_headers, timeout=15)
        r = requests.post(f"{BASE_URL}/api/admin/page-content", json=payload,
                          headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["slug"] == slug
        # cleanup
        d = requests.delete(f"{BASE_URL}/api/admin/page-content/{slug}",
                            headers=admin_headers, timeout=15)
        assert d.status_code == 200

    def test_put_updates_weddings_and_persists(self, admin_headers):
        # fetch current
        cur = requests.get(f"{BASE_URL}/api/admin/page-content", headers=admin_headers, timeout=15).json()
        wed = next(d for d in cur if d["slug"] == "weddings")
        original_line1 = wed["hero_title_line1"]
        wed["hero_title_line1"] = "TEST Your day,"
        # bump tier 0 price
        original_tier0_price = wed["tiers"][0]["price_label"]
        wed["tiers"][0]["price_label"] = "from £999"
        r = requests.put(f"{BASE_URL}/api/admin/page-content/weddings",
                         json=wed, headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        # GET to verify persistence
        g = requests.get(f"{BASE_URL}/api/page-content/weddings", timeout=15).json()
        assert g["hero_title_line1"] == "TEST Your day,"
        assert g["tiers"][0]["price_label"] == "from £999"
        # revert
        wed["hero_title_line1"] = original_line1
        wed["tiers"][0]["price_label"] = original_tier0_price
        requests.put(f"{BASE_URL}/api/admin/page-content/weddings",
                     json=wed, headers=admin_headers, timeout=15)
        g2 = requests.get(f"{BASE_URL}/api/page-content/weddings", timeout=15).json()
        assert g2["hero_title_line1"] == original_line1

    def test_put_upserts_when_missing(self, admin_headers):
        slug = "TEST-upsert-zzz"
        requests.delete(f"{BASE_URL}/api/admin/page-content/{slug}", headers=admin_headers, timeout=15)
        payload = {"slug": slug, "label": "Upserted", "hero_title_line1": "Hi", "tiers": []}
        r = requests.put(f"{BASE_URL}/api/admin/page-content/{slug}", json=payload,
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["slug"] == slug
        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/page-content/{slug}", headers=admin_headers, timeout=15)

    def test_delete_missing_404(self, admin_headers):
        r = requests.delete(f"{BASE_URL}/api/admin/page-content/does-not-exist-xyz",
                            headers=admin_headers, timeout=15)
        assert r.status_code == 404


# ===== WhatsApp consolidation =====
class TestWhatsApp:
    def test_settings_whatsapp_number_present(self):
        r = requests.get(f"{BASE_URL}/api/settings", timeout=15)
        assert r.status_code == 200
        assert "whatsapp_number" in r.json()

    def test_patch_whatsapp_number(self, admin_headers):
        # get current
        cur = requests.get(f"{BASE_URL}/api/settings", timeout=15).json()
        original = cur.get("whatsapp_number", "447123456789")
        # PUT with new number
        cur["whatsapp_number"] = "447999000111"
        r = requests.put(f"{BASE_URL}/api/settings", json=cur,
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200
        # verify
        v = requests.get(f"{BASE_URL}/api/settings", timeout=15).json()
        assert v["whatsapp_number"] == "447999000111"
        # restore
        cur["whatsapp_number"] = original
        requests.put(f"{BASE_URL}/api/settings", json=cur,
                     headers=admin_headers, timeout=15)


# ===== Regression =====
class TestRegression:
    def test_workshops(self):
        r = requests.get(f"{BASE_URL}/api/workshops", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 4

    def test_products(self):
        r = requests.get(f"{BASE_URL}/api/products", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 21

    def test_cards(self):
        r = requests.get(f"{BASE_URL}/api/cards", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 10

    def test_admin_portfolio(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/portfolio", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 61

    def test_templates(self):
        r = requests.get(f"{BASE_URL}/api/templates", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 3

    def test_seo(self):
        r = requests.get(f"{BASE_URL}/api/seo?path=/", timeout=15)
        assert r.status_code == 200
        assert "Flower Atelier" in r.json().get("title", "")

    def test_settings(self):
        r = requests.get(f"{BASE_URL}/api/settings", timeout=15)
        assert r.status_code == 200

    def test_admin_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        assert r.json().get("user", {}).get("is_admin") is True or r.json().get("is_admin")
