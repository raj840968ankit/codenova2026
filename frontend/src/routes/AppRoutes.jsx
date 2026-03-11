import {Route, BrowserRouter, Routes } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { Project } from '../pages/Project';
import { UserAuth } from '../auth/UserAuth';
import { ResetPassword } from '../pages/ResetPassword';
import { AcceptInvite } from '../pages/AcceptInvite';

import { Admin } from "../pages/Admin";  //!indicate
import { AdminProtectedRoute } from './AdminProtectedRoutes';  //!indicate

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><Home/></UserAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />

        {/* indicate */}
        <Route path="/admin" element={<AdminProtectedRoute><Admin/></AdminProtectedRoute>}/>
        {/* indiate */}

      </Routes>
    </BrowserRouter>
  );
}