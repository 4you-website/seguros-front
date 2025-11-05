// src/types/User.ts
import { UserDataExtended } from "./UserDataExtended";

export interface User {
    id: number;
    email: string;

    // 🔹 Comunes
    name?: string;
    username?: string;
    picture?: string;

    // 🔹 Tu sistema interno
    company_id?: number;
    role_id?: number | null;

    // 🔹 Datos dinámicos del usuario
    user_data?: UserDataExtended[];
}
