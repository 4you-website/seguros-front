import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Accordion, Modal } from "@mantine/core";
import { IRootState } from "../store";
import { useExpedientes } from "../hooks";
import { setPageTitle } from "../store/themeConfigSlice";
import { sanitizeHtmlString } from "../utils";

const Tramites = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state: IRootState) => state.auth);
    const { id } = useParams();
    const location = useLocation();
    const title = (location.state as { title?: string })?.title ?? "Expediente";

    const { selectedExpediente, loading, error, fetchExpediente } = useExpedientes();
    const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [searchVisible, setSearchVisible] = useState(false);


    // Cargar expediente
    useEffect(() => {
        dispatch(setPageTitle("Pasos Procesales"));
        if (id && token) fetchExpediente(Number(id), token);
    }, [id, token, dispatch, fetchExpediente]);

    // Ordenamos los pasos por fecha (descendente)
    const steps =
        selectedExpediente?.procedural_steps
            ?.slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) ?? [];

    // Filtramos los pasos según la búsqueda
    const filteredSteps = useMemo(() => {
        if (!search.trim()) return steps;

        const term = search.toLowerCase();
        return steps.filter(
            (s) =>
                s.procedure?.toLowerCase().includes(term) ||
                sanitizeHtmlString(s.ruling_text)
                    ?.toLowerCase()
                    .includes(term)
        );
    }, [steps, search]);

    // Inicializar panel activo
    useEffect(() => {
        if (filteredSteps.length > 0 && !activePanel) {
            setActivePanel(filteredSteps[0].id.toString());
        }
    }, [filteredSteps, activePanel]);

    // Scroll automático (como antes)
    useEffect(() => {
        if (activePanel && filteredSteps.length > 0) {
            const index = filteredSteps.findIndex((s) => s.id.toString() === activePanel);
            const prevId = filteredSteps[index - 1]?.id ?? filteredSteps[index]?.id;
            const element = document.getElementById(`step-${prevId}`);

            if (element) {
                const yOffset = -100;
                const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }
    }, [activePanel, filteredSteps]);

    // Navegación botones
    const handleNext = () => {
        if (!activePanel) return;
        const index = filteredSteps.findIndex((s) => s.id.toString() === activePanel);
        if (index < filteredSteps.length - 1)
            setActivePanel(filteredSteps[index + 1].id.toString());
    };

    const handlePrev = () => {
        if (!activePanel) return;
        const index = filteredSteps.findIndex((s) => s.id.toString() === activePanel);
        if (index > 0) setActivePanel(filteredSteps[index - 1].id.toString());
    };

    return (
        <div className="panel p-6 rounded-2xl bg-white shadow-md relative">
            {/* Título */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                <h1 className="text-3xl font-extrabold text-title">{selectedExpediente?.title}</h1>
            </div>

            {/* Contenido */}
            {loading && <p>Cargando pasos procesales...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && filteredSteps.length > 0 && (
                <Accordion
                    variant="separated"
                    radius="md"
                    chevronPosition="right"
                    value={activePanel}
                    onChange={(value) => {
                        if (!value) return;
                        setActivePanel(value);

                        setTimeout(() => {
                            const index = filteredSteps.findIndex(
                                (s) => s.id.toString() === value
                            );
                            const prevId = filteredSteps[index - 1]?.id ?? filteredSteps[index]?.id;
                            const element = document.getElementById(`step-${prevId}`);

                            if (element) {
                                const yOffset = -100;
                                const y =
                                    element.getBoundingClientRect().top +
                                    window.scrollY +
                                    yOffset;

                                window.scrollTo({ top: y, behavior: "smooth" });
                            }
                        }, 250);
                    }}
                >
                    {filteredSteps.map((step) => {
                        const fileRefs = (step.references || []).filter((ref) => {
                            const val = ref.value?.toLowerCase?.() || "";
                            const allowedExtensions = [
                                ".pdf",
                                ".png",
                                ".jpg",
                                ".jpeg",
                                ".mp3",
                                ".mp4",
                            ];
                            const isAllowedExtension = allowedExtensions.some((ext) =>
                                val.endsWith(ext)
                            );
                            const isKnownDocServer = val.includes("docs.scba.gov.ar/documentos");
                            return val.startsWith("http") && (isAllowedExtension || isKnownDocServer);
                        });

                        return (
                            <Accordion.Item
                                id={`step-${step.id}`}
                                key={step.id}
                                value={step.id.toString()}
                                className={`border rounded-lg shadow-sm transition ${activePanel === step.id.toString()
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:shadow-md"
                                    }`}
                            >
                                <Accordion.Control>
                                    <div className="flex justify-between items-start">
                                        <h2
                                            className={`font-semibold text-lg transition ${activePanel === step.id.toString()
                                                ? "text-blue-800"
                                                : "text-gray-800"
                                                }`}
                                        >
                                            {step.procedure ?? "-"}
                                        </h2>
                                        <p className="text-sm text-gray-600 font-bolder">
                                            {step.date ?? "-"}
                                        </p>
                                    </div>
                                </Accordion.Control>

                                <Accordion.Panel>
                                    <div
                                        className="text-lg text-gray-900 leading-relaxed pt-3"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                sanitizeHtmlString(step.ruling_text) ||
                                                "<i>Sin texto disponible</i>",
                                        }}
                                    />

                                    {fileRefs.length > 0 && (
                                        <div className="mt-4">
                                            <p className="font-semibold text-gray-700 mb-2">
                                                Adjuntos:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {fileRefs.map((ref) => (
                                                    <li key={ref.id}>
                                                        <button
                                                            className="text-blue-700 hover:underline"
                                                            onClick={() =>
                                                                setSelectedFile({
                                                                    name: ref.key,
                                                                    url: ref.value,
                                                                })
                                                            }
                                                        >
                                                            {ref.key}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}

            {!loading && !error && filteredSteps.length === 0 && (
                <p>No se encontraron pasos procesales que coincidan con la búsqueda.</p>
            )}

            {/* Modal de adjunto fullscreen */}
            <Modal
                opened={!!selectedFile}
                onClose={() => setSelectedFile(null)}
                withCloseButton
                fullScreen
                transition="fade"
                transitionDuration={200}
                overlayOpacity={0.9}
                overlayBlur={3}
                styles={{
                    close: {
                        width: 48,   // 👈 tamaño más grande (default es 32)
                        height: 48,
                        color: "#000",
                        '& svg': { width: 28, height: 28 }, // agranda el ícono
                    },
                }}
                title={
                    <div className="flex justify-between w-full items-center">
                        <span className="text-lg font-semibold">
                            {selectedFile?.name ?? "Adjunto"}
                        </span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-4 mx-4 py-1 rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                }
            >
                {selectedFile ? (
                    <iframe
                        src={selectedFile.url}
                        title={selectedFile.name}
                        className="w-full h-[calc(100vh-60px)] border-none"
                    />
                ) : (
                    <p>No se pudo cargar el archivo.</p>
                )}
            </Modal>

            {/* Botones flotantes + buscador animado */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">

                {/* Botón Anterior */}
                <button
                    onClick={handlePrev}
                    disabled={
                        filteredSteps.length === 0 ||
                        filteredSteps.findIndex((s) => s.id.toString() === activePanel) === 0
                    }
                    className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-40 transition"
                >
                    Anterior
                </button>

                {/* 🔍 Buscador animado estilo Vristo */}
                <div className="relative flex items-center">
                    <div
                        className={`flex items-center transition-all duration-300 overflow-hidden ${searchVisible
                            ? "bg-white shadow-md border border-gray-300 rounded-md w-80"
                            : "w-12 justify-center rounded-full"
                            }`}
                    >
                        {/* 🔍 Ícono de lupa o apertura */}
                        {!searchVisible ? (
                            <button
                                onClick={() => setSearchVisible(true)}
                                className="bg-blue-600 text-white flex justify-center items-center w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition"
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="11.5"
                                        cy="11.5"
                                        r="9.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        opacity="0.8"
                                    />
                                    <path
                                        d="M18.5 18.5L22 22"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>

                        ) : (
                            <>

                                {/* Input */}
                                <input
                                    id="iconLeft"
                                    type="text"
                                    placeholder="Buscar trámite..."
                                    className="form-input ltr:rounded-l-none rtl:rounded-r-none border-0 focus:ring-0 flex-1 text-gray-700"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />


                                {/* ❌ Cerrar */}
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setSearchVisible(false);
                                    }}
                                    className="flex justify-center items-center px-3 text-gray-500 hover:text-red-500 transition bg-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>

                                </button>
                            </>
                        )}
                    </div>
                </div>


                {/* Botón Siguiente */}
                <button
                    onClick={handleNext}
                    disabled={
                        filteredSteps.length === 0 ||
                        filteredSteps.findIndex((s) => s.id.toString() === activePanel) ===
                        filteredSteps.length - 1
                    }
                    className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-40 transition"
                >
                    Siguiente
                </button>
            </div>


        </div>
    );
};

export default Tramites;
