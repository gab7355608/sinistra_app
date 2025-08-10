import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const PrivateRoutes = () => {
    const { isAuthenticated } = useAuthStore();
    console.log('isAuthenticated', isAuthenticated)

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
