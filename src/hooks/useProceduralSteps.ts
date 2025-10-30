import { useState, useCallback } from "react";
import { ProceduralStep } from "../types";
import {
    getProceduralSteps,
    createProceduralStep,
} from "../services";

// --------------------------------------------------
// Hook: useProceduralSteps
// --------------------------------------------------
export function useProceduralSteps() {
    const [steps, setSteps] = useState<ProceduralStep[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------
    // GET: Obtener pasos procesales
    // -----------------------
    const fetchProceduralSteps = useCallback(
        async (caseFileId: number, token: string) => {
            const controller = new AbortController();

            try {
                setLoading(true);
                setError(null);
                const data = await getProceduralSteps(caseFileId, token, controller.signal);
                setSteps(data);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Error al obtener pasos procesales:", err);
                    setError("Error al obtener pasos procesales");
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
    // POST: Crear paso procesal
    // -----------------------
    const addProceduralStep = useCallback(
        async (step: ProceduralStep, token: string) => {
            try {
                setLoading(true);
                const newStep = await createProceduralStep(step, token);
                setSteps((prev) => [newStep, ...prev]);
            } catch (err) {
                console.error("Error creando paso procesal:", err);
                setError("Error creando paso procesal");
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
        steps,
        loading,
        error,
        fetchProceduralSteps,
        addProceduralStep,
    };
}
