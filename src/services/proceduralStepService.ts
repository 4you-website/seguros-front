import { URL_API } from "./api";
import { ProceduralStep } from "../types";
import {
    mapProceduralStepFromApi,
    mapProceduralStepToApi,
} from "../mappers";

// -----------------------
// GET: Obtener pasos procesales por expediente
// -----------------------
export async function getProceduralSteps(
    caseFileId: number,
    token: string,
    signal?: AbortSignal
): Promise<ProceduralStep[]> {
    const res = await fetch(`${URL_API}/case-files/${caseFileId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        signal,
    });

    if (!res.ok) throw new Error("Error al obtener los pasos procesales");

    const data = await res.json();

    // Puede venir un solo objeto o un array
    return Array.isArray(data)
        ? data.map(mapProceduralStepFromApi)
        : [mapProceduralStepFromApi(data)];
}

// -----------------------
// POST: Crear paso procesal
// -----------------------
export async function createProceduralStep(
    step: ProceduralStep,
    token: string
): Promise<ProceduralStep> {
    const payload = mapProceduralStepToApi(step);

    const res = await fetch(`${URL_API}/case-files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al crear paso procesal");

    return mapProceduralStepFromApi(await res.json());
}
