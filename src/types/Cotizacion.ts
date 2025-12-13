export interface CotizarPayload {
    anio: string;
    aseguradoras: string[]; // ["atm", "provincia", ...]
    codpostal: string;
    es0km: string; // "S" | "N"
    marca: string;
    modelo: string;
    provincia: string;
    valordelvehiculo: string;
}

// Un plan cotizado (una fila de "result")
export interface CotizacionPlan {
    aseguradora: string;      // "atm", "provincia", etc.
    ajuste?: string | null;
    comision: number;
    cubre: string;
    cuota: number;
    frecuencia: string;
    idCotizacion: string;
    plan: string;
    sumaAsegurada: number;
}

// Modelo que usamos en el front
export interface Cotizacion {
    planes: CotizacionPlan[];
    raw?: any; // por si necesitás el objeto crudo más adelante
}
