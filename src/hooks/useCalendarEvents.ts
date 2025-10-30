import { useState, useCallback } from "react";
import { CalendarEvent } from "../types";
import {
    getCalendarEvents,
    getCalendarEvent,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "../services";

// -----------------------
export function useCalendarEvents(token: string | null) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------
    // GET: Listar todos los eventos
    // -----------------------
    const fetchCalendarEvents = useCallback(async () => {
        if (!token) return;
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const data = await getCalendarEvents(token, controller.signal);
            setEvents(data);
        } catch (err: any) {
            setError(err.message || "Error al obtener los eventos");
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, [token]);

    // -----------------------
    // GET: Obtener evento por ID
    // -----------------------
    const fetchCalendarEvent = useCallback(
        async (id: number) => {
            if (!token) return;
            const controller = new AbortController();
            setLoading(true);
            setError(null);

            try {
                const data = await getCalendarEvent(id, token, controller.signal);
                setSelectedEvent(data);
            } catch (err: any) {
                setError(err.message || "Error al obtener el evento");
            } finally {
                setLoading(false);
            }

            return () => controller.abort();
        },
        [token]
    );

    // -----------------------
    // POST: Crear evento
    // -----------------------
    const addCalendarEvent = useCallback(
        async (event: CalendarEvent) => {
            if (!token) return;
            setLoading(true);
            setError(null);

            try {
                const created = await createCalendarEvent(event, token);
                setEvents((prev) => [...prev, created]);
            } catch (err: any) {
                setError(err.message || "Error al crear el evento");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // -----------------------
    // PUT: Editar evento
    // -----------------------
    const editCalendarEvent = useCallback(
        async (id: number, event: CalendarEvent) => {
            if (!token) return;
            setLoading(true);
            setError(null);

            try {
                const updated = await updateCalendarEvent(id, event, token);
                setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
            } catch (err: any) {
                setError(err.message || "Error al actualizar el evento");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // -----------------------
    // DELETE: Eliminar evento
    // -----------------------
    const removeCalendarEvent = useCallback(
        async (id: number) => {
            if (!token) return;
            setLoading(true);
            setError(null);

            try {
                await deleteCalendarEvent(id, token);
                setEvents((prev) => prev.filter((e) => e.id !== id));
            } catch (err: any) {
                setError(err.message || "Error al eliminar el evento");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // -----------------------
    // Retorno del hook
    // -----------------------
    return {
        events,
        selectedEvent,
        loading,
        error,
        fetchCalendarEvents,
        fetchCalendarEvent,
        addCalendarEvent,
        editCalendarEvent,
        removeCalendarEvent,
    };
}
