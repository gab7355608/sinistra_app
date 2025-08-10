import { useAutoLogin } from '@/api/queries/authQueries';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/ui/Loader/Loader';

import Error from '@/features/Error';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import CarPhoto from '@/features/carPhoto/CarPhoto';
import Tickets from '@/features/consultant/Tickets';
import Profile from '@/features/users/Users';
import Users from '@/features/users/Users';
import { useAuthStore } from '@/stores/authStore';

// Import des pages client
import {
    ClaimDetail,
    Claims,
    Profile as CustomerProfile,
    NewClaim
} from '@/features/customer';

const AppRoutes = () => {
    const { isAuthenticated } = useAuthStore();
    
    // Déterminer le rôle utilisateur (pour l'exemple, on considère que tous les utilisateurs connectés sont des clients)
    // Dans un vrai projet, cette information viendrait du store auth ou d'une API
    const [userRole] = useState<'admin' | 'customer'>('customer');

    const { refetch: autoLogin, isPending } = useAutoLogin();

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    if (isPending) return <Loader />;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - fixed width */}
            {isAuthenticated && <Sidebar />}
            
            {/* Main content area - takes remaining space */}
            <main className={`flex-grow ${isAuthenticated ? 'ml-0' : ''}`}>
                <div className="h-screen overflow-hidden">
                    <Routes>
                        {/* Routes publiques */}
                        <Route element={<PublicRoutes />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </Route>

                        {/* Routes privées - Admin */}
                        <Route element={<PrivateRoutes />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/tickets" element={<Tickets />} />
                        </Route>

                        {/* Routes privées - Client */}
                        <Route element={<PrivateRoutes />}>
                            <Route path="/customer/claims" element={<Claims />} />
                            <Route path="/customer/claims/:id" element={<ClaimDetail />} />
                            <Route path="/customer/new-claim" element={<NewClaim />} />
                            <Route path="/customer/profile" element={<CustomerProfile />} />
                            <Route path="/customer/car-accident" element={<CarPhoto />} />
                        </Route>

                        {/* Route par défaut - redirection selon le rôle */}
                        <Route path="/" element={
                            isAuthenticated ? (
                                <Navigate to="/customer/claims" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        } />
                        
                        {/* Routes d'erreur */}
                        <Route path="/error" element={<Error />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AppRoutes;
