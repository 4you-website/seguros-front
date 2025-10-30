import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import IconPlus from "../../components/Icon/IconPlus";
import IconX from "../../components/Icon/IconX";
import { useCalendarEvents } from "../../hooks";
import { CalendarEvent } from "../../types";

const Calendar = () => {
    const dispatch = useDispatch();
    const token = localStorage.getItem("token"); // 🔑 obtiene el token
    const {
        events,
        fetchCalendarEvents,
        addCalendarEvent,
        editCalendarEvent,
        removeCalendarEvent,
        loading,
    } = useCalendarEvents(token);

    useEffect(() => {
        dispatch(setPageTitle("Calendario"));
    }, [dispatch]);

    // -----------------------
    // Cargar eventos desde API al montar
    // -----------------------
    useEffect(() => {
        if (token) fetchCalendarEvents();
    }, [token, fetchCalendarEvents]);

    // -----------------------
    // Estados locales para modal y formulario
    // -----------------------
    const [isAddEventModal, setIsAddEventModal] = useState(false);
    const [minStartDate, setMinStartDate] = useState<string>("");
    const [minEndDate, setMinEndDate] = useState<string>("");
    const defaultParams = {
        id: null as number | null,
        subject: "",
        body: "",
        start_date: "",
        end_date: "",
    };
    const [params, setParams] = useState(defaultParams);

    // -----------------------
    // Utilidades
    // -----------------------
    const dateFormat = (dt: any) => {
        dt = new Date(dt);
        const month = (dt.getMonth() + 1).toString().padStart(2, "0");
        const date = dt.getDate().toString().padStart(2, "0");
        const hours = dt.getHours().toString().padStart(2, "0");
        const mins = dt.getMinutes().toString().padStart(2, "0");
        return `${dt.getFullYear()}-${month}-${date}T${hours}:${mins}`;
    };

    const showMessage = (msg: string = "", type: SweetAlertIcon = "success") => {
        const toast = Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: "toast" },
        }) as typeof Swal;

        toast.fire({
            icon: type,
            title: msg,
            padding: "10px 20px",
        });
    };
    // -----------------------
    // Adaptar formato de eventos del backend a FullCalendar
    // -----------------------
    const mappedEvents = events.map((ev: CalendarEvent) => ({
        id: ev.id ? ev.id.toString() : undefined, // ✅ convertir número a string
        title: ev.subject,
        start: ev.start_date,
        end: ev.end_date,
        description: ev.body,
        className: "primary",
    }));
    // -----------------------
    // Modal editar / crear evento
    // -----------------------
    const editEvent = (data: any = null) => {
        setParams(defaultParams);
        if (data) {
            const obj = data.event;
            setParams({
                id: obj.id,
                subject: obj.title || "",
                body: obj.extendedProps?.description || "",
                start_date: dateFormat(obj.start),
                end_date: dateFormat(obj.end),
            });
            setMinStartDate(new Date().toISOString());
            setMinEndDate(dateFormat(obj.start));
        } else {
            setMinStartDate(new Date().toISOString());
            setMinEndDate(new Date().toISOString());
        }
        setIsAddEventModal(true);
    };

    const editDate = (data: any) => {
        editEvent({ event: { start: data.start, end: data.end } });
    };

    // -----------------------
    // Guardar evento (crear o editar)
    // -----------------------
    const saveEvent = async () => {
        if (!params.subject || !params.start_date || !params.end_date) return;

        try {
            if (params.id) {
                await editCalendarEvent(params.id, {
                    ...params,
                });
                showMessage("Evento actualizado correctamente");
            } else {
                await addCalendarEvent({
                    ...params,
                    case_file_id: null,
                });
                showMessage("Evento creado correctamente");
            }
            fetchCalendarEvents();
        } catch (err: any) {
            showMessage("Error al guardar el evento", "error");
        } finally {
            setIsAddEventModal(false);
        }
    };

    // -----------------------
    // Eliminar evento
    // -----------------------
    const deleteEvent = async (id: number) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar evento?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            await removeCalendarEvent(id);
            fetchCalendarEvents();
            showMessage("Evento eliminado");
        }
    };

    // -----------------------
    // Render principal
    // -----------------------
    return (
        <div>
            <div className="panel mb-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Calendario</h1>
                        <p className="text-sm text-gray-500">Gestiona tus audiencias y recordatorios.</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => editEvent()}>
                        <IconPlus className="ltr:mr-2 rtl:ml-2" />
                        Crear Evento
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Cargando eventos...</div>
                ) : (
                    <div className="calendar-wrapper">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            editable
                            selectable
                            eventClick={(event: any) => editEvent(event)}
                            select={(event: any) => editDate(event)}
                            events={mappedEvents}
                        />
                    </div>
                )}
            </div>

            {/* MODAL agregar / editar */}
            <Transition appear show={isAddEventModal} as={Fragment}>
                <Dialog as="div" onClose={() => setIsAddEventModal(false)} open={isAddEventModal} className="relative z-[51]">
                    <TransitionChild
                        as={Fragment}
                        enter="duration-300 ease-out"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="duration-300 ease-out"
                                enter-from="opacity-0 scale-95"
                                enter-to="opacity-100 scale-100"
                                leave="duration-200 ease-in"
                                leave-from="opacity-100 scale-100"
                                leave-to="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark relative">
                                    <button
                                        type="button"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600"
                                        onClick={() => setIsAddEventModal(false)}
                                    >
                                        <IconX className="w-6 h-6" />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] px-5 py-3">
                                        {params.id ? "Editar evento" : "Agregar evento"}
                                    </div>
                                    <div className="p-5">
                                        <form className="space-y-5">
                                            <div>
                                                <label htmlFor="subject">Título</label>
                                                <input
                                                    id="subject"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Ej. Audiencia en el Juzgado"
                                                    value={params.subject}
                                                    onChange={(e) => setParams({ ...params, subject: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="start_date">Desde</label>
                                                <input
                                                    id="start_date"
                                                    type="datetime-local"
                                                    className="form-input"
                                                    value={params.start_date}
                                                    min={minStartDate}
                                                    onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end_date">Hasta</label>
                                                <input
                                                    id="end_date"
                                                    type="datetime-local"
                                                    className="form-input"
                                                    value={params.end_date}
                                                    min={minEndDate}
                                                    onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="body">Descripción</label>
                                                <textarea
                                                    id="body"
                                                    className="form-textarea min-h-[100px]"
                                                    value={params.body}
                                                    placeholder="Ej. Llamar al cliente o revisar expediente"
                                                    onChange={(e) => setParams({ ...params, body: e.target.value })}
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEventModal(false)}>
                                                    Cancelar
                                                </button>
                                                <button type="button" onClick={saveEvent} className="btn btn-primary ml-4">
                                                    {params.id ? "Actualizar" : "Crear"}
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

export default Calendar;
