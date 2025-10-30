import { URL_API } from "./api";
import { AuthResponse } from "../types/index";


export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${URL_API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Error al hacer login");
    }

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data); // 👀 para debug

    if (!data.token || !data.user) {
        throw new Error("No se recibió token o datos de usuario");
    }

    return {
        user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            company_id: data.user.company_id,
            role_id: data.user.role_id,
        },
        token: data.token,
        user_data: data.user_data ?? [],
    };
};
