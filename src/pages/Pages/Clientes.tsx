import { useState, Fragment, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import IconUserPlus from "../../components/Icon/IconUserPlus";
import IconListCheck from "../../components/Icon/IconListCheck";
import IconLayoutGrid from "../../components/Icon/IconLayoutGrid";
import IconSearch from "../../components/Icon/IconSearch";
import IconUser from "../../components/Icon/IconUser";
import IconX from "../../components/Icon/IconX";

import { useClientes } from "../../hooks/useClientes";
import { Cliente } from "../../types/Cliente";

// ----------------------------------------------------------------------

const Clientes = () => {
    const dispatch = useDispatch();
    const token = localStorage.getItem("token") || "";

    // Hook de clientes (CRUD)
    const { clientes, loading, fetchClientes, addCliente, editCliente, removeCliente } = useClientes();

    // -------------------------------
    // Estados locales de UI
    const [addContactModal, setAddContactModal] = useState(false);
    const [view, setView] = useState<"list" | "grid">("list");
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState<Cliente[]>([]);
    const [params, setParams] = useState<Cliente>({
        id: 0,
        name: "",
        lastname: "",
        email: "",
        phone: "",
        zipcode: "",
        company_id: 1, // o dinámico según empresa logueada
    });

    // -------------------------------
    // Cargar clientes al montar
    useEffect(() => {
        dispatch(setPageTitle("Clientes"));
        fetchClientes(token);
    }, [dispatch, fetchClientes, token]);

    // -------------------------------
    // Filtro de búsqueda
    useEffect(() => {
        if (clientes) {
            const filteredList = clientes.filter((item) =>
                `${item.name} ${item.lastname}`.toLowerCase().includes(search.toLowerCase())
            );
            setFiltered(filteredList);
        }
    }, [search, clientes]);

    // -------------------------------
    // Funciones de UI
    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    const openModal = (cliente?: Cliente) => {
        if (cliente) setParams(cliente);
        else
            setParams({
                id: 0,
                name: "",
                lastname: "",
                email: "",
                phone: "",
                zipcode: "",
                company_id: 1,
            });
        setAddContactModal(true);
    };

    const closeModal = () => setAddContactModal(false);

    // -------------------------------
    // Guardar o actualizar cliente
    const saveCliente = async () => {
        if (!params.name || !params.lastname || !params.email || !params.phone) {
            showMessage("Por favor, complete todos los campos obligatorios.", "error");
            return;
        }

        try {
            if (params.id) {
                await editCliente(params.id, params, token);
                showMessage("Cliente actualizado correctamente.");
            } else {
                await addCliente(params, token);
                showMessage("Cliente agregado correctamente.");
            }
            closeModal();
        } catch {
            showMessage("Error al guardar el cliente.", "error");
        }
    };

    const deleteCliente = async (id: number) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar cliente?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            try {
                await removeCliente(id, token);
                showMessage("Cliente eliminado correctamente.");
            } catch {
                showMessage("Error al eliminar cliente.", "error");
            }
        }
    };

    // -------------------------------
    const showMessage = (msg: string, type: "success" | "error" = "success") => {
        Swal.fire({
            toast: true,
            position: "top",
            icon: type,
            title: msg,
            showConfirmButton: false,
            timer: 2500,
        });
    };

    // -------------------------------
    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Clientes</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <button type="button" className="btn btn-primary" onClick={() => openModal()}>
                            <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                            Agregar Cliente
                        </button>

                        <button
                            type="button"
                            className={`btn btn-outline-primary p-2 ${view === "list" && "bg-primary text-white"}`}
                            onClick={() => setView("list")}
                        >
                            <IconListCheck />
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-primary p-2 ${view === "grid" && "bg-primary text-white"}`}
                            onClick={() => setView("grid")}
                        >
                            <IconLayoutGrid />
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar cliente"
                            className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary"
                        >
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ------------------- Tabla ------------------- */}
            {view === "list" && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Cargando clientes...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">No hay clientes registrados.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Código Postal</th>
                                        <th className="!text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.name}</td>
                                            <td>{c.lastname}</td>
                                            <td>{c.email}</td>
                                            <td>{c.phone}</td>
                                            <td>{c.zipcode}</td>
                                            <td className="text-center">
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openModal(c)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteCliente(c.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ------------------- Modal ------------------- */}
            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={closeModal} className="relative z-[51]">
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
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
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveCliente}>
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
    );
};

export default Clientes;
