import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import Swal from "sweetalert2";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";

import IconX from "../../components/Icon/IconX";

import { useGetClientesQuery } from "../../store/api/clientesApi";
import { useGetQuotationsQuery } from "../../store/api/quotationsApi";

import type { CotizacionGuardada } from "../../types";
import { formatNumber } from "../../utils/formatNumber";

import { compartirCotizacionTextoClientePorWhatsApp } from "../../utils/whatsappUtils";

import { badgeStyle, getCompaniaColor, getCompaniaNombre } from "../../companiasConfig";


const formatDateEs = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-AR");
};

// --------------------------------------------------
// Componente
// --------------------------------------------------

const ClienteCotizaciones = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ✅ soporta /clientes/:clientId/cotizaciones o /clientes/:id/cotizaciones
    const params = useParams();
    const rawClientId = (params as any).clientId ?? (params as any).id;
    const client_id = Number(rawClientId);

    useEffect(() => {
        dispatch(setPageTitle("Cotizaciones del Cliente"));
    }, [dispatch]);

    // Cliente
    const { data: clientes = [], isLoading: loadingClientes } = useGetClientesQuery();
    const cliente = useMemo(
        () => (client_id ? clientes.find((c) => c.id === client_id) || null : null),
        [clientes, client_id]
    );

    // Cotizaciones
    const {
        data: quotations = [],
        isLoading: loadingQuotations,
        isError,
    } = useGetQuotationsQuery(
        { client_id },
        { skip: !client_id || Number.isNaN(client_id) }
    );

    // Tabla: paginado / sort
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "fecha",
        direction: "desc",
    });

    const getVehiculoLabel = (q: CotizacionGuardada) => {
        const marca = q.marca?.name || `Marca #${q.marca_id}`;
        const modelo = q.modelo?.name || `Modelo #${q.modelo_id}`;
        return `${marca} ${modelo}`.trim();
    };

    const getSumaAsegurada = (q: CotizacionGuardada): number => {
        const planes = Object.values(q.aseguradoras || {}).flat();
        const first = planes[0];
        return first ? Number(first.sumaAsegurada ?? 0) : 0;
    };

    const sortedRecords = useMemo(() => {
        let sorted: CotizacionGuardada[];

        if (sortStatus.columnAccessor === "fecha") {
            sorted = [...quotations].sort(
                (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
            );
        } else if (sortStatus.columnAccessor === "suma_asegurada") {
            sorted = [...quotations].sort(
                (a, b) => getSumaAsegurada(a) - getSumaAsegurada(b)
            );
        } else {
            sorted = sortBy(quotations, sortStatus.columnAccessor as any);
        }

        return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
    }, [quotations, sortStatus]);

    const totalPages = useMemo(() => {
        const t = Math.ceil((sortedRecords?.length || 0) / pageSize);
        return Math.max(1, t || 1);
    }, [sortedRecords, pageSize]);

    useEffect(() => {
        // si cambia pageSize o el total, evitamos quedar en página inválida
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        return sortedRecords.slice(from, from + pageSize);
    }, [sortedRecords, page, pageSize]);

    // Modal detalle
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<CotizacionGuardada | null>(null);

    const openDetail = (q: CotizacionGuardada) => {
        setSelected(q);
        setModalOpen(true);
    };

    const closeDetail = () => {
        setModalOpen(false);
        setSelected(null);
    };

    // Estados
    const loading = loadingClientes || loadingQuotations;

    useEffect(() => {
        if (isError) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar las cotizaciones.",
                toast: true,
                position: "top",
                timer: 2500,
                showConfirmButton: false,
            });
        }
    }, [isError]);

    if (!client_id || Number.isNaN(client_id)) {
        return <div className="panel p-5">Cliente inválido.</div>;
    }

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {/* Header */}
            <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                <div className="flex items-center gap-3">
                    <h1 className="font-bold text-2xl">
                        Cotizaciones de{" "}
                        {cliente ? `${cliente.lastname ?? ""} ${cliente.name ?? ""}`.trim() : `Cliente #${client_id}`}
                    </h1>

                    <button type="button" className="btn btn-outline-primary" onClick={() => navigate("/clientes")}>
                        Volver
                    </button>
                </div>
            </div>

            {/* Datos del cliente */}
            <div className="px-5 pb-5">
                <div className="rounded-xl border border-white-light dark:border-[#1b2e4b] bg-white dark:bg-[#0d1727] p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Cliente
                            </div>
                            <div className="text-lg font-bold">
                                {cliente ? `${cliente.lastname ?? ""} ${cliente.name ?? ""}`.trim() : `#${client_id}`}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Celular
                                </div>
                                <div className="font-semibold">{cliente?.phone ? cliente.phone : "-"}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Email
                                </div>
                                <div className="font-semibold">{cliente?.email ? cliente.email : "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTADO MOBILE (CARDS) */}
            <div className="px-5 pb-5 md:hidden">
                {loading ? (
                    <p className="p-2">Cargando cotizaciones...</p>
                ) : paginatedRecords.length === 0 ? (
                    <div className="text-sm text-gray-500">No hay cotizaciones guardadas para este cliente.</div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginatedRecords.map((q) => (
                                <div
                                    key={q.id}
                                    className="rounded-2xl border border-white-light dark:border-[#1b2e4b] bg-white dark:bg-[#0d1727] p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-xs text-gray-500">{formatDateEs(q.fecha)}</div>
                                            <div className="font-bold truncate">{getVehiculoLabel(q)}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Año {q.anio} • {q.es0km ? "0 km" : "Usado"} • CP {q.codigo_postal || "-"}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary whitespace-nowrap"
                                            onClick={() => openDetail(q)}
                                        >
                                            Detalle
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Suma asegurada: </span>
                                            <span className="font-semibold">${formatNumber(getSumaAsegurada(q))}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {Object.keys(q.aseguradoras || {}).map((k) => (
                                            <span
                                                key={k}
                                                style={badgeStyle(k)}
                                                className="px-2 py-1 rounded-full text-white text-[11px]"
                                            >
                                                {getCompaniaNombre(k) ?? k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginación simple mobile */}
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>

                            <div className="text-xs text-gray-500">
                                Página <span className="font-semibold">{page}</span> de{" "}
                                <span className="font-semibold">{totalPages}</span>
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Siguiente
                            </button>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500">Por página</span>
                            <select
                                className="form-select w-auto"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {PAGE_SIZES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </div>

            {/* TABLA DESKTOP */}
            <div className="datatables pagination-padding px-5 pb-5 hidden md:block">
                {loading ? (
                    <p className="p-2">Cargando cotizaciones...</p>
                ) : (
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={paginatedRecords}
                        columns={[
                            {
                                accessor: "fecha",
                                title: "Fecha",
                                sortable: true,
                                render: (q) => formatDateEs(q.fecha),
                            },
                            {
                                accessor: "vehiculo",
                                title: "Vehículo",
                                render: (q) => (
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{getVehiculoLabel(q)}</span>
                                        <span className="text-xs text-gray-500">
                                            Año {q.anio} • {q.es0km ? "0 km" : "Usado"} • CP {q.codigo_postal || "-"}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                accessor: "suma_asegurada",
                                title: "Suma asegurada",
                                sortable: true,
                                render: (q) => `$${formatNumber(getSumaAsegurada(q))}`,
                            },
                            {
                                accessor: "aseguradoras",
                                title: "Aseguradoras",
                                render: (q) => (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(q.aseguradoras || {}).map((k) => (
                                            <span
                                                key={k}
                                                style={badgeStyle(k)}
                                                className="px-2 py-1 rounded-full text-white text-[11px]"
                                            >
                                                {getCompaniaNombre(k) ?? k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                ),
                            },
                            {
                                accessor: "action",
                                title: "Acciones",
                                render: (q) => (
                                    <button type="button" className="btn btn-sm btn-primary" onClick={() => openDetail(q)}>
                                        Ver detalle
                                    </button>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={sortedRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        paginationText={({ from, to, totalRecords }) =>
                            `Mostrando ${from} a ${to} de ${totalRecords} registros`
                        }
                        noRecordsText="No hay cotizaciones guardadas para este cliente."
                    />
                )}
            </div>

            {/* Modal detalle (RESPONSIVE, sin scroll X en mobile) */}
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" open={modalOpen} onClose={closeDetail} className="relative z-[51]">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-3 py-6 md:px-4 md:py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-full md:max-w-5xl">
                                    <button
                                        type="button"
                                        onClick={closeDetail}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 z-10"
                                    >
                                        <IconX />
                                    </button>

                                    <div className="text-lg font-medium bg-[#fbfbfb] ltr:pl-5 rtl:pr-5 py-3">
                                        Detalle de cotización
                                    </div>

                                    <div className="p-4 md:p-5 space-y-5">
                                        {selected &&
                                            Object.entries(selected.aseguradoras || {}).map(([asegId, planes]) => (
                                                <div key={asegId} className="border rounded-lg overflow-hidden">
                                                    <div
                                                        className="px-4 py-3 text-white font-semibold"
                                                        style={{ backgroundColor: getCompaniaColor(asegId) ?? "#111827" }}
                                                    >
                                                        {getCompaniaNombre(asegId) ?? asegId}
                                                    </div>

                                                    {/* MOBILE: cards por plan */}
                                                    <div className="p-4 md:hidden space-y-3">
                                                        {planes.map((p, i) => (
                                                            <div
                                                                key={i}
                                                                className="rounded-xl border border-white-light dark:border-[#1b2e4b] bg-white dark:bg-[#0d1727] p-3"
                                                            >
                                                                <div className="font-semibold">{p.plan}</div>
                                                                <div className="text-xs text-gray-500 mt-0.5">{p.cubre}</div>

                                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                                    <div className="text-gray-500">Cuota</div>
                                                                    <div className="text-right font-semibold">
                                                                        ${formatNumber(p.cuota)}
                                                                    </div>

                                                                    <div className="text-gray-500">Frecuencia</div>
                                                                    <div className="text-right">{p.frecuencia}</div>

                                                                    <div className="text-gray-500">Suma asegurada</div>
                                                                    <div className="text-right">
                                                                        ${formatNumber(p.sumaAsegurada)}
                                                                    </div>

                                                                    <div className="text-gray-500">Comisión</div>
                                                                    <div className="text-right">
                                                                        ${formatNumber(p.comision)}
                                                                    </div>

                                                                    {p.ajuste ? (
                                                                        <>
                                                                            <div className="text-gray-500">Ajuste</div>
                                                                            <div className="text-right">{p.ajuste}</div>
                                                                        </>
                                                                    ) : null}


                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        compartirCotizacionTextoClientePorWhatsApp({
                                                                            telefonoCliente: cliente?.phone,
                                                                            aseguradoraId: asegId,
                                                                            plan: p,
                                                                            cotizacion: null, // acá no tenés raw, dejamos null
                                                                            extraTopLines: [
                                                                                `👤 *Cliente:* ${cliente ? `${cliente.lastname ?? ""} ${cliente.name ?? ""}`.trim() : "-"}`,
                                                                                `🚘 *Vehículo:* ${selected ? getVehiculoLabel(selected) : "-"}`,
                                                                                `📅 *Fecha:* ${selected ? formatDateEs(selected.fecha) : "-"}`,
                                                                            ],
                                                                        })
                                                                    }
                                                                    className="mt-3 w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                                                                >
                                                                    <img src="/assets/images/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                                                                    Enviar por WhatsApp
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* DESKTOP: tabla */}
                                                    <div className="p-4 hidden md:block">
                                                        <div className="overflow-x-auto">
                                                            <table className="table table-hover">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Plan</th>
                                                                        <th>Cubre</th>
                                                                        <th>Cuota</th>
                                                                        <th>Frecuencia</th>
                                                                        <th>Suma asegurada</th>
                                                                        <th>Comisión</th>
                                                                        <th>WhatsApp</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {planes.map((p, i) => (
                                                                        <tr key={i}>
                                                                            <td>{p.plan}</td>
                                                                            <td>{p.cubre}</td>
                                                                            <td>${formatNumber(p.cuota)}</td>
                                                                            <td>{p.frecuencia}</td>
                                                                            <td>${formatNumber(p.sumaAsegurada)}</td>
                                                                            <td>${formatNumber(p.comision)}</td>
                                                                            <td>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        compartirCotizacionTextoClientePorWhatsApp({
                                                                                            telefonoCliente: cliente?.phone,
                                                                                            aseguradoraId: asegId,
                                                                                            plan: p,
                                                                                            cotizacion: null,

                                                                                            // ✅ Nuevo: vehículo estandarizado
                                                                                            vehiculo: {
                                                                                                marca: selected?.marca?.name,
                                                                                                modelo: selected?.modelo?.name,
                                                                                                anio: selected?.anio,
                                                                                            },

                                                                                            // ✅ Dejá acá solo lo que NO sea vehículo
                                                                                            extraTopLines: [
                                                                                                `👤 *Cliente:* ${cliente ? `${cliente.lastname ?? ""} ${cliente.name ?? ""}`.trim() : "-"}`,
                                                                                                `📅 *Fecha:* ${selected ? formatDateEs(selected.fecha) : "-"}`,
                                                                                            ],
                                                                                        })
                                                                                    }
                                                                                    className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
                                                                                >
                                                                                    WhatsApp
                                                                                </button>
                                                                            </td>


                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ClienteCotizaciones;
