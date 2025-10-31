import { useState, Fragment, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import IconUserPlus from "../../components/Icon/IconUserPlus";
import IconListCheck from "../../components/Icon/IconListCheck";
import IconLayoutGrid from "../../components/Icon/IconLayoutGrid";
import IconSearch from "../../components/Icon/IconSearch";
import IconX from "../../components/Icon/IconX";
import { useCompanies } from "../../hooks/useCompanies";
import { Company } from "../../types/Company";

// ----------------------------------------------------------------------

const Companies = () => {
    const dispatch = useDispatch();
    const token = localStorage.getItem("token") || "";

    // Hook de compañías
    const {
        companies,
        loadingInicial,
        loadingAccion,
        fetchCompanies,
        addCompany,
        editCompany,
        removeCompany,
    } = useCompanies();

    // -------------------------------
    // Estados locales de UI
    const [addModal, setAddModal] = useState(false);
    const [view, setView] = useState<"list" | "grid">("list");
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState<Company[]>([]);
    const [params, setParams] = useState<Company>({
        id: 0,
        name: "",
        address: "",
        email: "",
        phone: "",
    });

    // -------------------------------
    // Cargar compañías al montar
    useEffect(() => {
        dispatch(setPageTitle("Compañías"));
        fetchCompanies(token);
    }, [dispatch, fetchCompanies, token]);

    // -------------------------------
    // Filtro de búsqueda
    useEffect(() => {
        if (companies) {
            const filteredList = companies.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
            setFiltered(filteredList);
        }
    }, [search, companies]);

    // -------------------------------
    // Funciones de UI
    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    const openModal = (company?: Company) => {
        if (company) setParams(company);
        else
            setParams({
                id: 0,
                name: "",
                address: "",
                email: "",
                phone: "",
            });
        setAddModal(true);
    };

    const closeModal = () => setAddModal(false);

    // -------------------------------
    // Guardar o actualizar compañía
    const saveCompany = async () => {
        if (!params.name || !params.email || !params.phone) {
            showMessage("Por favor, complete todos los campos obligatorios.", "error");
            return;
        }

        try {
            if (params.id) {
                await editCompany(params.id, params, token);
                showMessage("Compañía actualizada correctamente.");
            } else {
                await addCompany(params, token);
                showMessage("Compañía agregada correctamente.");
            }
            closeModal();
        } catch {
            showMessage("Error al guardar la compañía.", "error");
        }
    };

    const deleteCompany = async (id: number) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar compañía?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            try {
                await removeCompany(id, token);
                showMessage("Compañía eliminada correctamente.");
            } catch {
                showMessage("Error al eliminar compañía.", "error");
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
            {/* ------------------- Header ------------------- */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-semibold">Compañías</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <button type="button" className="btn btn-primary" onClick={() => openModal()}>
                            <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                            Agregar Compañía
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
                            placeholder="Buscar compañía"
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
                <div className="mt-5 panel p-0 border-0 overflow-hidden relative">
                    {loadingInicial ? (
                        <div className="p-6 text-center text-gray-500">Cargando compañías...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">No hay compañías registradas.</div>
                    ) : (
                        <div className="table-responsive relative">
                            {loadingAccion && (
                                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10">
                                    <div className="flex flex-col items-center text-gray-600 dark:text-gray-300">
                                        <div className="w-6 h-6 border-2 border-gray-400 border-t-primary rounded-full animate-spin mb-2"></div>
                                        <span>Procesando...</span>
                                    </div>
                                </div>
                            )}
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Dirección</th>
                                        <th className="!text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.name}</td>
                                            <td>{c.email}</td>
                                            <td>{c.phone}</td>
                                            <td>{c.address}</td>
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
                                                        onClick={() => deleteCompany(c.id)}
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
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={closeModal} className="relative z-[51]">
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
                                        {params.id ? "Editar Compañía" : "Agregar Compañía"}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-4">
                                                <label htmlFor="name">Nombre</label>
                                                <input id="name" type="text" className="form-input" value={params.name} onChange={changeValue} />
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
                                                <label htmlFor="address">Dirección</label>
                                                <textarea id="address" rows={3} className="form-textarea resize-none" value={params.address} onChange={changeValue}></textarea>
                                            </div>

                                            <div className="flex justify-end items-center mt-6">
                                                <button type="button" className="btn btn-outline-danger" onClick={closeModal}>
                                                    Cancelar
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveCompany}>
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

export default Companies;
