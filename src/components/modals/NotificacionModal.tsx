import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import IconX from "../Icon/IconX";
import { Notification } from "../../types"; // 👈 usamos el tipo real

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification | null;
}

export default function NotificacionModal({ isOpen, onClose, notification }: NotificationModalProps) {
    if (!notification) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                {/* Fondo oscuro */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60" />
                </TransitionChild>

                <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="panel w-full max-w-lg rounded-lg bg-white p-6 dark:bg-dark">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Detalle de Notificación</h2>
                                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                    <IconX />
                                </button>
                            </div>

                            {/* Contenido */}
                            <div className="space-y-2 text-sm">
                                <p><b>Expediente:</b> {notification.case_file?.title ?? "-"}</p>
                                <p><b>Expediente ID:</b> {notification.case_file?.id ?? "-"}</p>
                                <p><b>Trámite:</b> {notification.procedural_step?.procedure ?? "-"}</p>
                                <p><b>Fecha del trámite:</b> {notification.procedural_step?.date ?? "-"}</p>
                                <p><b>Fecha de alta:</b> {notification.date ?? "-"}</p>
                                <p><b>Código:</b> {notification.code ?? "-"}</p>
                                <p><b>Estado:</b> {notification.is_read ? "Leída" : "No leída"}</p>
                                <p><b>User ID:</b> {notification.user_id ?? "-"}</p>
                            </div>

                            {/* Botones */}
                            <div className="mt-6 flex justify-end gap-2">
                                <button onClick={onClose} className="btn btn-outline-danger">
                                    Cerrar
                                </button>
                                <button className="btn btn-primary">
                                    Preguntar a Procu
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
