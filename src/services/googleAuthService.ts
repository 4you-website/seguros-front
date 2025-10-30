import { GoogleAuthResponse } from '../types/googleAuthType';
import { URL_API } from "./api";

export async function verifyGoogleToken(accessToken: string): Promise<GoogleAuthResponse> {
    try {
        // ✅ Real: descomentar cuando el backend esté disponible
        /*
        const response = await fetch(`${URL_API}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return await response.json();
        */

        // 🧪 Mock temporal
        console.log('🔹 Simulando validación en backend con token:', accessToken);
        return {
            user: {
                id: 1,
                name: 'Usuario Google Demo',
                email: 'user@gmail.com',
                picture: 'https://lh3.googleusercontent.com/a/default-user',
            },
            token: 'fake-jwt-token',
        };
    } catch (error) {
        console.error('❌ Error verificando token de Google:', error);
        throw new Error('Error verificando token de Google');
    }
}
