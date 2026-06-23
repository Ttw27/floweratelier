import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SettingsContext = createContext({ settings: null, refresh: () => {} });

const DEFAULTS = {
  utility_bar_text: "",
  utility_bar_enabled: true,
  whatsapp_number: "",
  whatsapp_enabled: true,
  whatsapp_default_message: "Hello Petals Atelier — I'd like to enquire about your floristry.",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      setSettings({ ...DEFAULTS, ...res.data });
    } catch {
      // keep defaults on error
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, refresh: load, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
