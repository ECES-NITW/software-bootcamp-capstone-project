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
import RestrictedPage from './pages/RestrictedPage';
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
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'rent-item', element: <RentItemPage /> },
          { path: 'exchange-item', element: <ExchangeItemPage /> },
          { path: 'checkout/:id', element: <CheckoutPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'buy-items', element: <RestrictedPage featureName="Buy Items" /> },
          { path: 'sell-items', element: <RestrictedPage featureName="Sell Items" /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

// auth is a function so the access token is read on every re-connection attempt.
// Invalid Tokens are rejected by socket in backend
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
