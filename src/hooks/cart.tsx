import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('@GoMarketplace:products');
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsStorage) {
        setProducts(JSON.parse(productsStorage || ''));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async (id: string): Promise<void> => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsUpdate = products.map(product => {
        if (product.id === id) {
          const productToIncrement = {
            ...product,
            quantity: product.quantity + 1,
          };
          return productToIncrement;
        }
        return product;
      });
      setProducts(productsUpdate);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsUpdate),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product): Promise<void> => {
      // TODO ADD A NEW ITEM TO THE CART
      const indexProduct = products.findIndex(
        itemProduct => itemProduct.id === product.id,
      );
      if (indexProduct < 0) {
        const productToAdd = { ...product, quantity: 1 };
        const newProducts = [...products, productToAdd];
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
        return;
      }

      increment(product.id);
    },
    [products, increment],
  );

  const decrement = useCallback(
    async (id: string): Promise<void> => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsUpdate = products.map(product => {
        if (product.id === id) {
          const productToIncrement = {
            ...product,
            quantity: product.quantity - 1,
          };
          return productToIncrement;
        }
        return product;
      });
      const productsWithFilter = productsUpdate.filter(
        product => product.quantity !== 0,
      );
      setProducts(productsWithFilter);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsWithFilter),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
