// src/companiasConfig.ts

export const COMPANIAS = [
    {
        id: "atm",
        nombre: "ATM",
        color: "#762C43",
        logoUrl: "/assets/images/aseguradoras/atm-cropped-favicon-32x32.png",
    },
    {
        id: "provincia",
        nombre: "Provincia Seguros",
        color: "#274380",
        logoUrl: "/assets/images/aseguradoras/provincia-logo.png",
    },
    {
        id: "fedpat",
        nombre: "FedPat",
        color: "#0858A4",
        // si no lo tenés aún, poné el tuyo cuando exista
        logoUrl: "/assets/images/aseguradoras/fedpat-logo.png",
    },
    {
        id: "sancor",
        nombre: "Sancor Seguros",
        color: "#C00869",
        logoUrl: "/assets/images/aseguradoras/sancor-logo.svg",
    },
] as const;

// -----------------------
// Tipos inferidos
// -----------------------
export type Compania = (typeof COMPANIAS)[number];
export type CompaniaId = Compania["id"];

// -----------------------
// Índice rápido por id
// -----------------------
const COMPANIA_BY_ID = Object.fromEntries(COMPANIAS.map((c) => [c.id, c])) as Record<
    CompaniaId,
    Compania
>;

// -----------------------
// Helpers
// -----------------------
export const getCompania = (id: string): Compania | null => {
    const key = (id || "").toLowerCase() as CompaniaId;
    return COMPANIA_BY_ID[key] ?? null;
};

export const getCompaniaNombre = (id: string) => getCompania(id)?.nombre ?? (id || "").toUpperCase();

export const getCompaniaColor = (id: string) => getCompania(id)?.color ?? "#111827";

export const getCompaniaLogoUrl = (id: string) => getCompania(id)?.logoUrl ?? "";

export const badgeStyle = (asegId: string) => ({
    backgroundColor: getCompaniaColor(asegId),
});
