export const formatNumber = (value: string | number): string => {
    if (!value) return "-";
    const num = Number(value);
    return new Intl.NumberFormat("es-AR").format(num);
};
