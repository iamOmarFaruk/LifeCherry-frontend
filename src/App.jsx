import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicLessons from './pages/PublicLessons';
import LessonDetails from './pages/LessonDetails';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotFound from './pages/NotFound';
import Loading from './components/shared/Loading';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import AddLesson from './pages/dashboard/AddLesson';
import MyLessons from './pages/dashboard/MyLessons';
import MyFavorites from './pages/dashboard/MyFavorites';
import Profile from './pages/dashboard/Profile';

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'public-lessons',
        element: <PublicLessons />
      },
      {
        path: 'lessons/:id',
        element: <LessonDetails />
      },
      {
        path: 'pricing',
        element: <Pricing />
      },
      {
        path: 'payment/success',
        element: <PaymentSuccess />
      },
      {
        path: 'payment/cancel',
        element: <PaymentCancel />
      },
      // TODO: Add more routes (dashboard, etc.)
    ]
  },
  // Dashboard Routes (with sidebar layout)
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      {
        path: 'add-lesson',
        element: <AddLesson />
      },
      {
        path: 'my-lessons',
        element: <MyLessons />
      },
      {
        path: 'my-favorites',
        element: <MyFavorites />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      // TODO: Add more dashboard routes
    ]
  },
  // 404 Route (without navbar/footer as per requirements)
  {
    path: '*',
    element: <NotFound />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1D1D1D',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E63946',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
