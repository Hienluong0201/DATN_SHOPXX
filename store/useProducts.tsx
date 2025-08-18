import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { Alert } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';

interface ProductContextType {
  categories: any[];
  products: any[];
  cart: any[];
  wishlist: any[];
  loading: boolean;
  error: string | null;

  // Lookup
  getProductById: (id: string) => any | undefined; // sync
  getProductsByCategory: (categoryId: string) => any[];
  getProductOrFetch: (id: string) => Promise<any | undefined>; // ★ NEW: đảm bảo có data theo id

  addToCart: (product: any, quantity: number) => void;

  // Wishlist
  fetchWishlist: (userId: string) => Promise<void>;
  addToWishlist: (product: any, userId: string) => Promise<void>;
  removeFromWishlist: (wishlistId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistId: (productId: string) => string | undefined;

  // Data
  fetchCategories: () => Promise<void>;
  fetchProducts: (params: { categoryId: string; page?: number; limit?: number }) => Promise<any[]>;
  fetchProductVariants: (productId: string) => Promise<any[]>;

  // ★ NEW: prefetch âm thầm nhiều sp (cache-only)
  primeProducts: (params?: { categoryId?: string; page?: number; limit?: number }) => Promise<any[]>;

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

  // ★ NEW: cache theo id để lookup O(1)
  const [productCache, setProductCache] = useState<Record<string, any>>({});

  // ★ NEW: helper upsert vào cache
  const upsertProducts = (list: any[]) => {
    if (!Array.isArray(list)) return;
    setProductCache((prev) => {
      const next = { ...prev };
      for (const p of list) {
        if (p?.ProductID) next[p.ProductID] = p;
      }
      return next;
    });
  };

  // ======================== WISHLIST ========================
  const fetchWishlist = async (userId: string) => {
    setLoading(true);
    try {
      const response = await AxiosInstance().get(`/wishlist?userID=${userId}`);
      const newWishlist = (response || []).map((item: any) => ({
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

  const addToWishlist = async (product: any, userId: string) => {
    if (wishlist.some((item) => item.ProductID === product.ProductID)) return;

    setLoading(true);
    try {
      const response = await AxiosInstance().post(`/wishlist`, {
        userID: userId,
        productID: product.ProductID,
      });

      setWishlist((prev) => [
        ...prev,
        {
          WishlistID: response._id,
          ProductID: response.productID?._id || response.productID,
          ...(typeof response.productID === 'object' ? response.productID : product),
        },
      ]);

      setError(null);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message || '';
      if (serverMsg === 'Sản phẩm đã có trong wishlist.') {
        Alert.alert('Thông báo', 'Sản phẩm đã có trong danh sách yêu thích!');
      } else {
        setError('Không thể thêm vào danh sách yêu thích.');
        Alert.alert('Lỗi', 'Không thể thêm vào danh sách yêu thích.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductVariants = async (productId: string) => {
    setLoading(true);
    try {
      const response = await AxiosInstance().get(`/productvariant/byproduct/${productId}`);
      console.log('Du lieu productdetai', response);
      console.log(`Variants for product ${productId}:`, response);
      setError(null);
      return response;
    } catch (err) {
      setError('Không thể tải các biến thể sản phẩm.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    setLoading(true);
    try {
      await AxiosInstance().delete(`/wishlist/${wishlistId}`);
      setWishlist((prev) => prev.filter((item) => item.WishlistID !== wishlistId));
    } catch (err) {
      setError('Không thể xoá khỏi danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((item) => item.ProductID === productId);
  const getWishlistId = (productId: string) => wishlist.find((item) => item.ProductID === productId)?.WishlistID;

  // ======================== DATA ========================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryResponse = await AxiosInstance().get('/category');
      setCategories(
        categoryResponse.map((category: any) => ({
          CategoryID: category._id,
          Name: category.name,
          Icon: getIconForCategory(category.name),
          Description: category.description || '',
          Status: category.status || true,
        }))
      );
      return categoryResponse;
    } catch (err) {
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const mapProduct = (product: any) => {
    if (!product?._id) return null;
    const imageURLs = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['https://via.placeholder.com/150'];
    return {
      ProductID: product._id,
      CategoryID: product.categoryID || '',
      Name: product.name,
      Description: product.description || '',
      Price: product.price?.toLocaleString ? product.price.toLocaleString('vi-VN') : `${product.price}`,
      Image: imageURLs[0],
      Images: imageURLs,
      Videos: product.videos || [],
      Rating: product.averageRating || 0,
    };
  };

  const fetchProducts = async ({ categoryId, page = 1, limit = 10 }: { categoryId: string; page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const query =
        categoryId === 'all'
          ? `/products?page=${page}&limit=${limit}`
          : `/products?categoryID=${categoryId}&page=${page}&limit=${limit}`;

      const productResponse = await AxiosInstance().get(query);
      const fetchedProducts = (productResponse.products || [])
        .filter((product: any) => product.status === true)
        .map(mapProduct)
        .filter(Boolean) as any[];

      // ★ NEW: luôn upsert vào cache, dù có hiển thị UI hay không
      upsertProducts(fetchedProducts);

      // UI list giữ logic cũ
      setProducts((prev) => (page === 1 ? fetchedProducts : [...prev, ...fetchedProducts]));
      return fetchedProducts;
    } catch (err) {
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ★ NEW: Prefetch âm thầm 50 sp (chỉ cache, không setProducts)
  const primeProducts = async ({ categoryId = 'all', page = 1, limit = 50 } = {}) => {
    try {
      const query =
        categoryId === 'all'
          ? `/products?page=${page}&limit=${limit}`
          : `/products?categoryID=${categoryId}&page=${page}&limit=${limit}`;

      const productResponse = await AxiosInstance().get(query);
      const mapped = (productResponse.products || [])
        .filter((product: any) => product.status === true)
        .map(mapProduct)
        .filter(Boolean) as any[];
       console.log("🔍 Prefetch products count:", mapped.length);
    console.log("📦 Prefetch products data:", mapped);
      upsertProducts(mapped);
      return mapped;
    } catch (err) {
      return [];
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
        return require('../assets/images/shirt_khac.png');
    }
  };

  // ======================== LOOKUP ========================
  // Sync: tìm trong UI trước, rồi rơi về cache
  const getProductById = (id: string) => {
    return products.find((p) => p.ProductID === id) || productCache[id];
  };

  const getProductsByCategory = (categoryId: string) => products.filter((p) => p.CategoryID === categoryId);

  // ★ NEW: đảm bảo lấy được sản phẩm theo id, kể cả khi chưa có trong UI list
  const getProductOrFetch = async (id: string) => {
    const inMem = productCache[id] || products.find((p) => p.ProductID === id);
    if (inMem) return inMem;

    try {
      setLoading(true);
      // ⚠️ Chỉnh endpoint này theo BE của bạn: /products/:id hoặc /product/:id
      const res = await AxiosInstance().get(`/products/${id}`);
      const product = res?.product || res; // tuỳ BE trả ra
      if (!product?._id || product.status === false) return undefined;

      const shaped = mapProduct(product);
      if (!shaped) return undefined;

      upsertProducts([shaped]);
      return shaped;
    } catch (err) {
      return undefined;
    } finally {
      setLoading(false);
    }
  };

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
      return [...prev, { ...product, CartID: `${product.ProductID}-${Date.now()}`, Quantity: quantity }];
    });
  };

  // ======================== INIT ========================
  useEffect(() => {
    const initializeData = async () => {
      const fetchedCategories = await fetchCategories();

      // UI list (10 sp)
      if (fetchedCategories.length > 0) {
        await fetchProducts({ categoryId: fetchedCategories[0].CategoryID, page: 1, limit: 10 });
      } else {
        await fetchProducts({ categoryId: 'all', page: 1, limit: 10 });
      }

      // ★ Prefetch âm thầm 50 sp (cache-only, không ảnh hưởng UI)
      primeProducts({ categoryId: 'all', page: 1, limit: 50 });
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        getProductById, // sync (có cache)
        getProductsByCategory,
        getProductOrFetch, // ★ NEW
        addToCart,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistId,
        fetchCategories,
        fetchProducts,
        fetchProductVariants,
        primeProducts, // ★ NEW
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
