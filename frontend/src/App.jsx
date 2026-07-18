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

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'rent-item', element: <RentItemPage /> },
      { path: 'exchange-item', element: <ExchangeItemPage /> },
      { path: 'item/:id', element: <ItemDetailPage /> },
      { path: 'checkout/:id', element: <CheckoutPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'buy-items', element: <RestrictedPage featureName="Buy Items" /> },
      { path: 'sell-items', element: <RestrictedPage featureName="Sell Items" /> }
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
