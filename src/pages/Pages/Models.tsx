import { useState, useEffect, Fragment } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";

import IconPlus from "../../components/Icon/IconPlus";
import IconEdit from "../../components/Icon/IconEdit";
import IconTrashLines from "../../components/Icon/IconTrashLines";
import IconX from "../../components/Icon/IconX";
import { Model } from "../../types/Model";
import { useModels } from "../../hooks/useModels";

// ----------------------------------------------------------------------

const Models = () => {
    const dispatch = useDispatch();
    const token = localStorage.getItem("token") || "";
    const { models, fetchModels, addModel, editModel, removeModel } = useModels();

    // -------------------------------
    const PAGE_SIZES = [10, 20, 30, 50];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<Model[]>([]);
    const [records, setRecords] = useState<Model[]>([]);
    const [search, setSearch] = useState("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    // -------------------------------
    const [modalOpen, setModalOpen] = useState(false);
    const [params, setParams] = useState<Model>({ id: 0, name: "", brand_id: 0 });

    // -------------------------------
    useEffect(() => {
        dispatch(setPageTitle("Modelos"));
        fetchModels(token);
    }, [dispatch, fetchModels, token]);

    useEffect(() => {
        const filtered = models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        const ordered = sortStatus.direction === "desc" ? sorted.reverse() : sorted;
        setInitialRecords(ordered);
    }, [models, search, sortStatus]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords.slice(from, to));
    }, [page, pageSize, initialRecords]);

    const openModal = (model?: Model) => {
        setParams(model || { id: 0, name: "", brand_id: 0 });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    const showMessage = (msg = "", type: SweetAlertIcon = "success") => {
        Swal.fire({
            icon: type,
            title: msg,
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
            padding: "10px 20px",
        });
    };

    const saveModel = async () => {
        if (!params.name || !params.brand_id) {
            showMessage("Por favor complete todos los campos.", "error");
            return;
        }
        closeModal();
        try {
            if (params.id) {
                await editModel(params.id, params, token);
                showMessage("Modelo actualizado correctamente.");
            } else {
                await addModel(params, token);
                showMessage("Modelo agregado correctamente.");
            }
        } catch {
            showMessage("Error al guardar el modelo.", "error");
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirmed.isConfirmed) {
            try {
                await removeModel(id, token);
                setInitialRecords((prev) => prev.filter((r) => r.id !== id));
                showMessage("Modelo eliminado correctamente.");
            } catch {
                showMessage("Error al eliminar el modelo.", "error");
            }
        }
    };

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="clientes-table">
                {/* Header */}
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-2xl mr-5">Modelos</h1>
                        <button type="button" className="btn btn-primary gap-2" onClick={() => openModal()}>
                            <IconPlus />
                            Agregar
                        </button>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Buscar modelo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={records}
                        columns={[
                            { accessor: "name", title: "Nombre", sortable: true },
                            { accessor: "brand_id", title: "ID Marca", sortable: true },
                            {
                                accessor: "action",
                                title: "Acciones",
                                sortable: false,
                                render: ({ id, ...model }) => (
                                    <div className="flex gap-4 items-center w-max mx-auto">
                                        <button
                                            type="button"
                                            className="flex hover:text-info"
                                            onClick={() => openModal({ id, ...model } as Model)}
                                        >
                                            <IconEdit />
                                        </button>
                                        <button
                                            type="button"
                                            className="flex hover:text-danger"
                                            onClick={() => handleDelete(id)}
                                        >
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
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
                    />
                </div>

                {/* Modal */}
                <Transition appear show={modalOpen} as={Fragment}>
                    <Dialog as="div" open={modalOpen} onClose={closeModal} className="relative z-[51]">
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
                                    <DialogPanel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                        <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] pl-5 py-3">
                                            {params.id ? "Editar Modelo" : "Agregar Modelo"}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-4">
                                                    <label htmlFor="name">Nombre</label>
                                                    <input id="name" type="text" className="form-input" value={params.name} onChange={changeValue} />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="brand_id">ID Marca</label>
                                                    <input id="brand_id" type="number" className="form-input" value={params.brand_id} onChange={changeValue} />
                                                </div>
                                                <div className="flex justify-end items-center mt-6">
                                                    <button type="button" className="btn btn-outline-danger" onClick={closeModal}>
                                                        Cancelar
                                                    </button>
                                                    <button type="button" className="btn btn-primary ml-4" onClick={saveModel}>
                                                        {params.id ? "Actualizar" : "Agregar"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default Models;
