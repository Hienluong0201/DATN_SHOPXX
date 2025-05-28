// store/useProducts.tsx
import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dữ liệu mẫu
const mockCategories = [
  { CategoryID: 1, Name: 'Áo Nam', Description: 'Áo thời trang dành cho nam' },
  { CategoryID: 2, Name: 'Quần Nam', Description: 'Quần phong cách dành cho nam' },
  { CategoryID: 3, Name: 'Phụ Kiện', Description: 'Phụ kiện thời trang' },
];

const mockProducts = [
  {
    ProductID: 1,
    CategoryID: 1,
    Name: 'Áo Polo Nam',
    Description: 'Áo Polo cao cấp',
    Price: '499.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
  {
    ProductID: 2,
    CategoryID: 2,
    Name: 'Quần Jeans',
    Description: 'Quần Jeans thời thượng',
    Price: '799.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
  {
    ProductID: 3,
    CategoryID: 3,
    Name: 'Dây Lưng Da',
    Description: 'Dây lưng cao cấp',
    Price: '299.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
];

const mockCart = [
  {
    CartID: 1,
    UserID: 1,
    VariantID: 1,
    Quantity: 2,
    Name: 'Áo Polo Nam',
    Price: '499.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
];

interface ProductContextType {
  categories: any[];
  products: any[];
  cart: any[];
  wishlist: any[];
  loading: boolean;
  error: string | null;
  getProductById: (id: number) => any | undefined;
  getProductsByCategory: (categoryId: number) => any[];
  addToCart: (product: any, quantity: number) => void;
  addToWishlist: (product: any) => void;
  fetchData: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedCategories = await AsyncStorage.getItem('categories');
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedCategories && storedProducts) {
        setCategories(JSON.parse(storedCategories));
        setProducts(JSON.parse(storedProducts));
      } else {
        await AsyncStorage.setItem('categories', JSON.stringify(mockCategories));
        await AsyncStorage.setItem('products', JSON.stringify(mockProducts));
        setCategories(mockCategories);
        setProducts(mockProducts);
      }
      setCart(mockCart); // Khởi tạo giỏ hàng với dữ liệu mẫu
    } catch (err) {
      setError('Failed to fetch or store data');
      setCategories(mockCategories); // Fallback to mock data
      setProducts(mockProducts);
      setCart(mockCart);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: number) => products.find((p) => p.ProductID === id);

  const getProductsByCategory = (categoryId: number) =>
    products.filter((p) => p.CategoryID === categoryId);

  const addToCart = (product: any, quantity: number) => {
    setCart((prev) => [
      ...prev,
      { ...product, CartID: prev.length + 1, Quantity: quantity },
    ]);
  };

  const addToWishlist = (product: any) => {
    setWishlist((prev) => [
      ...prev,
      { ...product, WishlistID: prev.length + 1 },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        categories,
        products,
        cart,
        wishlist,
        loading,
        error,
        getProductById,
        getProductsByCategory,
        addToCart,
        addToWishlist,
        fetchData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};