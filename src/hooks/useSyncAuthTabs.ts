import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

/**
 * Sincroniza el estado de autenticación entre pestañas.
 * Si se borra el token en localStorage desde otra pestaña,
 * dispara el logout global en la app actual.
 */
export function useSyncAuthTabs() {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // 👇 Si el token se borra (logout desde otra pestaña)
            if (event.key === "token" && !event.newValue) {
                dispatch(logout());
                // Redirigimos a la pantalla de login
                window.location.href = "/auth/login";
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [dispatch]);
}
