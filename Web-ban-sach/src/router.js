import BookDetail from "pages/user/book-detail"
import Cart from "pages/user/cart"
import Checkout from "pages/user/checkout"
import Contact from "pages/user/contact"
import OrderSuccess from "pages/user/order-success"
import Signin from "pages/user/signin"
import Signup from "pages/user/signup"
import { Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/user/homepage"
import MasterUserLayout from "./pages/user/theme/masterLayout"
import { ADMIN_PATH, ROUTERS } from "./utils/router"

import MasterAdminLayout from "pages/admin/theme/masterLayout"

import AddBook from "pages/admin/add-book"
import Books from "pages/admin/books"
import Login from "pages/admin/login"
import Orders from "pages/admin/orders"
import Profile from "pages/user/profile"
import OrderHistory from "pages/user/order-history"
import Categories from "pages/user/categories"
import OrderDetail from "pages/user/order-detail"
import CategoryBooks from "pages/user/categories/CategoryBooks"

// Import thêm các trang quản lý admin
import AdminCategories from "pages/admin/categories"
import AddCategory from "pages/admin/add-category"
import Customers from "pages/admin/customers"
import Statistics from "pages/admin/statistics"
import NotFound from "pages/not-found"

const renderUserRouter = () => {
  const UserRouters = [
    {
      path: ROUTERS.USER.HOME,
      component: <HomePage />,
    },
    {
      path: "/categories",
      component: <Categories />,
    },
    {
      path: "/order/:orderId",
      component: <OrderDetail />,
    },
    {
      path: ROUTERS.USER.SIGNUP,
      component: <Signup />,
    },
    {
      path: ROUTERS.USER.SIGNIN,
      component: <Signin />,
    },
    {
      path: ROUTERS.USER.CHECKOUT,
      component: <Checkout />,
    },
    {
      path: "/sach/:id",
      component: <BookDetail />,
    },
    {
      path: ROUTERS.USER.CART,
      component: <Cart />,
    },
    {
      path: ROUTERS.USER.ORDER_SUCCESS,
      component: <OrderSuccess />,
    },
    {
      path: ROUTERS.USER.CONTACT,
      component: <Contact />,
    },
    {
      path: ROUTERS.USER.PROFILE,
      component: <Profile />,
    },
    {
      path: ROUTERS.USER.ORDER_HISTORY,
      component: <OrderHistory />,
    },
    {
      path: "/category/:categoryId",
      component: <CategoryBooks />,
    },
    // Thêm route 404 cho user
    {
      path: "*",
      component: <NotFound />,
    },
  ]
  return (
    <MasterUserLayout>
      <Routes>
        {UserRouters.map((item, key) => (
          <Route key={key} path={item.path} element={item.component} />
        ))}
      </Routes>
    </MasterUserLayout>
  )
}

const renderAdminRouter = () => {
  const AdminRouters = [
    {
      path: ROUTERS.ADMIN.LOGIN,
      component: <Login />,
    },
    // Thay thế Dashboard bằng Statistics cho trang chính
    {
      path: ROUTERS.ADMIN.DASHBOARD,
      component: <Statistics />,
    },
    {
      path: ROUTERS.ADMIN.BOOKS,
      component: <Books />,
    },
    {
      path: ROUTERS.ADMIN.ADD_BOOK,
      component: <AddBook />,
    },
    {
      path: ROUTERS.ADMIN.ORDERS,
      component: <Orders />,
    },
    // Các route admin khác
    {
      path: ROUTERS.ADMIN.CATEGORIES,
      component: <AdminCategories />,
    },
    {
      path: ROUTERS.ADMIN.ADD_CATEGORY,
      component: <AddCategory />,
    },
    {
      path: ROUTERS.ADMIN.CUSTOMERS,
      component: <Customers />,
    },
    {
      path: ROUTERS.ADMIN.STATISTICS,
      component: <Statistics />,
    },
    // Route 404 cho admin
    {
      path: `${ADMIN_PATH}/*`,
      component: <NotFound />,
    },
  ]
  return (
    <MasterAdminLayout>
      <Routes>
        {AdminRouters.map((item, key) => (
          <Route key={key} path={item.path} element={item.component} />
        ))}
      </Routes>
    </MasterAdminLayout>
  )
}

const RouterCustom = () => {
  const location = useLocation()
  const isAdminRouter = location.pathname.startsWith(ADMIN_PATH)

  return isAdminRouter ? renderAdminRouter() : renderUserRouter()
}

export default RouterCustom




