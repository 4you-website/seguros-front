import { useState, useCallback } from "react";
import { Expediente } from "../types";
import { getExpedientes, getExpediente, createExpediente } from "../services";

// --------------------------------------------------
// Hook: useExpedientes
// --------------------------------------------------
export function useExpedientes() {
    const [expedientes, setExpedientes] = useState<Expediente[]>([]);
    const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------
    // GET: Listar expedientes
    // -----------------------
    const fetchExpedientes = useCallback(
        async (token: string) => {
            const controller = new AbortController();
            try {
                setLoading(true);
                setError(null);
                const data = await getExpedientes(token, controller.signal);
                setExpedientes(data);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Error al obtener expedientes:", err);
                    setError("Error al obtener expedientes");
                }
            } finally {
                setLoading(false);
            }

            // Cleanup
            return () => controller.abort();
        },
        []
    );

    // -----------------------
    // GET: Obtener expediente por ID
    // -----------------------
    const fetchExpediente = useCallback(
        async (id: number, token: string) => {
            const controller = new AbortController();
            try {
                setLoading(true);
                setError(null);
                const data = await getExpediente(id, token, controller.signal);
                setSelectedExpediente(data);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Error al obtener expediente:", err);
                    setError("Error al obtener expediente");
                }
            } finally {
                setLoading(false);
            }

            // Cleanup
            return () => controller.abort();
        },
        []
    );

    // -----------------------
    // POST: Crear expediente
    // -----------------------
    const addExpediente = useCallback(
        async (expediente: Expediente, token: string) => {
            try {
                setLoading(true);
                const newExpediente = await createExpediente(expediente, token);
                setExpedientes((prev) => [newExpediente, ...prev]);
            } catch (err) {
                console.error("Error creando expediente:", err);
                setError("Error creando expediente");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // -----------------------
    // Retorno del hook
    // -----------------------
    return {
        expedientes,
        selectedExpediente,
        loading,
        error,
        fetchExpedientes,
        fetchExpediente,
        addExpediente,
    };
}
