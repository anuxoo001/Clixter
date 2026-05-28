// src/routes/AuthRoute.jsx
import { Route , Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';

const MainRoute = () => ([
    <Route key="auth" element={<AuthLayout />}>
      <Route path="/auth-register" element={<Register />} />
      <Route path="/auth-login" element={<Login />} />
    </Route>
]);

export default MainRoute;
