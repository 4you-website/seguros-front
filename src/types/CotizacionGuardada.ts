import type { CotizacionPlan, CotizacionPlanApi } from "./Cotizacion";

// -----------------------
// Map front (normalizado)
// -----------------------
export type AseguradorasMap = Record<string, CotizacionPlan[]>;

// -----------------------
// API types (backend)
// -----------------------
export type AseguradoraApiEntry = Record<string, CotizacionPlanApi[]>;

export interface ClienteResumen {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
}

export interface Marca {
    id: number;
    name: string;
}

export interface Modelo {
    id: number;
    name: string;
}

export interface UsuarioResumen {
    id: number;
    email: string;
    name: string | null;
    lastname: string | null;
}

export interface CotizacionGuardadaApi {
    id: number;
    anio: number;
    aseguradora: AseguradoraApiEntry[];

    cliente_id: number;
    cliente: ClienteResumen;

    codigo_postal: string;
    created_at: string;
    es0km: boolean;
    fecha: string;

    marca_id: number;
    marca: Marca;

    modelo_id: number;
    modelo: Modelo;

    patente: string;
    status: string;

    usuario: UsuarioResumen;

    valor_vehiculo: number;
}

export interface QuotationsListApi {
    items: CotizacionGuardadaApi[];
    page: number;
    per_page: number;
    total: number;
}

// -----------------------
// Front model (normalizado)
// -----------------------
export interface CotizacionGuardada {
    id: number;
    fecha: string;
    created_at: string;
    status: string;
    patente: string;

    anio: number;
    es0km: boolean;
    codigo_postal: string;
    valor_vehiculo: number;

    cliente_id: number;
    cliente: ClienteResumen;

    marca_id: number;
    marca: Marca;

    modelo_id: number;
    modelo: Modelo;

    aseguradoras: AseguradorasMap;
}
