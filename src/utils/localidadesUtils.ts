import localidadesDataRaw from "./localidades.json";

// ---------------------------
// Tipos
// ---------------------------
export interface LocalidadRaw {
    id: string;
    nombre: string;
    provincia: { id: string; nombre: string };
    departamento: { id: string; nombre: string };
}

export interface Localidad {
    id: string;
    nombre: string;
    provincia: string;
    departamento: string;
}

// ---------------------------
// Parseo seguro del JSON
// ---------------------------
const localidadesData: Localidad[] = (
    (localidadesDataRaw as { localidades: LocalidadRaw[] }).localidades || []
).map((l) => ({
    id: l.id,
    nombre: l.nombre,
    provincia: l.provincia.nombre,
    departamento: l.departamento.nombre,
}));

// ---------------------------
// Funciones utilitarias
// ---------------------------

/**
 * Obtiene todas las provincias únicas en orden alfabético.
 */
export const getProvincias = (): string[] => {
    return Array.from(new Set(localidadesData.map((l) => l.provincia))).sort((a, b) =>
        a.localeCompare(b)
    );
};

/**
 * Devuelve las localidades pertenecientes a una provincia dada.
 */
export const getLocalidadesByProvincia = (provincia: string): string[] => {
    return localidadesData
        .filter((l) => l.provincia === provincia)
        .map((l) => l.nombre)
        .filter((v, i, self) => self.indexOf(v) === i)
        .sort((a, b) => a.localeCompare(b));
};

/**
 * Busca localidad y provincia por ID o coincidencia parcial.
 */
export const findByCodigoPostal = (
    codigo: string
): { localidad?: string; provincia?: string } | null => {
    if (!codigo) return null;
    const entry = localidadesData.find((l) => l.id.startsWith(codigo));
    return entry ? { localidad: entry.nombre, provincia: entry.provincia } : null;
};
