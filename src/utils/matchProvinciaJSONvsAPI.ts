/***
 * 🔹 Funciones para matchear nombres de provincias entre distintas fuentes:
 * - localidades.json (nombres naturales)
 * - API externa (zippopotam.us)
 * - API interna (/states)
 ***/

import { getProvincias } from "./localidadesUtils";
import type { State } from "../types/State";

// -----------------------
// Normalizador común
// -----------------------
const normalize = (s: string) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

// -----------------------
// 1️⃣ Buscar provincia del JSON en la API interna
// -----------------------
export const findStateByProvinciaNombre = (provinciaNombre: string, states: State[]) => {
    const target = normalize(provinciaNombre);
    return states.find((s) => normalize(s.name) === target) || null;
};

// -----------------------
// 2️⃣ Mapear nombre de provincia de la API interna
//     al nombre usado en localidades.json
// -----------------------
export const mapApiProvinceNameToLocalidades = (apiName: string): string | null => {
    const provinciasLocalidades = getProvincias(); // nombres de localidades.json
    const target = normalize(apiName);

    return (
        provinciasLocalidades.find((p) => normalize(p) === target) || null
    );
};
