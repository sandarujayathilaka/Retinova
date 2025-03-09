import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../stores/auth";
import AdminLayout from "../layouts/AdminLayout";

const ProtectedRoute = ({ roles, redirectPath = "/signin" }) => {
  const { isLoggedIn, user } = useUserStore(state => state);

  // Check if the user is logged in and if their role is in the allowed roles
  const hasAccess = isLoggedIn && roles.includes(user?.role);

  // if (!hasAccess) {
  //   // User not authenticated or does not have the right role, redirect them to the login page
  //   return <Navigate to={redirectPath} replace />;
  // }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default ProtectedRoute;
