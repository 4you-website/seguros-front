import { useEffect, useState, type CSSProperties } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import Swal from "sweetalert2";
import IconSend from "../../components/Icon/IconSend";
import Select from "react-select";

import { useGetBrandsQuery } from "../../store/api/brandsApi";
import { useGetModelsQuery } from "../../store/api/modelsApi";
import { useGetStatesQuery } from "../../store/api/statesApi";

import { compartirPorWhatsApp } from "../../utils/whatsappUtils";
import { formatNumber } from "../../utils/formatNumber";

import { getLocalidadesByProvincia } from "../../utils/localidadesUtils";
import {
    findStateByProvinciaNombre,
    mapApiProvinceNameToLocalidades,
} from "../../utils/matchProvinciaJSONvsAPI";

import IconSave from "../../components/Icon/IconSave";
import IconChecks from "../../components/Icon/IconChecks";

import { useCotizarMutation } from "../../store/api/assuranceApi";
import type { CotizarPayload, Cotizacion, CotizacionPlan } from "../../types/Cotizacion";

// ⭐ Catálogo de compañías para las cápsulas
const COMPANIAS = [
    { id: "atm", label: "ATM" },
    { id: "provincia", label: "Provincia" },
    { id: "fedpat", label: "FedPat" },
    { id: "sancor", label: "Sancor" },
];

// ⭐ Colores por compañía
const COMPANIA_COLORS: Record<string, string> = {
    atm: "#762C43",
    provincia: "#274380",
    sancor: "#C00869",
    fedpat: "#0858A4",
};

const getCompaniaColor = (id: string) => COMPANIA_COLORS[id] ?? "#111827";

const getCompaniaButtonStyle = (id: string, active: boolean): CSSProperties => {
    const color = getCompaniaColor(id);
    return active
        ? { backgroundColor: color, borderColor: color, color: "#fff" }
        : { borderColor: color, color };
};

const getCompaniaTagStyle = (id: string): CSSProperties => ({
    backgroundColor: getCompaniaColor(id),
});

