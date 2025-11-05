import { GoogleUser } from '../types/authResponse';

export const mapGoogleUser = (data: any): GoogleUser => ({
    id: data.id || 0,
    name: data.name || '',
    email: data.email || '',
    picture: data.picture || '',
});
