"""
Iteration 10 tests:
- /api/categories with $lookup aggregation (product_count present, single-query, matches /api/products grouping)
- Re-seed /api/seed/page-content?reset=true → {total:10, inserted:10}
- Tier expectations for: shop-front-installs, house-installs, film-tv-photoshoot,
  traveller-weddings, in-shop-displays
- Regression on workshops/products/cards/addons/templates/settings/seo/admin login/admin portfolio
"""
import os
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://petals-online-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@petalsatelier.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    tok = r.json().get("access_token") or r.json().get("token")
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ===== Categories with product_count aggregation =====
class TestCategoriesAggregation:
    def test_categories_have_product_count(self):
        r = requests.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200, r.text
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) == 7, f"expected 7 categories, got {len(cats)}"
        for c in cats:
            assert "product_count" in c, f"category missing product_count: {c}"
            assert isinstance(c["product_count"], int)

    def test_product_count_matches_products_grouping(self):
        cats = requests.get(f"{API}/categories", timeout=15).json()
        products = requests.get(f"{API}/products", timeout=15).json()
        grouped = Counter(p.get("category_id") for p in products)
        for c in cats:
            expected = grouped.get(c["id"], 0)
            assert c["product_count"] == expected, (
                f"category {c.get('name', c.get('slug'))} id={c['id']}: "
                f"product_count={c['product_count']} but products grouping={expected}"
            )


# ===== Page-content reset seed =====
class TestPageContentReseed:
    def test_reset_seed_returns_10_10(self, admin_headers):
        r = requests.post(f"{API}/seed/page-content?reset=true", headers=admin_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("total") == 10
        assert data.get("inserted") == 10, f"expected inserted=10 (after reset), got {data}"


# ===== Tier expectations =====
def _tier(p, idx):
    return p["tiers"][idx]


class TestTierContent:
    def test_shop_front_installs_tiers(self):
        r = requests.get(f"{API}/page-content/shop-front-installs", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        titles = [t["title"] for t in d["tiers"]]
        prices = [t["price_label"] for t in d["tiers"]]
        assert titles == ["Seasonal Quarterly", "Monthly Refresh", "Campaign-Led"], titles
        assert prices == ["from £2,200 / install", "from £1,650 / install", "from £3,800"], prices

    def test_house_installs_tiers(self):
        d = requests.get(f"{API}/page-content/house-installs", timeout=15).json()
        prices = [t["price_label"] for t in d["tiers"]]
        assert len(d["tiers"]) == 3, len(d["tiers"])
        # required prices from review request
        assert any("£450" in p and ("wk" in p or "week" in p) for p in prices), prices
        assert any("£295" in p and "visit" in p for p in prices), prices
        assert any("£850" in p and "event" in p for p in prices), prices

    def test_film_tv_photoshoot_tiers(self):
        d = requests.get(f"{API}/page-content/film-tv-photoshoot", timeout=15).json()
        assert len(d["tiers"]) == 6, len(d["tiers"])

    def test_traveller_weddings_tiers(self):
        d = requests.get(f"{API}/page-content/traveller-weddings", timeout=15).json()
        assert len(d["tiers"]) == 6, len(d["tiers"])

    def test_in_shop_displays_tiers(self):
        d = requests.get(f"{API}/page-content/in-shop-displays", timeout=15).json()
        assert len(d["tiers"]) == 6, len(d["tiers"])

    def test_faith_weddings_still_available(self):
        # intentionally not wired but record exists
        d = requests.get(f"{API}/page-content/faith-weddings", timeout=15)
        assert d.status_code == 200

    def test_traveller_funerals_still_available(self):
        d = requests.get(f"{API}/page-content/traveller-funerals", timeout=15)
        assert d.status_code == 200


# ===== Regression =====
class TestRegression:
    def test_workshops_count(self):
        r = requests.get(f"{API}/workshops", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 4

    def test_products_count(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 21

    def test_cards_count(self):
        r = requests.get(f"{API}/cards", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 10

    def test_addons(self):
        r = requests.get(f"{API}/addons", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_templates_count(self):
        r = requests.get(f"{API}/templates", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 3

    def test_settings(self):
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200

    def test_seo_home(self):
        r = requests.get(f"{API}/seo?path=/", timeout=15)
        assert r.status_code == 200

    def test_admin_portfolio_count(self, admin_headers):
        r = requests.get(f"{API}/admin/portfolio", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 61

    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
