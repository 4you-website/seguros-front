import { Link } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import IconTrashLines from '../components/Icon/IconTrashLines';
import IconPlus from '../components/Icon/IconPlus';
import { NotificacionModal } from '../components/modals';
import { useNotifications } from "../hooks";
import { Notification } from "../types";
import { IRootState } from '../store';

const Notificaciones = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: IRootState) => state.auth);

    console.log(token)
    // 🔎 Traemos notificaciones reales desde la API
    const { notifications, loading, error } = useNotifications(user?.id ?? null, token);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [records, setRecords] = useState<Notification[]>([]);
    const [initialRecords, setInitialRecords] = useState<Notification[]>([]);
    const [search, setSearch] = useState('');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // título de página
    useEffect(() => {
        dispatch(setPageTitle('Notificaciones'));
    }, [dispatch]);

    // 🔎 inicializar records cuando llegan notificaciones de la API
    useEffect(() => {
        if (notifications) {
            const sorted = sortBy(notifications, 'id');
            setInitialRecords(sorted);
            setRecords(sorted.slice(0, pageSize));
        }
    }, [notifications, pageSize]);

    // paginación
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // búsqueda
    useEffect(() => {
        if (!notifications) return;
        const filtered = notifications.filter((n) =>
            n.case_file.title.toLowerCase().includes(search.toLowerCase()) ||
            n.procedural_step.procedure.toLowerCase().includes(search.toLowerCase()) ||
            n.code.toLowerCase().includes(search.toLowerCase())
        );
        setInitialRecords(filtered);
        setPage(1);
    }, [search, notifications]);

    // ordenamiento
    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus, initialRecords]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-title md:text-4xl">
                            Notificaciones
                        </h1>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="datatables pagination-padding px-5">
                    <DataTable
                        className="whitespace-normal"
                        records={records}
                        sx={{
                            thead: { display: "none" },
                        }}
                        columns={[
                            {
                                
                                accessor: "customRow",
                                title: "", 
                                render: (record: Notification) => (
                                    <div className="panel border rounded-md p-4 mb-3 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 text-base">
                                                {/* Organismo / Tribunal — no lo tenemos en la API, lo dejamos vacío */}
                                                <p>
                                                    <b>Organismo:</b> {record.case_file?.organism ?? "-"}
                                                </p>

                                                {/* Carátula + Número (case_file.title e ID del expediente) */}
                                                <p>
                                                    <b>Carátula:</b> {record.case_file?.title ?? "-"}{" "}
                                                    <b> Número:</b> {record.case_file?.id ?? "-"}
                                                </p>

                                                {/* Destinatario + Domicilio — no presentes en la API */}
                                                <div className="flex gap-4">
                                                    <p>
                                                        <b>Destinatario:</b> -
                                                    </p>
                                                    <p>
                                                        <b>Domicilio:</b> -
                                                    </p>
                                                </div>

                                                {/* Destinatario postal — no presente */}
                                                <p>
                                                    <b>Destinatario Postal:</b> -
                                                </p>

                                                {/* Alta + Notificación — usamos record.date y procedural_step.date */}
                                                <div className="flex gap-4">
                                                    <p>
                                                        <b>Alta o Disponibilidad:</b> {record.date ?? "-"}
                                                    </p>
                                                    <p>
                                                        <b>Notificación:</b>{" "}
                                                        {record.procedural_step?.date ?? "-"}
                                                    </p>
                                                </div>

                                                {/* Trámite — procedural_step.procedure */}
                                                <p>
                                                    <b>Trámite:</b>{" "}
                                                    {record.procedural_step?.procedure ?? "-"}
                                                </p>
                                            </div>

                                            <div className="text-sm font-semibold">
                                                <p>
                                                    <b>Código:</b> {record.code ?? "-"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                className="btn btn-info"
                                                onClick={() => {
                                                    setSelectedNotification(record);
                                                    setModalOpen(true);
                                                }}
                                            >
                                                Leer
                                            </button>
                                            <button className="btn btn-success">Procesar</button>
                                            <button className="btn btn-primary">Preguntar a Procu</button>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover={false}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        paginationText={({ from, to, totalRecords }) =>
                            `Mostrando ${from}-${to} de ${totalRecords} notificaciones`
                        }
                        noRecordsText="No hay registros para mostrar"
                    />

                    <NotificacionModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        notification={selectedNotification}
                    />
                </div>

            </div>
        </div>
    );
};

export default Notificaciones;
