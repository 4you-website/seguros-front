import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IRootState, AppDispatch } from "../store";
import { loginSuccess, logout } from "../store/authSlice";
import { login as loginService } from "../services/authService";

export function useAuth() {
    const { user, token, isAuthenticated } = useSelector((state: IRootState) => state.auth);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        const data = await loginService(email, password);
        dispatch(loginSuccess({ user: data.user, token: data.token }));
    };

    const signout = () => {
        dispatch(logout());
        navigate("/auth/login");
    };

    return { user, token, isAuthenticated, login, logout: signout };
}
