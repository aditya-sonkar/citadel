import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    // Spec requires /register — aliased to the same signup page
    path: '/register',
    element: <SignupPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
]);

