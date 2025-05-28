export const ADMIN_PATH = "/quan-tri"

export const ROUTERS = {
  USER: {
    HOME: "/",
    SIGNUP: "/dang-ky",
    SIGNIN: "/dang-nhap",
    CART: "/gio-hang",
    CHECKOUT: "/thanh-toan",
    ORDER_SUCCESS: "/dat-hang-thanh-cong",
    CONTACT: "/lien-he",
    PROFILE: "/tai-khoan",
    ORDER_HISTORY: "/lich-su-don-hang",
    CATEGORIES: "/danh-muc",
    CATEGORY_DETAIL: "/danh-muc/:id",
    BOOK_DETAIL: "/sach/:id",
  },
  ADMIN: {
    DASHBOARD: `${ADMIN_PATH}`,
    LOGIN: `${ADMIN_PATH}/dang-nhap`,
    BOOKS: `${ADMIN_PATH}/sach`,
    ADD_BOOK: `${ADMIN_PATH}/them-sach`,
    ORDERS: `${ADMIN_PATH}/don-hang`,
    CUSTOMERS: `${ADMIN_PATH}/khach-hang`,
    CATEGORIES: `${ADMIN_PATH}/danh-muc`,
    ADD_CATEGORY: `${ADMIN_PATH}/them-danh-muc`,
    STATISTICS: `${ADMIN_PATH}/thong-ke`,
  },
}

