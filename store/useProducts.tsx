import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import AxiosInstance from '../axiosInstance/AxiosInstance';

interface ProductContextType {
  categories: any[];
  products: any[];
  cart: any[];
  wishlist: any[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => any | undefined;
  getProductsByCategory: (categoryId: string) => any[];
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
      // Lấy danh mục
      const categoryResponse = await AxiosInstance().get('/category');
      console.log('categoryResponse:', categoryResponse);

      const fetchedCategories = categoryResponse.map((category) => ({
        CategoryID: category._id,
        Name: category.name,
        Icon: getIconForCategory(category.name),
        Description: category.description || '',
        Status: category.status || true,
      }));
      console.log('fetchedCategories:', fetchedCategories);
      setCategories(fetchedCategories);

      // Lấy sản phẩm
      const productResponse = await AxiosInstance().get('/products?limit=100');
      console.log('productResponse:', productResponse);

      const fetchedProducts = await Promise.all(
        (productResponse.products || []).map(async (product) => {
          let imageURLs = ['https://via.placeholder.com/150'];
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${product._id}`);
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch (imgError) {
            console.warn(`Failed to fetch image for product ${product._id}:`, imgError);
            // Sử dụng hình ảnh mặc định nếu lỗi
          }
          return {
            ProductID: product._id,
            CategoryID: product.categoryID || '',
            Name: product.name,
            Description: product.description || '',
            Price: product.price.toLocaleString('vi-VN'),
            Image: imageURLs[0],
            Rating: 4.0,
          };
        })
      );
      console.log('fetchedProducts:', fetchedProducts);
      setProducts(fetchedProducts);

      // TODO: Gọi API để lấy giỏ hàng nếu có
      // Ví dụ: const cartResponse = await AxiosInstance().get('/cart');
      // setCart(cartResponse);

      // TODO: Gọi API để lấy wishlist nếu có
      // Ví dụ: const wishlistResponse = await AxiosInstance().get('/wishlist');
      // setWishlist(wishlistResponse);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setCategories([]);
      setProducts([]);
      setCart([]);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (name: string) => {
    switch (name) {
      case 'Áo Khoác':
        return 'jacket-outline';
      case 'Áo Polo':
        return 'shirt-outline';
      case 'Áo Thun':
        return 'shirt-outline';
      case 'Áo Sơ Mi':
        return 'shirt-outline';
      case 'Quần Dài':
        return 'man-outline';
      case 'Quần Đùi':
        return 'man-outline';
      default:
        return 'cube-outline';
    }
  };

  const getProductById = (id: string) => products.find((p) => p.ProductID === id);

  const getProductsByCategory = (categoryId: string) =>
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