const Cotizador = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle("Cotizador"));
    }, [dispatch]);

    const [form, setForm] = useState({
        anio: "2018",
        codpostal: "1704",
        es0km: "N",
        marca: "",
        modelo: "",
        provincia: "",
        localidad: "",
        valordelvehiculo: "20000000",
    });

    // -----------------------------
    // Provincias / Localidades (manuales)
    // -----------------------------
    const [localidades, setLocalidades] = useState<string[]>([]);
    const [selectedProvinciaNombre, setSelectedProvinciaNombre] = useState<string>("");

    // -----------------------------
    const [loadingCP, setLoadingCP] = useState(false);

    // Estados locales para la respuesta
    const [planes, setPlanes] = useState<CotizacionPlan[]>([]);
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);

    // RTK Query hooks
    const { data: brands = [], isLoading: loadingBrands } = useGetBrandsQuery();
    const { data: states = [], isLoading: loadingStates } = useGetStatesQuery();
    const { data: models = [], isLoading: loadingModels } = useGetModelsQuery(
        form.marca || undefined
    );

    const [filtro, setFiltro] = useState<"todos" | "riesgo" | "terceros" | "civil" | "robo">(
        "todos"
    );

    const [filtroCompania, setFiltroCompania] = useState<
        "todas" | "atm" | "provincia" | "fedpat" | "sancor"
    >("todas");

    const [planesSeleccionados, setPlanesSeleccionados] = useState<CotizacionPlan[]>([]);

    // compañías seleccionadas (por defecto todas)
    const [companiasSeleccionadas, setCompaniasSeleccionadas] = useState<string[]>(
        COMPANIAS.map((c) => c.id)
    );

    // Mutación RTK Query para /assurance/cotizar
    const [cotizarApi, { isLoading: loadingCotizar }] = useCotizarMutation();

    const buscarPorCodigoPostal = async () => {
        const codigo = form.codpostal.trim();
        if (!codigo) {
            Swal.fire({
                icon: "warning",
                title: "Ingrese un código postal válido",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }

        setLoadingCP(true);

        // 🔹 Nos aseguramos de tener cargadas las provincias de tu API
        if (!states.length) {
            Swal.fire({
                icon: "info",
                title: "Cargando provincias...",
                text: "Esperá un momento y volvé a intentar.",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2500,
            });
            setLoadingCP(false);
            return;
        }

        try {
            // ✅ Llamamos a la API externa
            const res = await fetch(`https://api.zippopotam.us/ar/${codigo}`);
            if (!res.ok) throw new Error("Código postal no encontrado");

            const data = await res.json();

            const place = data.places?.[0];
            if (!place) throw new Error("Sin resultados");

            const localidadApi = place["place name"] || "";
            const provinciaApiNombre = place["state"] || "";

            console.log("CP API →", { localidadApi, provinciaApiNombre });

            // 🔍 Matcheamos el nombre de provincia de la API externa con tu /states
            const stateMatch = findStateByProvinciaNombre(provinciaApiNombre, states);

            if (!stateMatch) {
                Swal.fire({
                    icon: "info",
                    title: "Provincia no encontrada en el catálogo",
                    text: "Se encontró la provincia por código postal, pero no coincide con las provincias de la API. Seleccionála manualmente.",
                    toast: true,
                    position: "top",
                    showConfirmButton: false,
                    timer: 4000,
                });

                setForm((prev) => ({
                    ...prev,
                    codpostal: codigo,
                    localidad: localidadApi,
                    provincia: "",
                }));

                setSelectedProvinciaNombre(provinciaApiNombre);
                setLocalidades(getLocalidadesByProvincia(provinciaApiNombre));
                return;
            }

            // ✅ Caso OK
            setForm((prev) => ({
                ...prev,
                codpostal: codigo,
                localidad: localidadApi,
                provincia: stateMatch.id.toString(),
            }));

            setSelectedProvinciaNombre(provinciaApiNombre);
            setLocalidades(getLocalidadesByProvincia(provinciaApiNombre));
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "info",
                title: "No se encontró el código postal",
                text: "Podés ingresar provincia y localidad manualmente.",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2500,
            });

            setSelectedProvinciaNombre("");
            setLocalidades([]);
            setForm((prev) => ({ ...prev, localidad: "", provincia: "" }));
        } finally {
            setLoadingCP(false);
        }
    };

    const planesFiltrados = planes.filter((plan) => {
        // 1️⃣ Filtro por compañía
        if (filtroCompania !== "todas" && plan.aseguradora !== filtroCompania) {
            return false;
        }

        // 2️⃣ Filtro por tipo de cobertura
        const desc = (plan.cubre || "").toLowerCase();

        if (filtro === "riesgo") return desc.includes("todo riesgo");
        if (filtro === "terceros") return desc.includes("terceros");
        if (filtro === "civil") return desc.includes("civil");
        if (filtro === "robo") return desc.includes("robo") || desc.includes("hurto");

        return true; // "todos"
    });

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
    };

    const toggleSeleccion = (plan: CotizacionPlan) => {
        setPlanesSeleccionados((prev) =>
            prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
        );
    };

    // Toggle para las cápsulas de compañías
    const toggleCompania = (id: string) => {
        setCompaniasSeleccionadas((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const getCompaniaLabel = (id: string) =>
        COMPANIAS.find((c) => c.id === id)?.label || id.toUpperCase();

    // 🔹 Cotizar en la API real /assurance/cotizar
    // 🔹 Cotizar en la API real /assurance/cotizar
    const cotizar = async () => {
        // Modal "Cotizando..." con loader
        Swal.fire({
            title: "Cotizando...",
            html: "Estamos consultando las aseguradoras, por favor esperá.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const payload: CotizarPayload = {
                anio: form.anio,
                aseguradoras: companiasSeleccionadas,
                codpostal: form.codpostal,
                es0km: form.es0km,
                marca: form.marca,
                modelo: form.modelo,
                provincia: form.provincia,
                valordelvehiculo: form.valordelvehiculo,
            };

            console.log("Payload /assurance/cotizar:", payload);

            const data = await cotizarApi(payload).unwrap();

            setCotizacion(data);
            setPlanes(data.planes || []);

            // Reemplaza el modal de loading por el OK
            Swal.fire({
                icon: "success",
                title: "¡Listo!",
                text: "Cotización obtenida correctamente.",
                showConfirmButton: false,
                timer: 1600,
            });
        } catch (error: any) {
            console.error("Error al cotizar en la API:", error);

            Swal.fire({
                icon: "error",
                title: "Error al cotizar",
                text:
                    error?.data?.message ||
                    "No se pudo obtener la cotización. Revisá la consola.",
                confirmButtonText: "Entendido",
            });
        }
    };


    // Placeholder para guardar las cotizaciones
    const guardarEnCliente = () => {
        Swal.fire({
            icon: "info",
            title: "Guardar en Cliente",
            text: "Esta función aún no está implementada.",
            confirmButtonText: "Entendido",
        });
    };

    return (
        <>
            <div className="panel max-w-5xl mx-auto p-6 border-white-light dark:border-[#1b2e4b]">
                <h1 className="font-bold text-2xl mb-6">Formulario de Cotización</h1>

                {/* FORMULARIO */}
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Código Postal */}
                    <div>
                        <label htmlFor="codpostal" className="font-semibold">
                            Código Postal
                        </label>
                        <div className="flex">
                            <input
                                id="codpostal"
                                type="text"
                                className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                placeholder="Ej: 1706"
                                value={form.codpostal}
                                onChange={changeValue}
                            />
                            <button
                                type="button"
                                onClick={buscarPorCodigoPostal}
                                className="bg-[#eee] dark:bg-[#1b2e4b] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 border border-white-light dark:border-[#17263c] hover:bg-primary hover:text-white transition"
                                title="Buscar por código postal"
                                disabled={loadingCP}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="hidden sm:block"></div>

                    {/* Provincia (API / con IDs) */}
                    <div>
                        <label htmlFor="provincia" className="font-semibold">
                            Provincia
                        </label>
                        <Select
                            id="provincia"
                            placeholder={loadingStates ? "Cargando provincias..." : "Seleccione una provincia"}
                            options={states.map((s) => ({
                                value: s.id.toString(),
                                label: s.name,
                            }))}
                            value={
                                form.provincia
                                    ? {
                                        value: form.provincia,
                                        label: states.find((s) => s.id.toString() === form.provincia)?.name || "",
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                const provinciaId = selected?.value || "";
                                const apiName = selected?.label || "";

                                setForm((prev) => ({
                                    ...prev,
                                    provincia: provinciaId,
                                }));

                                if (!apiName) {
                                    setSelectedProvinciaNombre("");
                                    setLocalidades([]);
                                    setForm((prev) => ({ ...prev, localidad: "" }));
                                    return;
                                }

                                const nombreLocalidades = mapApiProvinceNameToLocalidades(apiName);

                                if (nombreLocalidades) {
                                    setSelectedProvinciaNombre(nombreLocalidades);
                                    setLocalidades(getLocalidadesByProvincia(nombreLocalidades));
                                } else {
                                    setSelectedProvinciaNombre("");
                                    setLocalidades([]);
                                    setForm((prev) => ({ ...prev, localidad: "" }));
                                }
                            }}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Localidad */}
                    <div>
                        <label htmlFor="localidad" className="font-semibold">
                            Localidad
                        </label>
                        <Select
                            id="localidad"
                            placeholder={localidades.length ? "Seleccione una localidad" : "Seleccione provincia primero"}
                            options={localidades.map((l) => ({ value: l, label: l }))}
                            value={form.localidad ? { value: form.localidad, label: form.localidad } : null}
                            onChange={(selected) =>
                                setForm((prev) => ({
                                    ...prev,
                                    localidad: selected?.value || "",
                                }))
                            }
                            isDisabled={!selectedProvinciaNombre}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Marca */}
                    <div>
                        <label htmlFor="marca" className="font-semibold">
                            Marca
                        </label>
                        <Select
                            id="marca"
                            placeholder={loadingBrands ? "Cargando marcas..." : "Seleccione una marca"}
                            options={brands.map((b) => ({
                                value: b.id.toString(),
                                label: b.name,
                            }))}
                            value={
                                form.marca
                                    ? {
                                        value: form.marca,
                                        label: brands.find((b) => b.id.toString() === form.marca)?.name || "",
                                    }
                                    : null
                            }
                            onChange={(selected) =>
                                setForm({
                                    ...form,
                                    marca: selected?.value || "",
                                    modelo: "",
                                })
                            }
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Modelo */}
                    <div>
                        <label htmlFor="modelo" className="font-semibold">
                            Modelo
                        </label>
                        <Select
                            id="modelo"
                            placeholder={loadingModels ? "Cargando modelos..." : "Seleccione un modelo"}
                            options={models.map((m) => ({
                                value: m.id.toString(),
                                label: m.name,
                            }))}
                            value={
                                form.modelo
                                    ? {
                                        value: form.modelo,
                                        label: models.find((m) => m.id.toString() === form.modelo)?.name || "",
                                    }
                                    : null
                            }
                            onChange={(selected) =>
                                setForm({
                                    ...form,
                                    modelo: selected?.value || "",
                                })
                            }
                            isDisabled={loadingModels}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Es 0km */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="es0km" className="font-semibold">
                            ¿Es 0 km?
                        </label>
                        <label className="w-12 h-6 relative">
                            <input
                                type="checkbox"
                                id="es0km"
                                checked={form.es0km === "S"}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        es0km: e.target.checked ? "S" : "N",
                                    })
                                }
                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                            />
                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                        </label>
                    </div>

                    {/* Valor del vehículo */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="valordelvehiculo" className="font-semibold whitespace-nowrap">
                            Valor del Vehículo
                        </label>
                        <input
                            id="valordelvehiculo"
                            type="number"
                            className="form-input"
                            value={form.valordelvehiculo}
                            onChange={changeValue}
                        />
                    </div>

                    {/* Año */}
                    <div>
                        <label htmlFor="anio" className="font-semibold">
                            Año
                        </label>
                        <input id="anio" type="text" className="form-input" value={form.anio} onChange={changeValue} />
                    </div>

                    {/* Cápsulas de compañías */}
                    <div className="sm:col-span-2 mt-2">
                        <label className="font-semibold mb-2 block">Cotizar en</label>
                        <div className="flex flex-wrap gap-2">
                            {COMPANIAS.map((c) => {
                                const isActive = companiasSeleccionadas.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleCompania(c.id)}
                                        style={getCompaniaButtonStyle(c.id, isActive)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition hover:opacity-90
                                            ${isActive ? "shadow-sm" : "bg-white dark:bg-[#1b2e4b] hover:bg-primary/10"}`}
                                    >
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botón Cotizar */}
                    <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
                            onClick={cotizar}
                            disabled={loadingCotizar}
                        >
                            <IconSend />
                            {loadingCotizar ? "Cotizando..." : "Cotizar"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ---------------- RESULTADOS ---------------- */}
            <div className="panel w-full my-5 px-0 border-white-light dark:border-[#1b2e4b]">
                {planes.length > 0 && (
                    <div className="w-full my-8">
                        <h2 className="text-xl font-bold mb-4 text-center">Planes Cotizados</h2>

                        {/* Filtros */}
                        <div className="sticky top-[70px] z-20 w-full bg-white dark:bg-[#0d1727] border-b border-gray-200 dark:border-gray-700 py-4 mb-8">
                            {/* Filtros por tipo de cobertura */}
                            <div className="flex flex-wrap justify-center gap-3 ">
                                {[
                                    { value: "todos", label: "Todos" },
                                    { value: "riesgo", label: "Todo Riesgo" },
                                    { value: "terceros", label: "Terceros" },
                                    { value: "civil", label: "Responsabilidad Civil" },
                                    { value: "robo", label: "Robo / Hurto" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFiltro(opt.value as typeof filtro)}
                                        className={`px-4 py-2 rounded-full border font-medium transition ${filtro === opt.value
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-primary/10"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Filtros por compañía */}
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Filtrar por compañía
                                </span>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {/* Botón "Todas" */}
                                    <button
                                        type="button"
                                        onClick={() => setFiltroCompania("todas")}
                                        className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border font-medium transition ${filtroCompania === "todas"
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-primary/10"
                                            }`}
                                    >
                                        Todas
                                    </button>

                                    {/* Botones por compañía (con color) */}
                                    {COMPANIAS.map((c) => {
                                        const isActive = filtroCompania === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setFiltroCompania(c.id as typeof filtroCompania)}
                                                style={getCompaniaButtonStyle(c.id, isActive)}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border font-medium transition hover:opacity-90 ${isActive ? "" : "bg-white dark:bg-[#1b2e4b] hover:bg-primary/10"
                                                    }`}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* GRID de planes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-6">
                            {planesFiltrados.map((plan, index) => {
                                const desc = (plan.cubre || "").toLowerCase();
                                let color = "from-gray-400 to-gray-500";

                                if (desc.includes("todo riesgo")) {
                                    color = "from-purple-600 to-pink-500";
                                } else if (desc.includes("terceros")) {
                                    color = "from-emerald-500 to-teal-400";
                                } else if (desc.includes("civil")) {
                                    color = "from-orange-400 to-yellow-500";
                                } else if (desc.includes("robo") || desc.includes("hurto")) {
                                    color = "from-blue-600 to-cyan-400";
                                } else {
                                    color = "from-indigo-500 to-blue-500";
                                }

                                return (
                                    <div
                                        id={`card-${plan.aseguradora}-${plan.plan}-${plan.idCotizacion}-${index}`}
                                        key={`${plan.aseguradora}-${plan.plan}-${plan.idCotizacion}-${index}`}
                                        className="flex flex-col justify-between relative bg-white dark:bg-[#0d1727] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition hover:shadow-2xl hover:-translate-y-1 duration-300"
                                    >
                                        {/* Header */}
                                        <div className={`bg-gradient-to-r ${color} text-white text-center py-6`}>
                                            <div className="flex justify-between items-center px-4 text-xs opacity-80">
                                                <span>#{plan.idCotizacion}</span>

                                                {/* TAG compañía con color por aseguradora */}
                                                <span
                                                    style={getCompaniaTagStyle(plan.aseguradora)}
                                                    className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide text-white"
                                                >
                                                    {getCompaniaLabel(plan.aseguradora)}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold mt-2 uppercase tracking-wide px-4">
                                                {plan.plan}
                                            </h3>
                                            <p className="text-xs mt-1 opacity-90 px-4">{plan.cubre}</p>
                                            <p className="text-xl font-semibold mt-3">
                                                ${formatNumber(plan.cuota)}
                                                <span className="text-sm opacity-80 ml-1">/{plan.frecuencia}</span>
                                            </p>
                                        </div>

                                        {/* Cuerpo */}
                                        <div className="p-6 text-center flex-1">
                                            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2 mb-5">
                                                <li>
                                                    🏢 <strong>Compañía:</strong>{" "}
                                                    <span className="font-semibold">{getCompaniaLabel(plan.aseguradora)}</span>
                                                </li>
                                                <li>
                                                    ✅ <strong>Cuota:</strong>{" "}
                                                    <span className="font-semibold text-primary">${formatNumber(plan.cuota)}</span>
                                                </li>
                                                <li>
                                                    🛡️ <strong>Suma asegurada:</strong>{" "}
                                                    <span className="font-semibold">${formatNumber(plan.sumaAsegurada)}</span>
                                                </li>
                                                {plan.ajuste && (
                                                    <li>
                                                        ⚙️ <strong>Ajuste:</strong>{" "}
                                                        <span className="font-semibold">{plan.ajuste}</span>
                                                    </li>
                                                )}
                                                <li data-hide-on-share="true">
                                                    💰 <strong>Comisión:</strong>{" "}
                                                    <span className="font-semibold">${formatNumber(plan.comision)}</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 pb-6 flex flex-col gap-3" data-hide-on-share="true">
                                            <button
                                                type="button"
                                                onClick={() => toggleSeleccion(plan)}
                                                className={`w-full py-2 rounded-lg font-semibold transition ${planesSeleccionados.includes(plan)
                                                        ? "bg-[#153272] text-white"
                                                        : "bg-primary text-white hover:bg-primary/80"
                                                    }`}
                                            >
                                                {planesSeleccionados.includes(plan) ? (
                                                    <>
                                                        <IconChecks className="inline-block w-4 h-4 mr-1" />
                                                        Seleccionado
                                                    </>
                                                ) : (
                                                    "Seleccionar Plan"
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    compartirPorWhatsApp(
                                                        `card-${plan.aseguradora}-${plan.plan}-${plan.idCotizacion}-${index}`,
                                                        plan,
                                                        null,
                                                        cotizacion
                                                    )
                                                }
                                                className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                                            >
                                                <img src="/assets/images/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                                                Enviar por WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botones de acción global */}
                        {planesSeleccionados.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition w-full sm:w-auto"
                                >
                                    <img src="/assets/images/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                                    Enviar {planesSeleccionados.length > 1 ? "planes" : "plan"} por WhatsApp
                                </button>

                                <button
                                    type="button"
                                    onClick={guardarEnCliente}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-3 rounded-lg transition w-full sm:w-auto"
                                >
                                    <IconSave />
                                    Guardar en Cliente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Cotizador;
