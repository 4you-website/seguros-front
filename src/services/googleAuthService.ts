import { AuthResponse } from '../types/authResponse';
import { URL_API } from "./api";

export async function verifyGoogleToken(idToken: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${URL_API}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // 👇 Enviamos el id_token dentro del body, como el backend espera
            body: JSON.stringify({ id_token: idToken }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', response.status, errorText);
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Respuesta del backend:', data);
        return data;
    } catch (error) {
        console.error('❌ Error verificando token de Google:', error);
        throw new Error('Error verificando token de Google');
    }
}
