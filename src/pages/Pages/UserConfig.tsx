import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal, { SweetAlertIcon } from "sweetalert2";

import { setPageTitle } from "../../store/themeConfigSlice";
import { IRootState } from "../../store";

import { INTEGRACIONES_CONFIG, IntegracionKey } from "../../types/integraciones";
import { useUpdateUserDataFieldMutation } from "../../store/api/usersFieldsApi";

// ------------------------------------------------------------

type ValuesMap = Record<number, string>;

const UserConfig = () => {
    const dispatch = useDispatch();

    // 🧠 Usuario desde Redux (authSlice)
    const userData = useSelector((state: IRootState) => state.auth.user);

    // -------------------------------
    // Estados generales (por si luego agregás PUT /users)
    const [general, setGeneral] = useState({ name: "", email: "" });

    // -------------------------------
    // Integraciones: valores editables por field_id
    const [values, setValues] = useState<ValuesMap>({});
    const [savingKey, setSavingKey] = useState<IntegracionKey | null>(null);

    const [updateUserDataField] = useUpdateUserDataFieldMutation();

    // -------------------------------
    // Helpers UI
    const showMessage = (msg = "", type: SweetAlertIcon = "success") => {
        Swal.fire({
            icon: type,
            title: msg,
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 2500,
            padding: "10px 20px",
        });
    };

    // -------------------------------
    useEffect(() => {
        dispatch(setPageTitle("Configuración de Usuario"));
    }, [dispatch]);

    // -------------------------------
    // Sincronizar formulario general y mapa de integraciones cuando llega el usuario
    useEffect(() => {
        if (!userData) return;

        setGeneral({
            name: userData.username || "",
            email: userData.email || "",
        });

        const nextValues: ValuesMap = {};
        (userData.user_data || []).forEach((f: any) => {
            nextValues[f.field_id] = f.value ?? "";
        });
        setValues(nextValues);
    }, [userData]);

    // -------------------------------
    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setGeneral((prev) => ({ ...prev, [id]: value }));
    };

    const setFieldValue = (fieldId: number, newValue: string) => {
        setValues((prev) => ({ ...prev, [fieldId]: newValue }));
    };

    // -------------------------------
    // Actualizar por marca (hace N PUTs, uno por field_id de esa marca)
    const handleUpdateBrand = async (key: IntegracionKey) => {
        const config = INTEGRACIONES_CONFIG.find((c) => c.key === key);
        if (!config) return;

        setSavingKey(key);

        try {
            await Promise.all(
                config.fields.map((f) =>
                    updateUserDataField({
                        field_id: f.field_id,
                        value: values[f.field_id] ?? "",
                    }).unwrap()
                )
            );

            showMessage(`Integración ${config.title} actualizada correctamente.`);
        } catch (err) {
            showMessage(`Error al actualizar ${config.title}.`, "error");
        } finally {
            setSavingKey(null);
        }
    };

    // -------------------------------
    if (!userData) {
        return <p className="text-center mt-10">Cargando datos del usuario...</p>;
    }

    return (
        <div>
            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">
                        Configuración del usuario
                    </h5>
                </div>
                {/* Integraciones: 3 paneles */}
                <div className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 bg-white dark:bg-black">
                    <h6 className="text-lg font-bold mb-5">Integraciones</h6>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {INTEGRACIONES_CONFIG.map((cfg) => {
                            const isSaving = savingKey === cfg.key;

                            return (
                                <div
                                    key={cfg.key}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#0b1220] shadow-sm"
                                >
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={cfg.logoSrc}
                                            alt={cfg.title}
                                            className={cfg.logoClassName || "w-10 h-10 rounded-full object-cover"}
                                        />
                                        <div>
                                            <p className="font-bold text-base">{cfg.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="space-y-3">
                                        {cfg.fields.map((f) => (
                                            <div key={f.field_id}>
                                                <label
                                                    htmlFor={`field-${f.field_id}`}
                                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    {f.label}
                                                </label>

                                                <input
                                                    id={`field-${f.field_id}`}
                                                    autoComplete="off"
                                                    type={f.inputType}
                                                    className="form-input w-full mt-1"
                                                    placeholder={f.placeholder}
                                                    value={values[f.field_id] ?? ""}
                                                    onChange={(e) => setFieldValue(f.field_id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action */}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-primary gap-2"
                                            onClick={() => handleUpdateBrand(cfg.key)}
                                            disabled={isSaving}                                        
                                        >
                                            {isSaving && (
                                                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-l-transparent animate-spin" />
                                            )}
                                            {isSaving ? "Actualizando..." : "Actualizar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserConfig;
