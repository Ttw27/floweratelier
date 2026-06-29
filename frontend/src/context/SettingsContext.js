import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SettingsContext = createContext({ settings: null, loaded: false, refresh: () => {} });

const CACHE_KEY = "site_settings";
const cached = (() => { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { return null; } })();

const DEFAULTS = {
  utility_bar_text: "",
  utility_bar_enabled: true,
  whatsapp_number: "",
  whatsapp_enabled: true,
  whatsapp_default_message: "Hello Flower Atelier — I'd like to enquire about your floristry.",
  phone_number: "",
  contact_email: "",
  homepage_hero_image: null,
  homepage_category1_image: null,
  homepage_category2_image: null,
  homepage_category3_image: null,
  homepage_category4_image: null,
  homepage_subscription_image: null,
  homepage_bespoke_image: null,
  testimonials: null,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(cached || DEFAULTS);
  const [loaded, setLoaded] = useState(!!cached);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      const data = { ...DEFAULTS, ...res.data };
      setSettings(data);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
    } catch {
      // keep cached/defaults on error
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh: load, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
