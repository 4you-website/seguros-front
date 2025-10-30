import { Notification } from "../types";
import { formatDate } from "../utils";

// 🔹 Transforma la respuesta cruda del backend a nuestro modelo de front
export function mapNotificationFromApi(item: any): Notification {
    return {
        id: item.id ?? 0,
        code: item.code ?? "-",
        date: formatDate(item.date),
        is_read: !!item.is_read,
        user_id: item.user_id ?? null,
        procedural_step_id: item.procedural_step_id ?? null,
        case_file: {
            id: item.case_file?.id ?? 0,
            title: item.case_file?.title ?? "-",
            organism: item.case_file?.organism ?? "-",
        },
        procedural_step: {
            date: formatDate(item.procedural_step?.date),
            procedure: item.procedural_step?.procedure ?? "-",
        },
    };
}

// 🔹 Transforma nuestro modelo de front al formato que espera el backend
export function mapNotificationToApi(notification: Notification) {
    return {
        id: notification.id,
        code: notification.code,
        date: new Date(notification.date).toISOString().split("T")[0], // inverso al formato dd/mm/yyyy
        is_read: notification.is_read,
        user_id: notification.user_id,
        procedural_step_id: notification.procedural_step_id,
        case_file_id: notification.case_file?.id,
        procedural_step: {
            date: new Date(notification.procedural_step.date).toISOString().split("T")[0],
            procedure: notification.procedural_step.procedure,
        },
    };
}
