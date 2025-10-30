import { Link } from "react-router-dom";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useState, useEffect } from "react";
import sortBy from "lodash/sortBy";
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../store/themeConfigSlice";
import IconPlus from "../components/Icon/IconPlus";
import { useExpedientes } from "../hooks";
import { Expediente } from "../types";
import { IRootState } from "../store";

const Expedientes = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state: IRootState) => state.auth);

    const { expedientes, loading, error, fetchExpedientes } = useExpedientes();

    // Estados de tabla
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "id",
        direction: "asc",
    });

    const [records, setRecords] = useState<Expediente[]>([]);
    const [initialRecords, setInitialRecords] = useState<Expediente[]>([]);
    const [search, setSearch] = useState("");

    // -----------------------
    // Título de página
    // -----------------------
    useEffect(() => {
        dispatch(setPageTitle("Expedientes"));
    }, [dispatch]);

    // -----------------------
    // Cargar expedientes manualmente
    // -----------------------
    useEffect(() => {
        if (token) fetchExpedientes(token);
    }, [token, fetchExpedientes]);

    // -----------------------
    // Inicializar registros
    // -----------------------
    useEffect(() => {
        if (expedientes) {
            const sorted = sortBy(expedientes, "id");
            setInitialRecords(sorted);
            setRecords(sorted.slice(0, pageSize));
        }
    }, [expedientes, pageSize]);

    // -----------------------
    // Paginación
    // -----------------------
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // -----------------------
    // Búsqueda
    // -----------------------
    useEffect(() => {
        if (!expedientes) return;
        const filtered = expedientes.filter(
            (e) =>
                e.title.toLowerCase().includes(search.toLowerCase()) ||
                e.file_number.toLowerCase().includes(search.toLowerCase()) ||
                e.organism.name.toLowerCase().includes(search.toLowerCase())
        );
        setInitialRecords(filtered);
        setPage(1);
    }, [search, expedientes]);

    // -----------------------
    // Ordenamiento
    // -----------------------
    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === "desc" ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus, initialRecords]);

    // -----------------------
    // Render
    // -----------------------
    if (loading) return <p>Cargando expedientes...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-title md:text-4xl">
                            Expedientes
                        </h1>
                    </div>

                    <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn btn-primary flex items-center gap-2">
                            <IconPlus /> Nuevo expediente
                        </button>
                    </div>
                </div>

                <div className="datatables pagination-padding px-5">
                    <DataTable
                        sx={{
                            thead: { display: "none" },
                        }}
                        className="whitespace-normal"
                        records={records}
                        columns={[
                            {
                                accessor: "customRow",
                                title: undefined,
                                render: (record: Expediente) => (
                                    <div className="panel border rounded-md p-4 mb-3 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 text-base">

                                                <p className="font-bold text-blue-950 py-2">
                                                    <Link
                                                        to={`/expedientes/${record.id}/tramites`}
                                                        state={{ title: record.title }}
                                                        className="text-blue-700 hover:text-blue-900 hover:underline transition"
                                                    >
                                                        {record.title ?? "-"}
                                                    </Link>
                                                </p>
                                                <p>
                                                    <b>Organismo:</b>{" "}
                                                    {record.organism?.name ?? "-"}
                                                </p>
                                                <p>
                                                    <b>Jurisdicción:</b>{" "}
                                                    {record.jurisdiction ?? "-"}
                                                </p>
                                                <p>
                                                    <b>Departamento Judicial:</b>{" "}
                                                    {record.judicial_department?.name ?? "-"}
                                                </p>
                                                <p>
                                                    <b>Provincia:</b>{" "}
                                                    {record.province?.name ?? "-"}
                                                </p>
                                                <p>
                                                    <b>Estado:</b> {record.status ?? "-"}
                                                </p>
                                                <p>
                                                    <b>Fecha de inicio:</b>{" "}
                                                    {record.start_date ?? "-"}
                                                </p>
                                            </div>

                                            <div className="text-sm font-semibold text-right">
                                                <p>
                                                    <b>Número Expte.:</b> {record.file_number ?? "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <button className="btn btn-info">
                                                Ver más
                                            </button>
                                            <button className="btn btn-success">
                                                Actualizar
                                            </button>
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
                            `Mostrando ${from}-${to} de ${totalRecords} expedientes`
                        }
                        noRecordsText="No hay expedientes para mostrar"
                    />
                </div>
            </div>
        </div>
    );
};

export default Expedientes;
