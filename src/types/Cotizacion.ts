export interface CotizarPayload {
    anio: string;
    aseguradoras: string[]; // ["atm", "provincia", ...]
    codpostal: string;
    es0km: string; // "S" | "N"
    marca: string;
    modelo: string;
    provincia: string;
    valordelvehiculo: string;
    bonificacion?: string; // código de bonificación adicional (1 = SIN AJUSTE, etc.)
    accesorios?: number; // 0 si no está tildado, sino el valor del input
    clausulaAjuste?: string; // Provincia: cláusula de ajuste (0 = SIN AJUSTE, 10, 15, ... 99 = 100%)
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
    promocionesporplan?: string | null;
}

// Modelo que usamos en el front
export interface Cotizacion {
    planes: CotizacionPlan[];
    raw?: any; // por si necesitás el objeto crudo más adelante
}


export type CotizacionPlanApi = {
    ajuste?: string;
    comision: number;
    cubre: string;
    cuota: number;
    frecuencia: string;
    id_cotizacion: string;
    plan: string;
    suma_asegurada: number;
};

export type AseguradoraSeleccionada = Record<string, CotizacionPlanApi[]>;

export type GuardarCotizacionPayload = {
    anio: number;
    aseguradora: AseguradoraSeleccionada[];
    brand_id: number;
    client_id: number;
    codigo_postal: string;
    es0km: boolean;
    fecha: string; // YYYY-MM-DD
    model_id: number;
    valor_vehiculo: number;
};
