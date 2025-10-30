import { useEffect, useState, useCallback } from "react";
import { Notification } from "../types";
import {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
} from "../services";

/**
 * Hook completo para manejar CRUD de notificaciones
 */
export function useNotifications(
    userId: number | null,
    token: string | null,
    status: "read" | "unread" | "all" = "unread"
) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------
    // GET: Obtener notificaciones
    // -----------------------
    const fetchNotifications = useCallback(async () => {
        if (!userId || !token) return;
        const controller = new AbortController();

        try {
            setLoading(true);
            setError(null);
            const data = await getNotifications(userId, token, status, controller.signal);
            setNotifications(data);
        } catch (err: any) {
            if (err.name !== "AbortError") {
                console.error("Error al obtener notificaciones:", err);
                setError("Error al obtener notificaciones");
            }
        } finally {
            setLoading(false);
        }

        // Cleanup: cancelamos si el componente se desmonta
        return () => controller.abort();
    }, [userId, token, status]);

    // Auto-fetch al montar o cambiar userId/token/status
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // -----------------------
    // POST: Crear notificación
    // -----------------------
    const addNotification = useCallback(
        async (notification: Notification) => {
            if (!token) throw new Error("Falta token");
            try {
                setLoading(true);
                const newNotification = await createNotification(notification, token);
                setNotifications((prev) => [newNotification, ...prev]);
            } catch (err) {
                console.error("Error creando notificación:", err);
                setError("Error creando notificación");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // -----------------------
    // PUT: Actualizar notificación
    // -----------------------
    const editNotification = useCallback(
        async (notification: Notification) => {
            if (!token) throw new Error("Falta token");
            try {
                setLoading(true);
                const updated = await updateNotification(notification, token);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === updated.id ? updated : n))
                );
            } catch (err) {
                console.error("Error actualizando notificación:", err);
                setError("Error actualizando notificación");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // -----------------------
    // DELETE: Eliminar notificación
    // -----------------------
    const removeNotification = useCallback(
        async (id: number) => {
            if (!token) throw new Error("Falta token");
            try {
                setLoading(true);
                await deleteNotification(id, token);
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            } catch (err) {
                console.error("Error eliminando notificación:", err);
                setError("Error eliminando notificación");
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
        notifications,
        loading,
        error,
        fetchNotifications,
        addNotification,
        editNotification,
        removeNotification,
    };
}
