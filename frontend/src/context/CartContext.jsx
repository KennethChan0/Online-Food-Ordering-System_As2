import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // from Menu page to add food items to order page
  const addItem = (task, quantity) => {
    const amount = Number(quantity);

    if (!task?._id || !Number.isInteger(amount) || amount <= 0) {
      return false;
    }

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.menuItem === task._id
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.menuItem === task._id
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      }

      return [
        ...previousItems,
        {
          menuItem: task._id,
          name: task.title,
          photo: task.photo,
          unitPrice: Number(task.price),
          quantity: amount,
        },
      ];
    });

    return true;
  };

const updateQuantity = (menuItemId, newQuantity) => {
  if (!Number.isInteger(newQuantity) || newQuantity < 1) return;

  setCartItems((previousItems) =>
    previousItems.map((item) =>
      item.menuItem === menuItemId
        ? { ...item, quantity: newQuantity }
        : item
    )
  );
};

  // remove food item
  const removeItem = (menuItemId) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.menuItem !== menuItemId)
    );
  };

  // clear up all food item after submission 
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addItem,updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
};