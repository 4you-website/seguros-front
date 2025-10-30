import { URL_API } from "./api";
import { Notification } from "../types";
import {
    mapNotificationFromApi,
    mapNotificationToApi,
} from "../mappers";

// GET
export async function getNotifications(
    userId: number,
    token: string,
    status: "read" | "unread" | "all" = "unread",
    signal?: AbortSignal
): Promise<Notification[]> {
    const res = await fetch(`${URL_API}/notifications?user_id=${userId}&status=${status}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        signal,
    });
    if (!res.ok) throw new Error("Error al obtener notificaciones");
    const data = await res.json();
    return data.map(mapNotificationFromApi);
}

// POST
export async function createNotification(notification: Notification, token: string): Promise<Notification> {
    const payload = mapNotificationToApi(notification);
    const res = await fetch(`${URL_API}/notifications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear notificación");
    return mapNotificationFromApi(await res.json());
}

// PUT
export async function updateNotification(notification: Notification, token: string): Promise<Notification> {
    const payload = mapNotificationToApi(notification);
    const res = await fetch(`${URL_API}/notifications/${notification.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al actualizar notificación");
    return mapNotificationFromApi(await res.json());
}

// DELETE
export async function deleteNotification(id: number, token: string): Promise<void> {
    const res = await fetch(`${URL_API}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar notificación");
}
