import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { login as loginService } from '../../services/authService';
import { loginSuccess } from '../../store/authSlice';
import { googleLoginSuccess } from '../../store/googleAuthSlice';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';

declare global {
    interface Window {
        google?: any;
    }
}

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authenticateWithGoogle, loading } = useGoogleAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Iniciar Sesión'));
    }, [dispatch]);

    // 🔹 LOGIN CLÁSICO
    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginService(email, password);
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            navigate('/escritorio');
        } catch (err) {
            console.error(err);
            setError('Usuario o contraseña incorrectos');
        }
    };

    // 🔹 LOGIN CON GOOGLE (OAuth clásico, sin FedCM)
    const handleGoogleLogin = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = window.location.origin;
        const scope = 'openid email profile';
        const responseType = 'token';

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=select_account`;

        const width = 500;
        const height = 600;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;

        const popup = window.open(
            googleAuthUrl,
            'googleLogin',
            `width=${width},height=${height},top=${top},left=${left}`
        );

        const timer = setInterval(async () => {
            if (!popup || popup.closed) {
                clearInterval(timer);
                return;
            }

            try {
                const url = new URL(popup.location.href);
                if (url.origin === window.location.origin && url.hash) {
                    const params = new URLSearchParams(url.hash.slice(1));
                    const accessToken = params.get('access_token');
                    if (accessToken) {
                        console.log('✅ Token de Google:', accessToken);
                        popup.close();
                        clearInterval(timer);

                        // 🔹 Validar token con backend (plug & play)
                        try {
                            const data = await authenticateWithGoogle(accessToken);
                            if (data) {
                                dispatch(googleLoginSuccess({ user: data.user, token: data.token }));
                                navigate('/notificaciones');
                            }
                        } catch (err) {
                            console.error(err);
                            setError('Error al iniciar sesión con Google');
                        }
                    }
                }
            } catch {
                // Cross-origin hasta que el popup vuelva al redirect_uri
            }
        }, 500);
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img
                    src="/assets/images/auth/bg-gradient.png"
                    alt="bg"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                                    Iniciar Sesión
                                </h1>
                                <p className="text-base font-bold leading-normal text-white-dark">
                                    Ingresá con usuario y contraseña de Seguros
                                </p>
                            </div>

                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Email"
                                            type="email"
                                            placeholder="Enter Email"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type="password"
                                            placeholder="Enter Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                <button
                                    type="submit"
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                >
                                    Ingresar
                                </button>

                                {/* Botón de Google (tu diseño original) */}
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
                                >
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    {loading ? 'Conectando...' : 'Ingresar con Google'}
                                </button>
                            </form>

                            <div className="text-center dark:text-white mt-5">
                                ¿No tenés una cuenta?&nbsp;
                                <Link
                                    to="/auth/boxed-signup"
                                    className="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
                                >
                                    Registrate
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
