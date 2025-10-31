import { URL_API } from "./api";
import { Expediente } from "../types";
import { mapExpedienteFromApi, mapExpedienteToApi } from "../mappers";

// -----------------------
// GET: Listar expedientes
// -----------------------
export async function getExpedientes(
    token: string,
    signal?: AbortSignal
): Promise<Expediente[]> {
    const res = await fetch(`${URL_API}/case-files`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        signal,
    });

    if (!res.ok) throw new Error("Error al obtener expedientes");

    const data = await res.json();
    return data.map(mapExpedienteFromApi);
}

// -----------------------
// GET: Obtener expediente por ID
// -----------------------
export async function getExpediente(
    id: number,
    token: string,
    signal?: AbortSignal
): Promise<Expediente> {
    const res = await fetch(`${URL_API}/case-files/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        signal,
    });

    if (!res.ok) throw new Error("Error al obtener expediente");

    return mapExpedienteFromApi(await res.json());
}

// -----------------------
// POST: Crear expediente
// -----------------------
export async function createExpediente(
    expediente: Expediente,
    token: string
): Promise<Expediente> {
    const payload = mapExpedienteToApi(expediente);

    const res = await fetch(`${URL_API}/case-files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al crear expediente");

    return mapExpedienteFromApi(await res.json());
}
