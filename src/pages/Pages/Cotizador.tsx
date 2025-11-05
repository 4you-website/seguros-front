import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import Swal from "sweetalert2";
import IconSend from "../../components/Icon/IconSend";
import Select from "react-select";

import { useGetBrandsQuery } from "../../store/api/brandsApi";
import { useGetModelsQuery } from "../../store/api/modelsApi";
import { useGetStatesQuery } from "../../store/api/statesApi";


// 🔹 Importamos el JSON local
import responseData from "../../utils/response.json";
import { formatNumber } from "../../utils/formatNumber";

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
        valordelvehiculo: "20000000",
    });

    // Estados locales para la respuesta
    const [planes, setPlanes] = useState<any[]>([]);
    const [cotizacion, setCotizacion] = useState<any>(null);

    // RTK Query hooks
    const { data: brands = [], isLoading: loadingBrands } = useGetBrandsQuery();
    const { data: states = [], isLoading: loadingStates } = useGetStatesQuery();
    const { data: models = [], isLoading: loadingModels } = useGetModelsQuery(form.marca || undefined);

    const [filtro, setFiltro] = useState<"todos" | "riesgo" | "terceros" | "civil" | "robo">("todos");
    const [planesSeleccionados, setPlanesSeleccionados] = useState<any[]>([]);



    const planesFiltrados = planes.filter((plan) => {
        const desc = plan.descripcion.toLowerCase();
        if (filtro === "todos") return true;
        if (filtro === "riesgo") return desc.includes("todo riesgo");
        if (filtro === "terceros") return desc.includes("terceros");
        if (filtro === "civil") return desc.includes("civil");
        if (filtro === "robo") return desc.includes("robo") || desc.includes("hurto");
        return true;
    });



    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
    };

    // 🔹 Simular el envío usando el JSON local
    const handleSubmit = async () => {
        console.log("Datos enviados:", form);
        setCotizacion(responseData);
        setPlanes(responseData.planes || []);
        Swal.fire({
            icon: "success",
            title: "Cotización cargada desde JSON local",
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
            padding: "10px 20px",
        });
    };

    const toggleSeleccion = (plan: any) => {
        setPlanesSeleccionados((prev) => {
            const existe = prev.some((p) => p.plan === plan.plan);
            if (existe) {
                // si ya está, lo quitamos
                return prev.filter((p) => p.plan !== plan.plan);
            } else {
                // si no está, lo agregamos
                return [...prev, plan];
            }
        });
    };

    // Función para enviar todas las cotizaciones seleccionadas
    const enviarTodasPorWhatsApp = () => {
        if (planesSeleccionados.length === 0) return;

        const numeroCliente = prompt("📱 Ingrese el número de WhatsApp (solo números, con código de país):", "54911xxxxxxxx");
        if (!numeroCliente) return;

        // Armamos un mensaje general
        let mensaje = "🚗 *Cotización Provincia Seguros*\n------------------------------------\n";

        planesSeleccionados.forEach((plan) => {
            const promo = plan.promocionesPorPlan?.[0];
            mensaje += `💡 *Plan:* ${plan.descripcion.trim()}\n`;
            mensaje += `💰 *Premio:* $${formatNumber(promo?.premio)}\n`;
            mensaje += `🪙 *Comisión:* $${formatNumber(promo?.comision)}\n`;
            mensaje += `📅 *Vigencia:* ${promo?.vigencia}\n`;
            mensaje += `📄 *Prima comisionable:* $${formatNumber(promo?.primaComisionable)}\n`;
            mensaje += "------------------------------------\n";
        });

        mensaje += `📅 *Fecha de cotización:* ${cotizacion?.fechaCotizacion}\n🔢 *Número:* ${cotizacion?.numeroCotizacion}`;

        const url = `https://wa.me/${numeroCliente}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
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


    const enviarPorWhatsApp = (plan: any, promo: any) => {
        const numeroCliente = prompt("📱 Ingrese el número de WhatsApp (solo números, con código de país):", "54911xxxxxxxx");
        if (!numeroCliente) return;
        const mensaje = `
*Cotización Provincia Seguros*
------------------------------------
*Plan:* ${plan.descripcion.trim()}
*Premio:* $${formatNumber(promo?.premio)}
*Comisión:* $${formatNumber(promo?.comision)}
*Vigencia:* ${promo?.vigencia}
*Prima comisionable:* $${formatNumber(promo?.primaComisionable)}
------------------------------------
*Fecha de cotización:* ${cotizacion?.fechaCotizacion}
*Número:* ${cotizacion?.numeroCotizacion}
`;

        // Encodeamos correctamente TODO el texto (incluyendo emojis)
        const url = `https://wa.me/${numeroCliente}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };



    return (
        <>
            <div className="panel max-w-5xl mx-auto p-6 border-white-light dark:border-[#1b2e4b]">
                <h1 className="font-bold text-2xl mb-6">Formulario de Cotización</h1>

                {/* FORMULARIO */}
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Año */}
                    <div>
                        <label htmlFor="anio" className="font-semibold">Año</label>
                        <input id="anio" type="text" className="form-input" value={form.anio} onChange={changeValue} />
                    </div>

                    {/* Código Postal */}
                    <div>
                        <label htmlFor="codpostal" className="font-semibold">Código Postal</label>
                        <input id="codpostal" type="text" className="form-input" value={form.codpostal} onChange={changeValue} />
                    </div>

                    {/* Es 0km */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="es0km" className="font-semibold">¿Es 0 km?</label>
                        <label className="w-12 h-6 relative">
                            <input
                                type="checkbox"
                                id="es0km"
                                checked={form.es0km === "S"}
                                onChange={(e) => setForm({ ...form, es0km: e.target.checked ? "S" : "N" })}
                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                            />
                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                        </label>
                    </div>

                    {/* Marca */}
                    <div>
                        <label htmlFor="marca" className="font-semibold">Marca</label>
                        <Select
                            id="marca"
                            placeholder={loadingBrands ? "Cargando marcas..." : "Seleccione una marca"}
                            options={brands.map((b) => ({ value: b.id.toString(), label: b.name }))}
                            value={
                                form.marca
                                    ? { value: form.marca, label: brands.find((b) => b.id.toString() === form.marca)?.name || "" }
                                    : null
                            }
                            onChange={(selected) => setForm({ ...form, marca: selected?.value || "", modelo: "" })}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Modelo */}
                    <div>
                        <label htmlFor="modelo" className="font-semibold">Modelo</label>
                        <Select
                            id="modelo"
                            placeholder={loadingModels ? "Cargando modelos..." : "Seleccione un modelo"}
                            options={models.map((m) => ({ value: m.id.toString(), label: m.name }))}
                            value={
                                form.modelo
                                    ? { value: form.modelo, label: models.find((m) => m.id.toString() === form.modelo)?.name || "" }
                                    : null
                            }
                            onChange={(selected) => setForm({ ...form, modelo: selected?.value || "" })}
                            isDisabled={loadingModels}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Provincia */}
                    <div>
                        <label htmlFor="provincia" className="font-semibold">Provincia</label>
                        <Select
                            id="provincia"
                            placeholder={loadingStates ? "Cargando provincias..." : "Seleccione una provincia"}
                            options={states.map((s) => ({ value: s.id.toString(), label: s.name }))}
                            value={
                                form.provincia
                                    ? { value: form.provincia, label: states.find((s) => s.id.toString() === form.provincia)?.name || "" }
                                    : null
                            }
                            onChange={(selected) => setForm({ ...form, provincia: selected?.value || "" })}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Valor del vehículo */}
                    <div className="sm:col-span-2">
                        <label htmlFor="valordelvehiculo" className="font-semibold">Valor del Vehículo</label>
                        <input
                            id="valordelvehiculo"
                            type="number"
                            className="form-input"
                            value={form.valordelvehiculo}
                            onChange={changeValue}
                        />
                    </div>

                    <div className="sm:col-span-2 flex justify-end mt-4">
                        <button
                            type="button"
                            className="btn btn-primary flex items-center gap-2"
                            onClick={handleSubmit}
                        >
                            <IconSend />
                            Cargar Cotización Local
                        </button>
                    </div>
                </form>


            </div>
            <div className="panel w-full my-5 px-0 border-white-light dark:border-[#1b2e4b]">

                {/* RESULTADOS DE COTIZACIÓN */}
                {planes.length > 0 && (
                    <div className="w-full my-8">
                        <h2 className="text-xl font-bold mb-4 text-center">Planes Cotizados</h2>
                        {/* Filtros */}
                        <div
                            className="sticky top-[70px] z-20 w-full bg-white dark:bg-[#0d1727] border-b border-gray-200 dark:border-gray-700 py-4 mb-8"
                        >
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
                                        onClick={() => setFiltro(opt.value as any)}
                                        className={`px-4 py-2 rounded-full border font-medium transition ${filtro === opt.value
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-primary/10"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* GRID: una al lado de otra */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-6">
                            {planesFiltrados.map((plan, index) => {
                                const promo = plan.promocionesPorPlan?.[0];
                                // Determinar color por tipo de plan
                                const desc = plan.descripcion.toLowerCase();
                                let color = "from-gray-400 to-gray-500"; // default

                                if (desc.includes("todo riesgo")) {
                                    color = "from-purple-600 to-pink-500"; // todo riesgo
                                } else if (desc.includes("tercero")) {
                                    color = "from-emerald-500 to-teal-400"; // terceros
                                } else if (desc.includes("civil")) {
                                    color = "from-orange-400 to-yellow-500"; // responsabilidad civil
                                } else if (desc.includes("robo") || desc.includes("hurto")) {
                                    color = "from-blue-600 to-cyan-400"; // robo / hurto
                                } else {
                                    color = "from-indigo-500 to-blue-500"; // otros
                                }



                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col justify-between relative bg-white dark:bg-[#0d1727] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition hover:shadow-2xl hover:-translate-y-1 duration-300"
                                    >
                                        {/* Header de color */}
                                        <div className={`bg-gradient-to-r ${color} text-white text-center py-6`}>
                                            <p className="text-sm opacity-80">Plan #{plan.plan}</p>
                                            <h3 className="text-2xl font-bold mt-1 uppercase tracking-wide">
                                                {plan.descripcion.trim()}
                                            </h3>
                                            <p className="text-lg font-semibold mt-2">
                                                ${formatNumber(promo?.premio) || "-"}
                                                <span className="text-sm opacity-80 ml-1">/mes</span>
                                            </p>
                                        </div>

                                        {/* Cuerpo */}
                                        <div className="p-6 text-center flex-1">
                                            {plan.descripcionAdicional && (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 italic">
                                                    {plan.descripcionAdicional.trim()}
                                                </p>
                                            )}

                                            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2 mb-5">
                                                <li>
                                                    ✅ <strong>Premio total:</strong>{" "}
                                                    <span className="font-semibold text-primary">
                                                        ${promo?.premio}
                                                    </span>
                                                </li>
                                                <li>
                                                    💰 <strong>Comisión:</strong>{" "}
                                                    <span className="font-semibold">${promo?.comision}</span>
                                                </li>
                                                <li>
                                                    🕒 <strong>Vigencia:</strong>{" "}
                                                    <span className="font-semibold">{promo?.vigencia}</span>
                                                </li>
                                                <li>
                                                    📄 <strong>Prima comisionable:</strong>{" "}
                                                    <span className="font-semibold">${promo?.primaComisionable}</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 pb-6 flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleSeleccion(plan)}
                                                className={`w-full py-2 rounded-lg font-semibold transition ${planesSeleccionados.some((p) => p.plan === plan.plan)
                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                    : "bg-primary text-white hover:bg-primary/80"
                                                    }`}
                                            >
                                                {planesSeleccionados.some((p) => p.plan === plan.plan)
                                                    ? "Seleccionado"
                                                    : "Seleccionar Plan"}
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() => enviarPorWhatsApp(plan, promo)}
                                                className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                                            >
                                                <i className="fab fa-whatsapp text-lg"></i> Compartir por WhatsApp
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                        {/* Botones de acción global */}
                        {planesSeleccionados.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                                {/* WhatsApp */}
                                <button
                                    type="button"
                                    onClick={() => enviarTodasPorWhatsApp()}
                                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition w-full sm:w-auto"
                                >
                                    <i className="fab fa-whatsapp text-xl"></i>
                                    Enviar {planesSeleccionados.length > 1 ? "planes" : "plan"} por WhatsApp
                                </button>

                                {/* Guardar en cliente */}
                                <button
                                    type="button"
                                    onClick={() => guardarEnCliente()}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-3 rounded-lg transition w-full sm:w-auto"
                                >
                                    💾 Guardar en Cliente
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
