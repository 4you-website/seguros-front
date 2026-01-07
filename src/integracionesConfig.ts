// src/integracionesConfig.ts
import { getCompaniaLogoUrl, getCompaniaNombre, type CompaniaId } from "./companiasConfig";

export interface IntegracionFieldConfig {
    field_id: number;
    label: string;
    inputType: "text" | "password";
    placeholder?: string;
}

export interface IntegracionConfig {
    key: IntegracionKey;
    title: string;     // <- derivado
    logoSrc: string;   // <- derivado
    logoClassName?: string;
    fields: IntegracionFieldConfig[];
}

// Base mínima: solo lo específico de esta pantalla
const INTEGRACIONES_BASE = [
    {
        key: "atm",
        logoClassName: "w-10 h-10 rounded-full object-cover",
        fields: [
            { field_id: 5, label: "Usuario", inputType: "text", placeholder: "Usuario ATM" },
            { field_id: 6, label: "Contraseña", inputType: "password", placeholder: "Contraseña ATM" },
            { field_id: 11, label: "Código de productor", inputType: "text", placeholder: "CodProd" },
        ],
    },
    {
        key: "provincia",
        logoClassName: "w-16 h-10 object-contain rounded-md bg-white p-1",
        fields: [
            { field_id: 1, label: "Usuario", inputType: "text", placeholder: "Usuario Provincia" },
            { field_id: 2, label: "Contraseña", inputType: "password", placeholder: "Contraseña Provincia" },
        ],
    },
    {
        key: "sancor",
        logoClassName: "w-16 h-10 object-contain rounded-md bg-white p-1",
        fields: [
            { field_id: 3, label: "Usuario", inputType: "text", placeholder: "Usuario Sancor" },
            { field_id: 4, label: "Contraseña", inputType: "password", placeholder: "Contraseña Sancor" },
        ],
    },
] as const satisfies readonly {
    key: CompaniaId;
    logoClassName?: string;
    fields: IntegracionFieldConfig[];
}[];

// Tipo automático (sale del base)
export type IntegracionKey = (typeof INTEGRACIONES_BASE)[number]["key"];

// Config final: title/logo vienen del companiasConfig
export const INTEGRACIONES_CONFIG: IntegracionConfig[] = INTEGRACIONES_BASE.map((i) => ({
    ...i,
    title: getCompaniaNombre(i.key),
    logoSrc: getCompaniaLogoUrl(i.key),
}));
