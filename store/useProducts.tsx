import { createContext, useContext, useState, useEffect, FC, ReactNode,} from 'react';
import {Alert} from 'react-native';
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

  // Wishlist mới:
  fetchWishlist: (userId: string) => Promise<void>;
  addToWishlist: (product: any, userId: string) => Promise<void>;
  removeFromWishlist: (wishlistId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistId: (productId: string) => string | undefined;

  fetchCategories: () => Promise<void>;
  fetchProducts: (params: { categoryId: string; page?: number; limit?: number }) => Promise<any[]>;
  fetchProductVariants: (productId: string) => Promise<any[]>;
  search?: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  
  // Fetch Wishlist từ API
  const fetchWishlist = async (userId: string) => {
    setLoading(true);
    try {
      const response = await AxiosInstance().get(`/wishlist?userID=${userId}`);
      const newWishlist = (response || []).map(item => ({
        WishlistID: item._id,
        ProductID: item.productID._id,
        ...item.productID,
      }));
      setWishlist(newWishlist);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách yêu thích.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào wishlist
const addToWishlist = async (product, userId) => {
  // Nếu đã có rồi thì KHÔNG gọi API, và không thêm vào state nữa!
  if (wishlist.some(item => item.ProductID === product.ProductID)) return;

  setLoading(true);
  try {
    const response = await AxiosInstance().post(`/wishlist`, {
      userID: userId,
      productID: product.ProductID,
    });

    // Nếu API trả về đúng định dạng:
    // response._id: ID wishlist vừa tạo
    // response.productID: object sản phẩm hoặc chỉ ID sản phẩm
    setWishlist(prev => [
      ...prev,
      {
        WishlistID: response._id, // hoặc response.WishlistID nếu backend trả về vậy
        ProductID: response.productID?._id || response.productID, // phòng trường hợp trả về object hoặc chỉ ID
        ...(typeof response.productID === 'object' ? response.productID : product),
      }
    ]);

    setError(null);
  } catch (err) {
    // Kiểm tra lỗi trả về từ server (đã có trong wishlist)
    const serverMsg = err?.response?.data?.message || err?.message || '';
    if (serverMsg === 'Sản phẩm đã có trong wishlist.') {
      // KHÔNG cần báo lỗi, KHÔNG setError, để tránh hiện message đỏ ở UI
      // Có thể cho Alert nhẹ nhàng nếu thích:
       Alert.alert('Thông báo', 'Sản phẩm đã có trong danh sách yêu thích!');
    } else {
      setError('Không thể thêm vào danh sách yêu thích.');
      Alert.alert('Lỗi', 'Không thể thêm vào danh sách yêu thích.');
    }
    // Optional: log lỗi để debug khi cần
    // console.error('addToWishlist ERROR:', serverMsg, err);
  } finally {
    setLoading(false);
  }
};

const fetchProductVariants = async (productId: string) => {
  setLoading(true);
  try {
    const response = await AxiosInstance().get(`/productvariant/byproduct/${productId}`);
    console.log("Du lieu productdetai", response)
    console.log(`Variants for product ${productId}:`, response);
    // response là mảng các variant
    setError(null);
    return response; // Trả về mảng variant
  } catch (err) {
    setError('Không thể tải các biến thể sản phẩm.');
    return [];
  } finally {
    setLoading(false);
  }
};


  // Xoá khỏi wishlist
const removeFromWishlist = async (wishlistId) => {
  setLoading(true);
  try {
    await AxiosInstance().delete(`/wishlist/${wishlistId}`);
    setWishlist(prev => prev.filter(item => item.WishlistID !== wishlistId));
  } catch (err) {
    setError('Không thể xoá khỏi danh sách yêu thích.');
  } finally {
    setLoading(false);
  }
};


  // Kiểm tra sản phẩm đã có trong wishlist chưa
    const isInWishlist = (productId: string) =>
    wishlist.some(item => item.ProductID === productId);

  // Lấy WishlistID theo ProductID
  const getWishlistId = (productId: string) =>
    wishlist.find(item => item.ProductID === productId)?.WishlistID;

  // ...Các hàm fetchCategories, fetchProducts, addToCart như bạn đang có...
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryResponse = await AxiosInstance().get('/category');
      setCategories(categoryResponse.map((category) => ({
        CategoryID: category._id,
        Name: category.name,
        Icon: getIconForCategory(category.name),
        Description: category.description || '',
        Status: category.status || true,
      })));
      return categoryResponse;
    } catch (err) {
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

const fetchProducts = async ({ categoryId, page = 1, limit = 10 }) => {
  setLoading(true);
  setError(null);
  try {
    const query = categoryId === 'all'
      ? `/products?page=${page}&limit=${limit}`
      : `/products?categoryID=${categoryId}&page=${page}&limit=${limit}`;

    const productResponse = await AxiosInstance().get(query);
    const fetchedProducts = (productResponse.products || [])
      // LỌC status là true (nếu trường status tồn tại, hoặc bạn muốn mặc định true)
      .filter((product) => product.status === true)
      .map((product) => {
        if (!product._id) return null;

        // 🖼️ Load ảnh trực tiếp từ product.images
        const imageURLs = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : ['https://via.placeholder.com/150'];

        // Giữ nguyên các trường, BỔ SUNG videos nếu BE đã trả về
        return {
          ProductID: product._id,
          CategoryID: product.categoryID || '',
          Name: product.name,
          Description: product.description || '',
          Price: product.price.toLocaleString('vi-VN'),
          Image: imageURLs[0],
          Images: imageURLs,
          Videos: product.videos || [],         // <--- GIỮ TRƯỜNG VIDEOS
          Rating: product.averageRating || 0,
        };
      });

    const validProducts = fetchedProducts.filter((p) => p !== null);
    setProducts((prev) => page === 1 ? validProducts : [...prev, ...validProducts]);
    return validProducts;
  } catch (err) {
    setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    return [];
  } finally {
    setLoading(false);
  }
};


  const getIconForCategory = (name: string) => {
  switch (name) {
    case 'Áo Khoác':
      return require('../assets/images/jacket.png');
    case 'Áo Polo':
      return require('../assets/images/polo-shirt.png');
    case 'Áo Thun':
    case 'T-Shirt':
    case 'tshirt':
      return require('../assets/images/tshirt.png');
    case 'Áo Sơ Mi':
    case 'Shirt':
    case 'shirt':
      return require('../assets/images/shirt.png');
    case 'Áo Khác':
      return require('../assets/images/shirt_khac.png');
    case 'Quần Dài':
    case 'Quần Tây':
      return require('../assets/images/trouser.png');
    case 'Quần Đùi':
    case 'Shorts':
      return require('../assets/images/shorts.png');
    default:
      return require('../assets/images/shirt_khac.png'); // hoặc ảnh mặc định bạn thích
  }
};

  const getProductById = (id: string) => products.find((p) => p.ProductID === id);

  const getProductsByCategory = (categoryId: string) =>
    products.filter((p) => p.CategoryID === categoryId);

  const addToCart = (product: any, quantity: number) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.ProductID === product.ProductID);
      if (existingItemIndex !== -1) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          Quantity: updatedCart[existingItemIndex].Quantity + quantity,
        };
        return updatedCart;
      }
      return [
        ...prev,
        { ...product, CartID: `${product.ProductID}-${Date.now()}`, Quantity: quantity },
      ];
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      const fetchedCategories = await fetchCategories();
      if (fetchedCategories.length > 0) {
        await fetchProducts({ categoryId: fetchedCategories[0].CategoryID, page: 1, limit: 10 });
      } else {
        await fetchProducts({ categoryId: 'all', page: 1, limit: 10 });
      }
    };
    initializeData();
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
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistId,
        fetchCategories,
        fetchProducts,
        fetchProductVariants,
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