import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IRootState } from "../store";

interface Props {
    element: JSX.Element;
}

const ProtectedRoute = ({ element }: Props) => {
    const token = useSelector((state: IRootState) => state.auth.token);

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    return element;
};

export default ProtectedRoute;
