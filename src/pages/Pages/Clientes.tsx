import { useState, useMemo, Fragment, useEffect } from "react";
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
import { Cliente } from "../../types/Cliente";

import {
    useGetClientesQuery,
    useAddClienteMutation,
    useUpdateClienteMutation,
    useDeleteClienteMutation,
} from "../../store/api/clientesApi";

import { useGetStatesQuery } from "../../store/api/statesApi";

// ----------------------------------------------------------------------

const Clientes = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle("Clientes"));
    }, [dispatch]);

    const { data: states = [] } = useGetStatesQuery();
    const { data: clientes = [], isLoading } = useGetClientesQuery();
    const [addCliente] = useAddClienteMutation();
    const [editCliente] = useUpdateClienteMutation();
    const [removeCliente] = useDeleteClienteMutation();

    // -------------------------------
    // Estados de tabla
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    // -------------------------------
    // Estados del modal
    const [modalOpen, setModalOpen] = useState(false);
    const [params, setParams] = useState<Cliente>({
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

    // -------------------------------
    // Filtrado + ordenamiento + paginación con useMemo (sin loops)
    const filteredSortedRecords = useMemo(() => {
        if (!clientes) return [];
        const filtered = clientes.filter((c) =>
            `${c.name} ${c.lastname}`.toLowerCase().includes(search.toLowerCase())
        );
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
    }, [clientes, search, sortStatus]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        return filteredSortedRecords.slice(from, from + pageSize);
    }, [filteredSortedRecords, page, pageSize]);

    // -------------------------------
    // Modal handlers
    const openModal = (cliente?: Cliente) => {
        setParams(
            cliente || {
                id: 0,
                name: "",
                lastname: "",
                email: "",
                phone: "",
                zipcode: "",
                vat: "",
                is_company: false,
                state_id: 0,
            }
        );
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    // -------------------------------
    // SweetAlert helper
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

    // -------------------------------
    // Guardar cliente
    const saveCliente = async () => {
        if (!params.name || !params.lastname || !params.email || !params.phone) {
            showMessage("Por favor, complete todos los campos obligatorios.", "error");
            return;
        }

        closeModal();

        try {
            if (params.id) {
                await editCliente(params).unwrap();
                showMessage("Cliente actualizado correctamente.");
            } else {
                await addCliente(params).unwrap();
                showMessage("Cliente agregado correctamente.");
            }
        } catch {
            showMessage("Error al guardar el cliente.", "error");
        }
    };

    // -------------------------------
    // Eliminar cliente
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
                await removeCliente(id).unwrap();
                showMessage("Cliente eliminado correctamente.");
            } catch {
                showMessage("Error al eliminar cliente.", "error");
            }
        }
    };

    // -------------------------------
    // Render
    if (isLoading) return <p className="p-5">Cargando clientes...</p>;

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="clientes-table">
                {/* Header */}
                <div className="mb-4.5 px-5 flex md:clientes-center md:flex-row flex-col gap-5">
                    <div className="flex clientes-center gap-2">
                        <h1 className="font-bold text-2xl mr-5">Clientes</h1>
                        <button type="button" className="btn btn-primary gap-2" onClick={() => openModal()}>
                            <IconPlus />
                            Agregar
                        </button>
                    </div>

                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={paginatedRecords}
                        columns={[
                            { accessor: "name", title: "Nombre", sortable: true },
                            { accessor: "lastname", title: "Apellido", sortable: true },
                            { accessor: "email", title: "Email", sortable: true },
                            { accessor: "phone", title: "Teléfono", sortable: true },
                            { accessor: "zipcode", title: "Código Postal", sortable: true },
                            {
                                accessor: "action",
                                title: "Acciones",
                                sortable: false,
                                textAlignment: "center",
                                render: ({ id, ...cliente }) => (
                                    <div className="flex gap-4 clientes-center w-max mx-auto">
                                        <button
                                            type="button"
                                            className="flex hover:text-info"
                                            onClick={() => openModal({ id, ...cliente } as Cliente)}
                                        >
                                            <IconEdit />
                                        </button>
                                        <button
                                            type="button"
                                            className="flex hover:text-danger"
                                            onClick={() => id && handleDelete(id)}
                                        >
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={filteredSortedRecords.length}
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

                {/* Modal agregar/editar */}
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
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3">
                                            {params.id ? "Editar Cliente" : "Agregar Cliente"}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-4">
                                                    <label htmlFor="name">Nombre</label>
                                                    <input id="name" type="text" className="form-input" value={params.name} onChange={changeValue} />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="lastname">Apellido</label>
                                                    <input id="lastname" type="text" className="form-input" value={params.lastname} onChange={changeValue} />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="email">Email</label>
                                                    <input id="email" type="email" className="form-input" value={params.email} onChange={changeValue} />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="phone">Teléfono</label>
                                                    <input id="phone" type="text" className="form-input" value={params.phone} onChange={changeValue} />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="zipcode">Código Postal</label>
                                                    <input id="zipcode" type="text" className="form-input" value={params.zipcode} onChange={changeValue} />
                                                </div>

                                                <div className="flex justify-end items-center mt-6">
                                                    <button type="button" className="btn btn-outline-danger" onClick={closeModal}>
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                        onClick={saveCliente}
                                                    >
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

export default Clientes;
