import { Navigate } from 'react-router-dom';

interface Props {
    element: JSX.Element;
}

const ProtectedRoute = ({ element }: Props) => {
    const token = localStorage.getItem('token'); // 👈 mismo nombre que en authSlice

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    return element;
};

export default ProtectedRoute;
