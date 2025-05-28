import axios from 'axios'
import { API_URL } from './constants'

// Tạo instance axios với URL cơ sở
const api = axios.create({
  baseURL: API_URL,
})

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message || error)
    return Promise.reject(error)
  }
)

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API cho sách
export const bookAPI = {
  getAllBooks: (params) => {
    return api.get("/books", { params })
  },
  
  getBookById: (id) => {
    if (!id) {
      console.error("getBookById called with invalid id:", id)
      return Promise.reject(new Error("ID sách không hợp lệ"))
    }
    console.log("Calling API to get book by ID:", id)
    return api.get(`/books/${id}`)
  },
  
  getBooksByCategory: (categoryId, params = {}) => {
    if (!categoryId) {
      console.error("getBooksByCategory called with invalid categoryId:", categoryId)
      return Promise.reject(new Error("ID danh mục không hợp lệ"))
    }
    console.log("Calling API to get books by category:", categoryId, params)
    return api.get(`/books/category/${categoryId}`, { params })
  },
  
  getBestsellers: (limit = 8) => {
    return api.get("/books/bestsellers", { params: { limit } })
  },
  
  getNewArrivals: (limit = 8) => {
    return api.get("/books/new-arrivals", { params: { limit } })
  },
  
  searchBooks: (params) => {
    return api.get("/books/search", { params })
  },
  
  createBook: (bookData) => {
    return api.post("/books", bookData)
  },
  
  updateBook: (id, bookData) => {
    return api.put(`/books/${id}`, bookData)
  },
  
  deleteBook: (id) => {
    return api.delete(`/books/${id}`)
  },
}

// API cho danh mục
export const categoryAPI = {
  getAllCategories: () => {
    return api.get("/categories")
  },
  
  getCategoryById: (id) => {
    if (!id) {
      console.error("getCategoryById called with invalid id:", id)
      return Promise.reject(new Error("Invalid category ID"))
    }
    return api.get(`/categories/${id}`)
  },
  
  createCategory: (categoryData) => {
    return api.post("/categories", categoryData)
  },
  
  updateCategory: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData)
  },
  
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`)
  },
}

// API cho người dùng
export const userAPI = {
  login: (credentials) => {
    return api.post("/auth/login", credentials)
  },
  
  register: (userData) => {
    return api.post("/auth/register", userData)
  },
  
  getProfile: () => {
    return api.get("/users/profile")
  },
  
  updateProfile: (userData) => {
    return api.put("/users/profile", userData)
  },
}

// API cho đơn hàng
export const orderAPI = {
  createOrder: (orderData) => {
    return api.post("/orders", orderData)
  },
  
  getOrders: () => {
    return api.get("/orders")
  },
  
  getOrderById: (id) => {
    return api.get(`/orders/${id}`)
  },
  
  // Sửa đường dẫn API từ /orders/admin thành /orders
  getAllOrders: (params) => {
    return api.get("/orders", { params })
  },
  
  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status`, status)
  },
  
  getOrderStats: () => {
    return api.get("/orders/stats")
  },
  
  getRecentOrders: (limit = 5) => {
    return api.get("/orders/recent", { params: { limit } })
  },
  
  getUserOrders: () => {
    return api.get("/orders/user/me")
  },
  
  getOrderHistory: (params) => {
    return api.get("/orders/history", { params })
  }
}

// API cho xác thực (auth)
export const authAPI = {
  login: (credentials) => {
    return api.post("/auth/login", credentials)
  },
  
  register: (userData) => {
    return api.post("/auth/register", userData)
  },
  
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return Promise.resolve()
  },
  
  getAllUsers: () => {
    return api.get("/users")
  },
  
  getUserById: (id) => {
    return api.get(`/users/${id}`)
  },
}

// API cho thống kê
export const statsAPI = {
  getRevenueStats: (dateRange) => {
    return api.get("/stats/revenue", { params: dateRange })
  },
  
  getRevenueTimeline: (timelineType) => {
    return api.get("/stats/revenue/timeline", { params: { type: timelineType } })
  },
  
  getTopSellingBooks: (limit = 5) => {
    return api.get("/stats/top-selling-books", { params: { limit } })
  },
}

// API cho thanh toán
export const paymentAPI = {
  createPaymentIntent: (orderData) => {
    return api.post("/payment/create-payment-intent", orderData)
  },
  
  verifyPayment: (paymentId) => {
    return api.post("/payment/verify", { paymentId })
  },
}

export default api
