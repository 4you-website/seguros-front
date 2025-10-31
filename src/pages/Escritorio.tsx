import { Link } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import IconMenuMailbox from '../components/Icon/Menu/IconMenuMailbox';
import IconChatNotification from '../components/Icon/IconChatNotification';
import { NotificacionModal } from '../components/modals';
import { useCalendarEvents  } from "../hooks";
import { IRootState } from '../store';
import IconMessage from '../components/Icon/IconMessage';
import IconMailDot from '../components/Icon/IconMailDot';
import IconMenuNotes from '../components/Icon/Menu/IconMenuNotes';

const Escritorio = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: IRootState) => state.auth);

    const [modalOpen, setModalOpen] = useState(false);

    const {
        events: calendarEvents,
        fetchCalendarEvents,
        loading: calendarLoading,
        error: calendarError,
    } = useCalendarEvents(token);

    // 🚀 Traer los eventos al montar el componente
    useEffect(() => {
        if (token) fetchCalendarEvents();
    }, [token, fetchCalendarEvents]);

    useEffect(() => {
        dispatch(setPageTitle('Escritorio'));
    }, [dispatch]);


    // Obtener las últimas 5 notificaciones (si hay)

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-title md:text-4xl">
                            Escritorio
                        </h1>
                    </div>
                </div>

                {/* 📦 Tarjetas en la misma fila */}
                <div className="flex flex-wrap w-full justify-center gap-6 mb-8 px-5">

                    {/* Card 1 */}
                    <div className="w-full md:w-[48%] border border-gray-500/20 rounded-md shadow-[rgb(31_45_61_/_10%)_0px_2px_10px_1px] dark:shadow-[0_2px_11px_0_rgb(6_8_24_/_39%)] p-6">
                        <div className="flex items-center mb-5">
                            <IconMenuNotes className="size-8 text-primary mr-3" />
                            <h5 className="text-lg font-semibold dark:text-white-light">Últimos movimientos MEV</h5>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table-auto w-full text-sm">
                            </table>
                        </div>
                    </div>


                    {/* Card 2 */}
                    <div className="w-full md:w-[48%] border border-gray-500/20 rounded-md shadow-[rgb(31_45_61_/_10%)_0px_2px_10px_1px] dark:shadow-[0_2px_11px_0_rgb(6_8_24_/_39%)] p-6">
                        <div className="flex items-center mb-5">
                            <IconMailDot className="size-8 text-primary mr-3" />
                            <h5 className="text-lg font-semibold dark:text-white-light">Últimas Notificaciones</h5>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table-auto w-full text-sm">

                            
                            </table>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="w-full md:w-[48%] border border-gray-500/20 rounded-md shadow-[rgb(31_45_61_/_10%)_0px_2px_10px_1px] dark:shadow-[0_2px_11px_0_rgb(6_8_24_/_39%)] p-6">
                        <div className="flex items-center mb-5">
                            <IconMenuMailbox className="size-8 text-primary mr-3" />
                            <h5 className="text-lg font-semibold dark:text-white-light">Agenda</h5>
                        </div>

                        {calendarLoading && <p className="text-sm text-gray-500">Cargando eventos...</p>}
                        {calendarError && <p className="text-sm text-red-500">{calendarError}</p>}

                        {!calendarLoading && !calendarError && (
                            <div className="mb-5">
                                <div className="max-w-[900px] mx-auto">
                                    {calendarEvents.length > 0 ? (
                                        calendarEvents.map((ev: any) => (
                                            <div className="flex" key={ev.id}>
                                                <p className="text-[#3b3f5c] dark:text-white-light min-w-[58px] max-w-[100px] text-base font-semibold py-2.5">
                                                    {new Date(ev.start_date).toLocaleTimeString("es-AR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                                <div className="relative before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px] before:w-2.5 before:h-2.5 before:border-2 before:border-primary before:rounded-full after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px] after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2 after:border-primary after:rounded-full"></div>
                                                <div className="p-2.5 self-center ltr:ml-2.5 rtl:ltr:mr-2.5 rtl:ml-2.5">
                                                    <p className="text-[#3b3f5c] dark:text-white-light font-semibold text-[13px]">
                                                        {ev.subject}
                                                    </p>
                                                    <p className="text-white-dark text-xs font-bold self-center">
                                                        {ev.case_file_title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {ev.body}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay eventos registrados.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Escritorio;
