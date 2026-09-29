// Page-content slugs that have their own dedicated page (and route).
export const SLUG_TO_PATH = {
  // Services
  "corporate": "/corporate",
  "hotels-hospitality": "/hotels-hospitality",
  "restaurants": "/restaurants",
  "house-installs": "/house-installs",
  "shop-front-installs": "/shop-front-installs",
  "in-shop-displays": "/in-shop-displays",
  "film-tv-photoshoot": "/film-tv-photoshoot",
  "workshops": "/workshops",
  "workshops-pubs": "/workshops/pubs-venues",
  "workshops-care-homes": "/workshops/care-homes",
  // Occasions
  "weddings": "/weddings",
  "traveller-weddings": "/traveller-weddings",
  "faith-weddings": "/faith-weddings",
  "sympathy": "/sympathy",
  "traveller-funerals": "/traveller-funerals",
};

export const OCCASION_SLUGS = ["weddings", "traveller-weddings", "faith-weddings", "sympathy", "traveller-funerals"];
export const SERVICE_SLUGS = ["corporate", "hotels-hospitality", "restaurants", "house-installs", "shop-front-installs", "in-shop-displays", "film-tv-photoshoot", "workshops", "workshops-pubs", "workshops-care-homes"];

// A custom page is any admin-created page_content slug without a dedicated page.
// It is rendered by GenericContentPage at "/<slug>".
export const isValidCustomSlug = (slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
export const isCustomPageSlug = (slug) => isValidCustomSlug(slug) && !Object.prototype.hasOwnProperty.call(SLUG_TO_PATH, slug);

// First path segments already used by the site's own routes — a custom page can't use these.
export const RESERVED_SLUGS = new Set([
  "collection", "product", "weddings", "traveller-weddings", "faith-weddings", "sympathy",
  "traveller-funerals", "corporate", "house-installs", "shop-front-installs", "in-shop-displays",
  "film-tv-photoshoot", "workshops", "portfolio", "cart", "checkout", "order-success", "login",
  "register", "account", "consultation", "admin", "hotels-hospitality", "restaurants", "privacy",
  "delivery", "api", "terms",
]);
