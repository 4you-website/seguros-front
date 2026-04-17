// src/pages/Cotizador/Cotizador.tsx
import { Fragment, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import Swal, { type SweetAlertIcon } from "sweetalert2";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

import IconSend from "../../components/Icon/IconSend";
import IconSave from "../../components/Icon/IconSave";
import IconChecks from "../../components/Icon/IconChecks";
import IconX from "../../components/Icon/IconX";
import IconPlus from "../../components/Icon/IconPlus";

import Select from "react-select";

import { useGetBrandsQuery } from "../../store/api/brandsApi";
import { useGetModelsQuery } from "../../store/api/modelsApi";
import { useGetStatesQuery } from "../../store/api/statesApi";

import { useGetClientesQuery, useAddClienteMutation } from "../../store/api/clientesApi";
// 👉 Asegurate de tener este hook en tu quotationsApi (POST /quotations/result)
import { useAddQuotationResultMutation } from "../../store/api/quotationsApi";

import { compartirPorWhatsApp, compartirPlanesPorWhatsApp } from "../../utils/whatsappUtils";

import { formatComisionParaCotizacion, formatNumber } from "../../utils/formatNumber";

import { getLocalidadesByProvincia } from "../../utils/localidadesUtils";
import { findStateByProvinciaNombre, mapApiProvinceNameToLocalidades } from "../../utils/matchProvinciaJSONvsAPI";

import { useCotizarMutation } from "../../store/api/assuranceApi";
import type { CotizarPayload, Cotizacion, CotizacionPlan } from "../../types/Cotizacion";
import type { Cliente } from "../../types/Cliente";

import { COMPANIAS, getCompaniaColor, getCompaniaNombre, type CompaniaId } from "../../companiasConfig";



const getCompaniaButtonStyle = (id: string, active: boolean): CSSProperties => {
    const color = getCompaniaColor(id);
    return active
        ? { backgroundColor: color, borderColor: color, color: "#fff" }
        : { borderColor: color, color };
};

const getCompaniaTagStyle = (id: string): CSSProperties => ({
    backgroundColor: getCompaniaColor(id),
});

const getTodayLocalISO = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const normalizeText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const matchesSearchTerms = (label: string, inputValue: string) => {
    const normalizedLabel = normalizeText(label);
    const searchTerms = normalizeText(inputValue).split(/\s+/).filter(Boolean);
    if (!searchTerms.length) return true;
    return searchTerms.every((term) => normalizedLabel.includes(term));
};

const BONIFICACIONES_OPCIONES = [
    { codigo: "1", descripcion: "SIN AJUSTE" },
    { codigo: "2", descripcion: "5% ADICIONAL" },
    { codigo: "3", descripcion: "10% ADICIONAL" },
    { codigo: "4", descripcion: "15% ADICIONAL" },
    { codigo: "5", descripcion: "20% ADICIONAL" },
    { codigo: "6", descripcion: "25% ADICIONAL" },
];

const CLAUSULA_AJUSTE_OPCIONES = [
    { codigo: "0", descripcion: "SIN AJUSTE" },
    { codigo: "10", descripcion: "10%" },
    { codigo: "15", descripcion: "15%" },
    { codigo: "20", descripcion: "20%" },
    { codigo: "25", descripcion: "25%" },
    { codigo: "30", descripcion: "30%" },
    { codigo: "35", descripcion: "35%" },
    { codigo: "40", descripcion: "40%" },
    { codigo: "50", descripcion: "50%" },
    { codigo: "60", descripcion: "60%" },
    { codigo: "80", descripcion: "80%" },
    { codigo: "99", descripcion: "100%" },
];

const Cotizador = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle("Cotizador"));
    }, [dispatch]);

    // -----------------------------
    // Helpers UI
    // -----------------------------
    const showToast = (msg = "", type: SweetAlertIcon = "success") => {
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

    // -----------------------------
    // Estado del formulario
    // -----------------------------
    const [form, setForm] = useState({
        anio: "2018",
        codpostal: "1704",
        es0km: "N",
        marca: "",
        modelo: "",
        provincia: "",
        localidad: "",
        valordelvehiculo: "20000000",
        bonificacion: "1",
        accesorios: false,
        valorAccesorios: "",
        clausulaAjuste: "20",
        bonificacionAndina: "",
        comisionAndina: "",
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
    const { data: models = [], isLoading: loadingModels } = useGetModelsQuery(form.marca || undefined);

    const [filtro, setFiltro] = useState<"todos" | "riesgo" | "terceros" | "civil" | "robo">("todos");
    const [filtroCompania, setFiltroCompania] = useState<"todas" | CompaniaId>("todas");
    const [planesSeleccionados, setPlanesSeleccionados] = useState<CotizacionPlan[]>([]);

    // compañías seleccionadas (por defecto todas)
    const [companiasSeleccionadas, setCompaniasSeleccionadas] = useState<string[]>(COMPANIAS.map((c) => c.id));

    // Mutación RTK Query para /assurance/cotizar
    const [cotizarApi, { isLoading: loadingCotizar }] = useCotizarMutation();

    // -----------------------------
    // Clientes + Guardado de cotización
    // -----------------------------
    const { data: clientes = [], isLoading: loadingClientes } = useGetClientesQuery();
    const [addCliente] = useAddClienteMutation();
    const [addQuotationResult, { isLoading: loadingGuardarCotizacion }] = useAddQuotationResultMutation();

    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const [clienteNuevo, setClienteNuevo] = useState<Cliente>({
        id: 0,
        name: "",
        lastname: "",
        email: "",
        phone: "",
        zipcode: "",
        vat: "",
        is_company: false,
        state_id: 0,
    });

    const clientesOptions = useMemo(() => {
        return clientes.map((c) => ({
            value: String(c.id),
            label: `${c.lastname} ${c.name} (${c.email})`,
        }));
    }, [clientes]);


    const selectedCliente = useMemo(
        () => (selectedClientId ? clientes.find((c) => c.id === selectedClientId) : null),
        [selectedClientId, clientes]
    );


    const stylesSelectPortal = useMemo(
        () => ({
            menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        }),
        []
    );

    const modelosOptions = useMemo(
        () => models.map((m) => ({ value: m.id.toString(), label: m.name })),
        [models]
    );

    // -----------------------------
    // Normalizadores (API cotizar -> UI)
    // -----------------------------
    const normalizeCotizacionToPlanes = (data: any): { cotizacionNorm: Cotizacion; planesNorm: CotizacionPlan[] } => {
        // Caso viejo: { planes: [...] }
        if (data?.planes && Array.isArray(data.planes)) {
            return { cotizacionNorm: data as Cotizacion, planesNorm: data.planes as CotizacionPlan[] };
        }

        // Caso nuevo: { atm:{result:[]}, provincia:{result:[...]}, ... }
        const planesNorm: CotizacionPlan[] = [];
        if (data && typeof data === "object") {
            Object.entries(data).forEach(([aseguradora, block]: [string, any]) => {
                const arr = block?.result;
                if (!Array.isArray(arr)) return;

                const bonificacionBloque =
                    block?.bonificacion != null && !Number.isNaN(Number(block.bonificacion))
                        ? Number(block.bonificacion)
                        : undefined;

                arr.forEach((p: any) => {
                    planesNorm.push({
                        aseguradora,
                        plan: p.plan,
                        cubre: p.cubre,
                        cuota: Number(p.cuota),
                        frecuencia: p.frecuencia,
                        comision: Number(p.comision),
                        ajuste: p.ajuste,
                        sumaAsegurada: Number(p.suma_asegurada ?? p.sumaAsegurada ?? 0),
                        idCotizacion: String(p.id_cotizacion ?? p.idCotizacion ?? ""),
                        promocionesporplan: p.promocionesporplan ?? p.promociones_por_plan ?? null,
                        ...(bonificacionBloque != null ? { bonificacion: bonificacionBloque } : {}),
                    } as any);
                });
            });
        }

        const cotizacionNorm = { ...data, planes: planesNorm } as Cotizacion;
        return { cotizacionNorm, planesNorm };
    };

    // -----------------------------
    // CP -> Provincia/Localidad
    // -----------------------------
    const buscarPorCodigoPostal = async (codigoOverride?: string) => {
        const codigo = (codigoOverride ?? form.codpostal).trim();
        if (!codigo) {
            showToast("Ingrese un código postal válido", "warning");
            return;
        }

        setLoadingCP(true);

        if (!states.length) {
            showToast("Cargando provincias... Volvé a intentar en un momento.", "info");
            setLoadingCP(false);
            return;
        }

        try {
            const res = await fetch(`https://api.zippopotam.us/ar/${codigo}`);
            if (!res.ok) throw new Error("Código postal no encontrado");
            const data = await res.json();

            const place = data.places?.[0];
            if (!place) throw new Error("Sin resultados");

            const localidadApi = place["place name"] || "";
            const provinciaApiNombre = place["state"] || "";

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

    // -----------------------------
    // Filtros planes
    // -----------------------------
    const planesFiltrados = planes.filter((plan) => {
        if (filtroCompania !== "todas" && (plan as any).aseguradora !== filtroCompania) return false;

        const desc = ((plan as any).cubre || "").toLowerCase();
        if (filtro === "riesgo") return desc.includes("todo riesgo");
        if (filtro === "terceros") return desc.includes("terceros");
        if (filtro === "civil") return desc.includes("civil");
        if (filtro === "robo") return desc.includes("robo") || desc.includes("hurto");
        return true;
    });

    // -----------------------------
    // Handlers form
    // -----------------------------
    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
        if (id === "codpostal" && value.trim().length >= 4) {
            buscarPorCodigoPostal(value);
        }
    };

    const toggleSeleccion = (plan: CotizacionPlan) => {
        setPlanesSeleccionados((prev) => (prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]));
    };

    const toggleCompania = (id: string) => {
        setCompaniasSeleccionadas((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    };

    // -----------------------------
    // Cotizar
    // -----------------------------
    const cotizar = async () => {
        Swal.fire({
            title: "Cotizando...",
            html: "Estamos consultando las aseguradoras, por favor esperá.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
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
                bonificacion: form.bonificacion,
                accesorios: form.accesorios ? Number(form.valorAccesorios) || 0 : 0,
                clausulaAjuste: form.clausulaAjuste,
                bonificacionAndina: Number(form.bonificacionAndina) || 0,
                comisionAndina: Number(form.comisionAndina) || 0,
            };

            const data = await cotizarApi(payload).unwrap();

            const { cotizacionNorm, planesNorm } = normalizeCotizacionToPlanes(data);

            setCotizacion(cotizacionNorm);
            setPlanes(planesNorm);
            setPlanesSeleccionados([]);

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
                text: error?.data?.message || "No se pudo obtener la cotización. Revisá la consola.",
                confirmButtonText: "Entendido",
            });
        }
    };

    // -----------------------------
    // Guardar en cliente (modal + crear cliente + POST /quotations/result)
    // -----------------------------
    const openGuardarModal = () => {
        if (!planesSeleccionados.length) return;

        // Pre-carga útil (CP + provincia)
        setClienteNuevo((prev) => ({
            ...prev,
            id: 0,
            zipcode: form.codpostal?.trim() || "",
            state_id: Number(form.provincia || 0),
        }));

        setSelectedClientId(null);
        setModoNuevoCliente(false);
        setModalGuardarOpen(true);
    };

    const closeGuardarModal = () => setModalGuardarOpen(false);

    const changeNuevoClienteValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setClienteNuevo((prev) => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const crearClienteDesdeModal = async () => {
        if (!clienteNuevo.name || !clienteNuevo.lastname || !clienteNuevo.email || !clienteNuevo.phone) {
            showToast("Completá Nombre, Apellido, Email y Teléfono.", "error");
            return;
        }

        try {
            Swal.fire({
                title: "Creando cliente...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const created = await addCliente(clienteNuevo).unwrap();

            Swal.close();
            showToast("Cliente creado correctamente.", "success");

            setSelectedClientId(created.id);
            setModoNuevoCliente(false);
        } catch (err: any) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error creando cliente",
                text: err?.data?.message || "No se pudo crear el cliente.",
                confirmButtonText: "Entendido",
            });
        }
    };

    const mapPlanToApi = (p: CotizacionPlan) => {
        const anyP = p as any;
        return {
            ajuste: anyP.ajuste ?? "sin ajuste",
            comision: Number(anyP.comision ?? 0),
            cubre: String(anyP.cubre ?? ""),
            cuota: Number(anyP.cuota ?? 0),
            frecuencia: String(anyP.frecuencia ?? ""),
            id_cotizacion: String(anyP.idCotizacion ?? anyP.id_cotizacion ?? ""),
            plan: String(anyP.plan ?? ""),
            suma_asegurada: Number(anyP.sumaAsegurada ?? anyP.suma_asegurada ?? 0),
        };
    };

    const buildAseguradorasPayload = () => {
        const grouped = planesSeleccionados.reduce((acc, p) => {
            const aseguradora = String((p as any).aseguradora || "");
            if (!aseguradora) return acc;
            if (!acc[aseguradora]) acc[aseguradora] = [];
            acc[aseguradora].push(mapPlanToApi(p));
            return acc;
        }, {} as Record<string, ReturnType<typeof mapPlanToApi>[]>);

        return Object.entries(grouped).map(([key, plans]) => ({ [key]: plans }));
    };

    const guardarCotizacionSeleccionada = async () => {
        if (!planesSeleccionados.length) return;

        if (!selectedClientId) {
            showToast("Seleccioná un cliente o creá uno nuevo.", "warning");
            return;
        }

        if (!form.marca || !form.modelo || !form.anio) {
            showToast("Revisá Marca / Modelo / Año antes de guardar.", "warning");
            return;
        }

        const payload = {
            anio: Number(form.anio),
            aseguradora: buildAseguradorasPayload(),
            brand_id: Number(form.marca),
            client_id: Number(selectedClientId),
            codigo_postal: form.codpostal?.trim() || "",
            es0km: form.es0km === "S",
            fecha: getTodayLocalISO(),
            model_id: Number(form.modelo),
            valor_vehiculo: Number(form.valordelvehiculo),
        };

        try {
            Swal.fire({
                title: "Guardando cotización...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            await addQuotationResult(payload as any).unwrap();

            Swal.close();
            Swal.fire({
                icon: "success",
                title: "Cotización guardada",
                text: "Se guardó dentro del cliente correctamente.",
                showConfirmButton: false,
                timer: 1800,
            });

            closeGuardarModal();
            setPlanesSeleccionados([]);
        } catch (err: any) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error al guardar",
                text: err?.data?.message || "No se pudo guardar la cotización.",
                confirmButtonText: "Entendido",
            });
        }
    };

    const guardarEnCliente = () => {
        openGuardarModal();
    };

    // -----------------------------
    // Render
    // -----------------------------
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
                                onClick={() => buscarPorCodigoPostal()}
                                className="bg-[#eee] dark:bg-[#1b2e4b] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 border border-white-light dark:border-[#17263c] hover:bg-primary hover:text-white transition"
                                title="Buscar por código postal"
                                disabled={loadingCP}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="hidden sm:block" />

                    {/* Provincia (API / con IDs) */}
                    <div>
                        <label htmlFor="provincia" className="font-semibold">
                            Provincia
                        </label>
                        <Select
                            id="provincia"
                            placeholder={loadingStates ? "Cargando provincias..." : "Seleccione una provincia"}
                            options={states.map((s) => ({ value: s.id.toString(), label: s.name }))}
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

                                setForm((prev) => ({ ...prev, provincia: provinciaId }));

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
                            onChange={(selected) => setForm((prev) => ({ ...prev, localidad: selected?.value || "" }))}
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
                            options={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
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
                            options={modelosOptions}
                            value={
                                form.modelo
                                    ? {
                                        value: form.modelo,
                                        label: modelosOptions.find((m) => m.value === form.modelo)?.label || "",
                                    }
                                    : null
                            }
                            onChange={(selected) =>
                                setForm({
                                    ...form,
                                    modelo: selected?.value || "",
                                })
                            }
                            filterOption={(option, inputValue) => matchesSearchTerms(option.label, inputValue)}
                            isSearchable
                            noOptionsMessage={({ inputValue }) =>
                                inputValue ? "No se encontraron modelos" : "No hay modelos disponibles"
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
                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300" />
                        </label>
                    </div>

                    {/* Valor del vehículo */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="valordelvehiculo" className="font-semibold whitespace-nowrap">
                            Valor del Vehículo
                        </label>
                        <input id="valordelvehiculo" type="number" className="form-input" value={form.valordelvehiculo} onChange={changeValue} />
                    </div>

                    {/* Año */}
                    <div>
                        <label htmlFor="anio" className="font-semibold">
                            Año
                        </label>
                        <input id="anio" type="text" className="form-input" value={form.anio} onChange={changeValue} />
                    </div>

                    {/* Provincia Seguros: Bonificación y Accesorios (solo si está elegido en Cotizar en) */}
                    {companiasSeleccionadas.includes("provincia") && (
                        <div className="sm:col-span-2 space-y-4 p-4 rounded-lg border border-white-light dark:border-[#1b2e4b] bg-[#f9fafb] dark:bg-[#0d1727]/50">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Provincia Seguros</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* Bonificación adicional */}
                                <div>
                                    <label htmlFor="bonificacion" className="font-semibold">
                                        Bonificación adicional
                                    </label>
                                    <Select
                                        id="bonificacion"
                                        placeholder="Seleccione bonificación"
                                        options={BONIFICACIONES_OPCIONES.map((b) => ({ value: b.codigo, label: b.descripcion }))}
                                        value={
                                            form.bonificacion
                                                ? {
                                                    value: form.bonificacion,
                                                    label: BONIFICACIONES_OPCIONES.find((b) => b.codigo === form.bonificacion)?.descripcion || "",
                                                }
                                                : null
                                        }
                                        onChange={(selected) => setForm((prev) => ({ ...prev, bonificacion: selected?.value || "1" }))}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Cláusula de Ajuste */}
                                <div>
                                    <label htmlFor="clausulaAjuste" className="font-semibold">
                                        Cláusula de Ajuste
                                    </label>
                                    <Select
                                        id="clausulaAjuste"
                                        placeholder="Seleccione cláusula"
                                        options={CLAUSULA_AJUSTE_OPCIONES.map((c) => ({ value: c.codigo, label: c.descripcion }))}
                                        value={
                                            form.clausulaAjuste != null
                                                ? {
                                                    value: form.clausulaAjuste,
                                                    label: CLAUSULA_AJUSTE_OPCIONES.find((c) => c.codigo === form.clausulaAjuste)?.descripcion || "",
                                                }
                                                : null
                                        }
                                        onChange={(selected) => setForm((prev) => ({ ...prev, clausulaAjuste: selected?.value ?? "20" }))}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Accesorios */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.accesorios}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    accesorios: e.target.checked,
                                                    ...(e.target.checked ? {} : { valorAccesorios: "" }),
                                                }))
                                            }
                                            className="form-checkbox rounded"
                                        />
                                        <span className="font-semibold">¿Accesorios?</span>
                                    </label>
                                    {form.accesorios && (
                                        <input
                                            id="valorAccesorios"
                                            type="number"
                                            min={0}
                                            step={1}
                                            placeholder="Valor"
                                            className="form-input w-32"
                                            value={form.valorAccesorios}
                                            onChange={changeValue}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mercantil Andina: comisión y bonificación (solo si está elegido en Cotizar en) */}
                    {companiasSeleccionadas.includes("andina") && (
                        <div className="sm:col-span-2 space-y-4 p-4 rounded-lg border border-white-light dark:border-[#1b2e4b] bg-[#f9fafb] dark:bg-[#0d1727]/50">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Mercantil Andina</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="comisionAndina" className="font-semibold">
                                        Comisión
                                    </label>
                                    <input
                                        id="comisionAndina"
                                        type="number"
                                        className="form-input"
                                        placeholder="0"
                                        min={0}
                                        step="any"
                                        value={form.comisionAndina}
                                        onChange={changeValue}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bonificacionAndina" className="font-semibold">
                                        Bonificación
                                    </label>
                                    <input
                                        id="bonificacionAndina"
                                        type="number"
                                        className="form-input"
                                        placeholder="0"
                                        min={0}
                                        step="any"
                                        value={form.bonificacionAndina}
                                        onChange={changeValue}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition hover:opacity-90 ${isActive ? "shadow-sm" : "bg-white dark:bg-[#1b2e4b] hover:bg-primary/10"
                                            }`}
                                    >
                                        {c.nombre}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botón Cotizar */}
                    <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                        <button type="button" className="btn btn-primary flex items-center gap-2 disabled:opacity-60" onClick={cotizar} disabled={loadingCotizar}>
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
                                <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Filtrar por compañía</span>
                                <div className="flex flex-wrap justify-center gap-2">
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
                                                {c.nombre}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* GRID de planes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-6">
                            {planesFiltrados.map((plan, index) => {
                                const anyPlan = plan as any;

                                const desc = (anyPlan.cubre || "").toLowerCase();
                                let color = "from-gray-400 to-gray-500";

                                if (desc.includes("todo riesgo")) color = "from-purple-600 to-pink-500";
                                else if (desc.includes("terceros")) color = "from-emerald-500 to-teal-400";
                                else if (desc.includes("civil")) color = "from-orange-400 to-yellow-500";
                                else if (desc.includes("robo") || desc.includes("hurto")) color = "from-blue-600 to-cyan-400";
                                else color = "from-indigo-500 to-blue-500";

                                return (
                                    <div
                                        id={`card-${anyPlan.aseguradora}-${anyPlan.plan}-${anyPlan.idCotizacion}-${index}`}
                                        key={`${anyPlan.aseguradora}-${anyPlan.plan}-${anyPlan.idCotizacion}-${index}`}
                                        className="flex flex-col justify-between relative bg-white dark:bg-[#0d1727] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition hover:shadow-2xl hover:-translate-y-1 duration-300"
                                    >
                                        {/* Header */}
                                        <div className={`bg-gradient-to-r ${color} text-white text-center py-6`}>
                                            <div className="flex justify-between items-center px-4 text-xs opacity-80">
                                                <span>#{anyPlan.idCotizacion}</span>

                                                <span style={getCompaniaTagStyle(anyPlan.aseguradora)} className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide text-white">
                                                    {getCompaniaNombre(anyPlan.aseguradora)}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold mt-2 uppercase tracking-wide px-4">{anyPlan.plan}</h3>
                                            <p className="text-xs mt-1 opacity-90 px-4">{anyPlan.cubre}</p>
                                            <p className="text-xl font-semibold mt-3">
                                                ${formatNumber(anyPlan.cuota)}
                                                <span className="text-sm opacity-80 ml-1">/{anyPlan.frecuencia}</span>
                                            </p>
                                        </div>

                                        {/* Cuerpo */}
                                        <div className="p-6 text-center flex-1">
                                            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2 mb-5">
                                                <li>
                                                    🏢 <strong>Compañía:</strong>{" "}
                                                    <span className="font-semibold">{getCompaniaNombre(anyPlan.aseguradora)}</span>
                                                </li>
                                                {anyPlan.promocionesporplan && (
                                                    <li>
                                                        🏷️ <strong>Promoción:</strong>{" "}
                                                        <span className="font-semibold">{anyPlan.promocionesporplan}</span>
                                                    </li>
                                                )}
                                                {String(anyPlan.aseguradora).toLowerCase() === "andina" &&
                                                    plan.bonificacion != null &&
                                                    !Number.isNaN(Number(plan.bonificacion)) && (
                                                    <li>
                                                        🎁 <strong>Bonificación:</strong>{" "}
                                                        <span className="font-semibold">
                                                            {formatNumber(plan.bonificacion)}%
                                                        </span>
                                                    </li>
                                                )}
                                                <li>
                                                    ✅ <strong>Cuota:</strong>{" "}
                                                    <span className="font-semibold text-primary">${formatNumber(anyPlan.cuota)}</span>
                                                </li>
                                                <li>
                                                    🛡️ <strong>Suma asegurada:</strong>{" "}
                                                    <span className="font-semibold">${formatNumber(anyPlan.sumaAsegurada)}</span>
                                                </li>
                                                {anyPlan.ajuste && (
                                                    <li>
                                                        ⚙️ <strong>Ajuste:</strong>{" "}
                                                        <span className="font-semibold">
                                                            {/^\d+$/.test(String(anyPlan.ajuste).trim())
                                                                ? `${anyPlan.ajuste}%`
                                                                : anyPlan.ajuste}
                                                        </span>
                                                    </li>
                                                )}
                                                <li data-hide-on-share="true">
                                                    💰 <strong>Comisión:</strong>{" "}
                                                    <span className="font-semibold">
                                                        {formatComisionParaCotizacion(anyPlan.aseguradora, anyPlan.comision)}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 pb-6 flex flex-col gap-3" data-hide-on-share="true">
                                            <button
                                                type="button"
                                                onClick={() => toggleSeleccion(plan)}
                                                className={`w-full py-2 rounded-lg font-semibold transition ${planesSeleccionados.includes(plan) ? "bg-[#153272] text-white" : "bg-primary text-white hover:bg-primary/80"
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
                                                        `card-${anyPlan.aseguradora}-${anyPlan.plan}-${anyPlan.idCotizacion}-${index}`,
                                                        plan,
                                                        null,
                                                        cotizacion,
                                                        {
                                                            vehiculo: {
                                                                marca: brands.find((b) => String(b.id) === String(form.marca))?.name,
                                                                modelo: models.find((m) => String(m.id) === String(form.modelo))?.name,
                                                                anio: form.anio,
                                                            },
                                                        }
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
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 px-6">
                                <button
                                    type="button"
                                    onClick={() =>
                                        compartirPlanesPorWhatsApp({
                                            planes: planesSeleccionados,
                                            cotizacion,
                                            telefonoPrefill: "",
                                            vehiculo: {
                                                marca: brands.find((b) => String(b.id) === String(form.marca))?.name,
                                                modelo: models.find((m) => String(m.id) === String(form.modelo))?.name,
                                                anio: form.anio,
                                            },
                                            extraTopLines: [
                                                `📍 *CP:* ${form.codpostal || "-"}`,
                                                `💲 *Valor vehículo:* $${formatNumber(form.valordelvehiculo || 0)}`,
                                            ],
                                        })
                                    }

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

            {/* ---------------- MODAL Guardar en Cliente ---------------- */}
            <Transition appear show={modalGuardarOpen} as={Fragment}>
                <Dialog as="div" open={modalGuardarOpen} onClose={closeGuardarModal} className="relative z-[51]">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-xl text-black dark:text-white-dark relative">
                                    <button
                                        type="button"
                                        onClick={closeGuardarModal}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>

                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3">
                                        Guardar cotización en cliente
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="bg-[#f7f7f7] dark:bg-[#0d1727] rounded-lg p-3 text-sm">
                                            <div>
                                                <strong>Planes seleccionados:</strong> {planesSeleccionados.length}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Se guardarán agrupados por aseguradora.
                                            </div>
                                        </div>

                                        {/* Selector de cliente */}
                                        <div>
                                            <label className="font-semibold mb-2 block">Cliente</label>
                                            <Select
                                                placeholder={loadingClientes ? "Cargando clientes..." : "Seleccioná un cliente"}
                                                options={clientesOptions}
                                                value={
                                                    selectedCliente
                                                        ? {
                                                            value: String(selectedCliente.id),
                                                            label: `${selectedCliente.lastname} ${selectedCliente.name} (${selectedCliente.email})`,
                                                        }
                                                        : null
                                                }

                                                onChange={(opt) => {
                                                    const v = opt?.value;
                                                    if (!v) return;

                                                    if (v === "__new__") {
                                                        setModoNuevoCliente(true);
                                                        setSelectedClientId(null);
                                                        return;
                                                    }

                                                    setModoNuevoCliente(false);
                                                    setSelectedClientId(Number(v));
                                                }}
                                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                                styles={stylesSelectPortal as any}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                isLoading={loadingClientes}
                                            />

                                            {!modoNuevoCliente && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setModoNuevoCliente(true);
                                                        setSelectedClientId(null);
                                                    }}
                                                    className="mt-2 text-sm text-primary hover:underline inline-flex items-center gap-2"
                                                >
                                                    <IconPlus />
                                                    Crear nuevo cliente
                                                </button>
                                            )}
                                        </div>

                                        {/* Form nuevo cliente */}
                                        {modoNuevoCliente && (
                                            <div className="border border-white-light dark:border-[#1b2e4b] rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold">Nuevo cliente</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModoNuevoCliente(false)}
                                                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                    >
                                                        Cancelar creación
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label htmlFor="name" className="text-sm">
                                                            Nombre
                                                        </label>
                                                        <input id="name" className="form-input" value={clienteNuevo.name} onChange={changeNuevoClienteValue} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="lastname" className="text-sm">
                                                            Apellido
                                                        </label>
                                                        <input id="lastname" className="form-input" value={clienteNuevo.lastname} onChange={changeNuevoClienteValue} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="email" className="text-sm">
                                                            Email
                                                        </label>
                                                        <input id="email" type="email" className="form-input" value={clienteNuevo.email} onChange={changeNuevoClienteValue} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="phone" className="text-sm">
                                                            Teléfono
                                                        </label>
                                                        <input id="phone" className="form-input" value={clienteNuevo.phone} onChange={changeNuevoClienteValue} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="zipcode" className="text-sm">
                                                            Código Postal
                                                        </label>
                                                        <input id="zipcode" className="form-input" value={clienteNuevo.zipcode} onChange={changeNuevoClienteValue} />
                                                    </div>

                                                    <div className="flex items-center gap-3 sm:col-span-2">
                                                        <input
                                                            id="is_company"
                                                            type="checkbox"
                                                            checked={!!clienteNuevo.is_company}
                                                            onChange={changeNuevoClienteValue}
                                                        />
                                                        <label htmlFor="is_company" className="text-sm">
                                                            Es empresa
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button type="button" className="btn btn-primary" onClick={crearClienteDesdeModal}>
                                                        Crear cliente
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex justify-end items-center gap-3 pt-2">
                                            <button type="button" className="btn btn-outline-danger" onClick={closeGuardarModal}>
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={guardarCotizacionSeleccionada}
                                                disabled={loadingGuardarCotizacion}
                                            >
                                                {loadingGuardarCotizacion ? "Guardando..." : "Guardar cotización"}
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Cotizador;
