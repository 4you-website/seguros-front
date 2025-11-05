import { useState } from 'react';
import { verifyGoogleToken } from '../services/googleAuthService';
import { AuthResponse } from '../types/authResponse';

export function useGoogleAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const authenticateWithGoogle = async (accessToken: string): Promise<AuthResponse | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await verifyGoogleToken(accessToken);
            return response;
        } catch (err) {
            console.error(err);
            setError('Error verificando token de Google');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { authenticateWithGoogle, loading, error };
}
