import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
    const { isLulus, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#3B996D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isLulus) {
        return <Navigate to="/monitoring" replace />;
    }

    return <Navigate to="/status-seleksi" replace />;
};

export default DashboardRedirect;
