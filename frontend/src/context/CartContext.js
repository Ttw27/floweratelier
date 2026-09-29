import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

const EMPTY_CART = { items: [], subtotal: 0, gift_message: null };

const getOrCreateSessionId = () => {
  try {
    let id = localStorage.getItem("session_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("session_id", id);
    }
    return id;
  } catch {
    return uuidv4();
  }
};

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  // `loaded` becomes true once the first cart fetch has completed (success or failure),
  // so pages like checkout don't redirect on the initial empty placeholder.
  const [loaded, setLoaded] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);
  const requestSeq = useRef(0);
  const prevToken = useRef(token);

  const fetchCart = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/cart`, {
        params: { session_id: sessionId }
      });
      if (seq === requestSeq.current) {
        setCart({ ...EMPTY_CART, ...response.data, items: response.data?.items || [] });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setLoaded(true);
      }
    }
  }, [sessionId]);

  // Fetch on mount and whenever the auth token changes (login / logout).
  // On login (token goes from empty to set), merge the guest cart into the user's cart first.
  useEffect(() => {
    const wasLoggedOut = !prevToken.current;
    prevToken.current = token;
    let cancelled = false;
    (async () => {
      if (token && wasLoggedOut) {
        try {
          await axios.post(`${API_URL}/api/cart/merge`, null, { params: { session_id: sessionId } });
        } catch (error) {
          console.error("Failed to merge guest cart:", error);
        }
      }
      if (!cancelled) await fetchCart();
    })();
    return () => { cancelled = true; };
  }, [token, sessionId, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1, size = null, boxPersonalization = null) => {
    try {
      await axios.post(`${API_URL}/api/cart/add`,
        { product_id: productId, quantity, size, box_personalization: boxPersonalization },
        { params: { session_id: sessionId } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  }, [sessionId, fetchCart]);

  const updateQuantity = useCallback(async (lineId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/cart/update`,
        { line_id: lineId, quantity },
        { params: { session_id: sessionId } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to update cart:", error);
      throw error;
    }
  }, [sessionId, fetchCart]);

  const removeFromCart = useCallback(async (lineId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${encodeURIComponent(lineId)}`, {
        params: { session_id: sessionId }
      });
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  }, [sessionId, fetchCart]);

  const updateGiftMessage = useCallback(async (message) => {
    try {
      await axios.put(`${API_URL}/api/cart/gift-message`,
        { message },
        { params: { session_id: sessionId } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to update gift message:", error);
      throw error;
    }
  }, [sessionId, fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(`${API_URL}/api/cart/clear`, {
        params: { session_id: sessionId }
      });
      requestSeq.current++; // ignore any in-flight fetch
      setCart(EMPTY_CART);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, [sessionId]);

  const cartCount = useMemo(
    () => (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart.items]
  );

  const value = useMemo(() => ({
    cart,
    loading,
    loaded,
    sessionId,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateGiftMessage,
    clearCart,
    fetchCart
  }), [cart, loading, loaded, sessionId, cartCount, addToCart, updateQuantity, removeFromCart, updateGiftMessage, clearCart, fetchCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
