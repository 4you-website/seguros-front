import { URL_API } from "./api";
import { CalendarEvent } from "../types";
import { mapCalendarEventFromApi, mapCalendarEventToApi } from "../mappers";

// -----------------------
// GET: Listar eventos de calendario
// -----------------------
export async function getCalendarEvents(
    token: string,
    signal?: AbortSignal
): Promise<CalendarEvent[]> {
    const res = await fetch(`${URL_API}/calendar-events`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        signal,
    });

    if (!res.ok) throw new Error("Error al obtener eventos del calendario");

    const data = await res.json();
    return data.map(mapCalendarEventFromApi);
}

// -----------------------
// GET: Obtener evento por ID
// -----------------------
export async function getCalendarEvent(
    id: number,
    token: string,
    signal?: AbortSignal
): Promise<CalendarEvent> {
    const res = await fetch(`${URL_API}/calendar-events/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        signal,
    });

    if (!res.ok) throw new Error("Error al obtener evento");

    return mapCalendarEventFromApi(await res.json());
}

// -----------------------
// POST: Crear evento
// -----------------------
export async function createCalendarEvent(
    event: CalendarEvent,
    token: string
): Promise<CalendarEvent> {
    const payload = mapCalendarEventToApi(event);

    const res = await fetch(`${URL_API}/calendar-events`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al crear evento");

    return mapCalendarEventFromApi(await res.json());
}

// -----------------------
// PUT: Actualizar evento
// -----------------------
export async function updateCalendarEvent(
    id: number,
    event: CalendarEvent,
    token: string
): Promise<CalendarEvent> {
    const payload = mapCalendarEventToApi(event);

    const res = await fetch(`${URL_API}/calendar-events/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al actualizar evento");

    return mapCalendarEventFromApi(await res.json());
}

// -----------------------
// DELETE: Eliminar evento
// -----------------------
export async function deleteCalendarEvent(
    id: number,
    token: string
): Promise<void> {
    const res = await fetch(`${URL_API}/calendar-events/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) throw new Error("Error al eliminar evento");
}
