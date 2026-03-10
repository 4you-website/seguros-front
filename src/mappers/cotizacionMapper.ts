import type { Cotizacion, CotizacionPlan, CotizarPayload } from "../types/Cotizacion";

// -----------------------
// Mapeo de API → Front
// -----------------------

export const mapCotizacionFromApi = (data: any): Cotizacion => {
    const planes: CotizacionPlan[] = [];

    if (data && typeof data === "object") {
        Object.entries<any>(data).forEach(([aseguradora, value]) => {
            const result = value?.result;
            if (Array.isArray(result)) {
                result.forEach((item: any) => {
                    planes.push({
                        aseguradora,
                        ajuste: item.ajuste ?? null,
                        comision: Number(item.comision ?? 0),
                        cubre: item.cubre ?? "",
                        cuota: Number(item.cuota ?? 0),
                        frecuencia: item.frecuencia ?? "",
                        idCotizacion: String(item.id_cotizacion ?? ""),
                        plan: item.plan ?? "",
                        sumaAsegurada: Number(item.suma_asegurada ?? 0),
                        promocionesporplan: item.promocionesporplan ?? item.promociones_por_plan ?? null,
                    });
                });
            }
        });
    }

    return { planes, raw: data };
};

// -----------------------
// Mapeo de Front → API
// -----------------------

export const mapCotizarToApi = (payload: CotizarPayload): any => ({
    anio: payload.anio,
    aseguradoras: payload.aseguradoras,
    codpostal: payload.codpostal,
    es0km: payload.es0km,
    marca: payload.marca,
    modelo: payload.modelo,
    provincia: payload.provincia,
    valordelvehiculo: payload.valordelvehiculo,
    ...(payload.bonificacion != null && { bonificacion: payload.bonificacion }),
    accesorios: payload.accesorios ?? 0,
});


