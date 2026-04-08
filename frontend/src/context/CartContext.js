import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CartContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, gift_message: null });
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("session_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("session_id", id);
    }
    return id;
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/cart`, {
        params: { session_id: sessionId }
      });
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, size = null) => {
    try {
      await axios.post(`${API_URL}/api/cart/add`, 
        { product_id: productId, quantity, size },
        { params: { session_id: sessionId } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity, size = null) => {
    try {
      await axios.put(`${API_URL}/api/cart/update`,
        { product_id: productId, quantity, size },
        { params: { session_id: sessionId } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to update cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${productId}`, {
        params: { session_id: sessionId }
      });
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const updateGiftMessage = async (message) => {
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
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/cart/clear`, {
        params: { session_id: sessionId }
      });
      setCart({ items: [], subtotal: 0, gift_message: null });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      sessionId,
      cartCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      updateGiftMessage,
      clearCart,
      fetchCart
    }}>
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
