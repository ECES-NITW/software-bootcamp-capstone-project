import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import RentItemPage from './pages/RentItemPage';
import ExchangeItemPage from './pages/ExchangeItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ChatPage from './pages/ChatPage';
import BuyPage from './pages/BuyPage';
import PostItemsPage from './pages/PostItemsPage';
import WishlistPage from './pages/WishlistPage';
import ProtectedRoute from './components/ProtectedRoute';
import { io } from "socket.io-client";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'item/:id', element: <ItemDetailPage /> },
      { path: 'buy-items', element: <BuyPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'rent-item', element: <RentItemPage /> },
          { path: 'exchange-item', element: <ExchangeItemPage /> },
          { path: 'checkout/:id', element: <CheckoutPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'sell-items', element: <PostItemsPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("access_token") }),
});

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
