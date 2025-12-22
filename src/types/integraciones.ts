export type IntegracionKey = "atm" | "provincia" | "sancor";

export interface IntegracionFieldConfig {
    field_id: number;
    label: string;
    inputType: "text" | "password";
    placeholder?: string;
}

export interface IntegracionConfig {
    key: IntegracionKey;
    title: string;
    logoSrc: string;
    logoClassName?: string;
    fields: IntegracionFieldConfig[];
}

export const INTEGRACIONES_CONFIG: IntegracionConfig[] = [
    {
        key: "atm",
        title: "ATM",
        logoSrc: "/assets/images/atm-cropped-favicon-32x32.png",
        logoClassName: "w-10 h-10 rounded-full object-cover",
        fields: [
            { field_id: 5, label: "Usuario", inputType: "text", placeholder: "Usuario ATM" },
            { field_id: 6, label: "Contraseña", inputType: "password", placeholder: "Contraseña ATM" },
            { field_id: 11, label: "Código de productor", inputType: "text", placeholder: "CodProd" },
        ],
    },
    {
        key: "provincia",
        title: "Provincia Seguros",
        logoSrc: "/assets/images/provincia-logo.png",
        logoClassName: "w-16 h-10 object-contain rounded-md bg-white p-1",
        fields: [
            { field_id: 1, label: "Usuario", inputType: "text", placeholder: "Usuario Provincia" },
            { field_id: 2, label: "Contraseña", inputType: "password", placeholder: "Contraseña Provincia" },
        ],
    },
    {
        key: "sancor",
        title: "Sancor",
        logoSrc: "/assets/images/sancor-logo.svg",
        logoClassName: "w-16 h-10 object-contain rounded-md bg-white p-1",
        fields: [
            { field_id: 3, label: "Usuario", inputType: "text", placeholder: "Usuario Sancor" },
            { field_id: 4, label: "Contraseña", inputType: "password", placeholder: "Contraseña Sancor" },
        ],
    },
];
