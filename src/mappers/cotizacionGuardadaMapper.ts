import type {
    AseguradorasMap,
    CotizacionGuardada,
    CotizacionGuardadaApi,
    CotizacionPlan,
    CotizacionPlanApi,
} from "../types";

// --------------------------------------------------
// Plan API (snake_case) -> Plan Front (camelCase)
// --------------------------------------------------
const mapPlanFromApi = (p: CotizacionPlanApi, aseguradora: string): CotizacionPlan => ({
    aseguradora,
    ajuste: (p.ajuste ?? "sin ajuste") as any, // tu CotizacionPlan permite string|null, esto lo deja compatible
    comision: Number(p.comision ?? 0),
    cubre: String(p.cubre ?? ""),
    cuota: Number(p.cuota ?? 0),
    frecuencia: String(p.frecuencia ?? ""),
    idCotizacion: String(p.id_cotizacion ?? ""),
    plan: String(p.plan ?? ""),
    sumaAsegurada: Number(p.suma_asegurada ?? 0),
});

// --------------------------------------------------
// Plan Front (camelCase) -> Plan API (snake_case)
// --------------------------------------------------
const mapPlanToApi = (p: CotizacionPlan): CotizacionPlanApi => ({
    ajuste: String(p.ajuste ?? "sin ajuste"),
    comision: Number(p.comision ?? 0),
    cubre: String(p.cubre ?? ""),
    cuota: Number(p.cuota ?? 0),
    frecuencia: String(p.frecuencia ?? ""),
    id_cotizacion: String(p.idCotizacion ?? ""),
    plan: String(p.plan ?? ""),
    suma_asegurada: Number(p.sumaAsegurada ?? 0),
});

// --------------------------------------------------
// Aseguradora API -> AseguradorasMap (front)
// --------------------------------------------------
const mapAseguradorasFromApi = (aseguradora: CotizacionGuardadaApi["aseguradora"]): AseguradorasMap => {
    const out: AseguradorasMap = {};

    (aseguradora || []).forEach((entry) => {
        Object.entries(entry || {}).forEach(([asegId, planes]) => {
            const mapped = (planes || []).map((p) => mapPlanFromApi(p, asegId));
            // merge por si viene repetido
            out[asegId] = [...(out[asegId] || []), ...mapped];
        });
    });

    return out;
};

// --------------------------------------------------
// Cotización guardada API -> Front
// --------------------------------------------------
export const mapCotizacionGuardadaFromApi = (api: CotizacionGuardadaApi): CotizacionGuardada => ({
    id: Number(api.id),
    fecha: String(api.fecha ?? ""),
    created_at: String(api.created_at ?? ""),
    status: String(api.status ?? ""),
    patente: String(api.patente ?? ""),

    anio: Number(api.anio ?? 0),
    es0km: Boolean(api.es0km),
    codigo_postal: String(api.codigo_postal ?? ""),
    valor_vehiculo: Number(api.valor_vehiculo ?? 0),

    cliente_id: Number(api.cliente_id ?? 0),
    cliente: api.cliente,

    marca_id: Number(api.marca_id ?? 0),
    marca: api.marca,

    modelo_id: Number(api.modelo_id ?? 0),
    modelo: api.modelo,

    aseguradoras: mapAseguradorasFromApi(api.aseguradora),
});

// --------------------------------------------------
// (opcional) Front -> API
// --------------------------------------------------
export const mapCotizacionGuardadaToApi = (model: CotizacionGuardada): CotizacionGuardadaApi => ({
    id: model.id,
    anio: model.anio,
    aseguradora: Object.entries(model.aseguradoras || {}).map(([asegId, planes]) => ({
        [asegId]: (planes || []).map(mapPlanToApi),
    })),

    cliente_id: model.cliente_id,
    cliente: model.cliente,

    codigo_postal: model.codigo_postal,
    created_at: model.created_at,
    es0km: model.es0km,
    fecha: model.fecha,

    marca_id: model.marca_id,
    marca: model.marca,

    modelo_id: model.modelo_id,
    modelo: model.modelo,

    patente: model.patente,
    status: model.status,

    usuario: { id: 0, email: "", name: null, lastname: null } as any,
    valor_vehiculo: model.valor_vehiculo,
});
