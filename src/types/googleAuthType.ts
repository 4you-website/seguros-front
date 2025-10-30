export interface GoogleUser {
    id: number;
    name: string;
    email: string;
    picture?: string;
}

export interface GoogleAuthResponse {
    user: GoogleUser;
    token: string;
}

export interface GoogleAuthState {
    user: GoogleUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
