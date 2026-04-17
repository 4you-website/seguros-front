export const formatNumber = (value: string | number): string => {
    if (!value) return "-";
    const num = Number(value);
    return new Intl.NumberFormat("es-AR").format(num);
};

/** Mercantil Andina: comisión como porcentaje; resto: moneda. */
export const formatComisionParaCotizacion = (
    aseguradoraId: string | undefined | null,
    comision: string | number | undefined | null
): string => {
    const num = Number(comision ?? 0);
    if (Number.isNaN(num)) return "-";
    const formatted = new Intl.NumberFormat("es-AR").format(num);
    if ((aseguradoraId || "").toLowerCase() === "andina") {
        return `${formatted}%`;
    }
    return `$${formatted}`;
};
