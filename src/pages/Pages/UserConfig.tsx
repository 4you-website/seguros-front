import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useGetUserQuery } from "../../store/api/authApi";
import { IRootState } from "../../store";

import IconLinkedin from "../../components/Icon/IconLinkedin";
import IconTwitter from "../../components/Icon/IconTwitter";
import IconFacebook from "../../components/Icon/IconFacebook";
import IconGithub from "../../components/Icon/IconGithub";

const UserConfig = () => {
    const dispatch = useDispatch();

    // 🧠 Obtenemos el usuario desde Redux (authSlice)
    const userData = useSelector((state: IRootState) => state.auth.user);

    useEffect(() => {
        dispatch(setPageTitle("Configuración de Usuario"));
    }, [dispatch]);

    // Estado local editable (relleno con los datos del usuario)
    const [user, setUser] = useState({
        name: "",
        email: "",
    });

    // 🔹 Sincronizar el formulario cuando se carga el usuario
    useEffect(() => {
        if (userData) {
            setUser({
                name: userData.username || "",
                email: userData.email || "",
            });
        }
    }, [userData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;
        setUser({
            ...user,
            [id]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = () => {
        console.log("Guardando usuario:", user);
        // Más adelante: acá irá el PUT /users/{id}
    };

    // 🧭 Estados de carga o error — ahora vienen de la lógica, no de RTK Query
    if (!userData) {
        return <p className="text-center mt-10">Cargando datos del usuario...</p>;
    }

    return (
        <div>
            {/* Breadcrumb */}
            {/*  <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <span className="text-primary hover:underline">Usuarios</span>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Configuración</span>
                </li>
            </ul> */}

            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Configuración del usuario</h5>
                </div>

                {/* Formulario principal */}
                <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                    <h6 className="text-lg font-bold mb-5">Información general</h6>
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="name">Nombre Usuario</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Ej: admin"
                                    className="form-input"
                                    value={user.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Ej: romina.koniuch@seguros.com"
                                    className="form-input"
                                    value={user.email}
                                    disabled
                                />
                            </div>


                            <div className="sm:col-span-2 mt-3">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Integraciones */}
                <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 bg-white dark:bg-black">
                    <h6 className="text-lg font-bold mb-5">Integraciones</h6>

                    {!userData?.user_data?.length ? (
                        <p className="text-gray-400 italic">No hay integraciones configuradas.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    {userData.user_data.map((item) => (
        <div
            key={item.field_id}
            className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
        >
            {/* Logo aseguradora */}
            <div className="flex-shrink-0 flex justify-center items-center">
                {item.field_name.includes("atm") && (
                    <img
                        src="/assets/images/atm-cropped-favicon-32x32.png"
                        alt="ATM"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                )}

                {item.field_name.includes("sancor") && (
                    <img
                        src="/assets/images/sancor-logo.svg"
                        alt="Sancor"
                        className="w-16 h-10 object-contain rounded-md bg-white p-1"
                    />
                )}

                {item.field_name.includes("provincia") && (
                    <img
                        src="/assets/images/provincia-logo.png"
                        alt="Provincia Seguros"
                        className="w-16 h-10 object-contain rounded-md bg-white p-1"
                    />
                )}

                {/* Fallback genérico */}
                {!item.field_name.includes("atm") &&
                    !item.field_name.includes("sancor") &&
                    !item.field_name.includes("provincia") && (
                        <img
                            src="/assets/images/default-logo.png"
                            alt="Integración"
                            className="w-10 h-10 rounded-full object-cover opacity-80"
                        />
                    )}
            </div>

            {/* Campos de usuario / contraseña */}
            <div className="flex-1">
                <label
                    htmlFor={`field-${item.field_id}`}
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize"
                >
                    {item.field_name
                        .replace(/_/g, " ")
                        .replace("username", "Usuario")
                        .replace("password", "Contraseña")}
                </label>

                <input
                    id={`field-${item.field_id}`}
                    type={
                        item.field_name.includes("password")
                            ? "password"
                            : "text"
                    }
                    className="form-input w-full mt-1"
                    value={item.value || ""}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        const updatedFields =
                            userData.user_data?.map((f) =>
                                f.field_id === item.field_id
                                    ? { ...f, value: newValue }
                                    : f
                            ) ?? [];

                        setUser((prev) => ({
                            ...prev,
                            user_data: updatedFields,
                        }));
                    }}
                />
            </div>
        </div>
    ))}
</div>


                    )}
                </form>

            </div>
        </div>
    );
};

export default UserConfig;
