import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'

//Here the RootLayout component has an Outlet component inside it
//It changes when the path changes , and renders the element linked to new path
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {index:true, element: <HomePage />},
      //Add all the new pages here
      { path: 'feed', element: <FeedPage /> },  
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
