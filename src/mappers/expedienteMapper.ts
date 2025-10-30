import { Expediente } from "../types";
import { formatDate } from "../utils";
import { mapProceduralStepFromApi } from "./proceduralStepMapper";

// 🔹 Transforma la respuesta cruda del backend a nuestro modelo de front
export function mapExpedienteFromApi(item: any): Expediente {
    return {
        id: item.id ?? 0,
        barcode: item.barcode ?? "-",
        file_number: item.file_number ?? "-",
        receiver_number: item.receiver_number ?? "-",
        title: item.title ?? "-",
        jurisdiction: item.jurisdiction ?? "-",
        status: item.status ?? "-",
        start_date: formatDate(item.start_date),
        company: {
            id: item.company?.id ?? 0,
            name: item.company?.name ?? "-",
        },
        province: {
            id: item.province?.id ?? 0,
            name: item.province?.name ?? "-",
        },
        judicial_department: {
            id: item.judicial_department?.id ?? 0,
            name: item.judicial_department?.name ?? "-",
        },
        organism: {
            id: item.organism?.id ?? 0,
            name: item.organism?.name ?? "-",
        },
        user: {
            id: item.user?.id ?? 0,
            username: item.user?.username ?? "-",
            email: item.user?.email ?? "-",
        },
        procedural_steps: item.procedural_steps
            ? item.procedural_steps.map(mapProceduralStepFromApi)
            : [],
    };
}

// 🔹 Transforma nuestro modelo de front al formato que espera el backend
export function mapExpedienteToApi(expediente: Expediente) {
    return {
        id: expediente.id,
        barcode: expediente.barcode,
        file_number: expediente.file_number,
        receiver_number: expediente.receiver_number,
        title: expediente.title,
        jurisdiction: expediente.jurisdiction,
        status: expediente.status,
        start_date: new Date(expediente.start_date).toISOString().split("T")[0],
        company_id: expediente.company?.id,
        province_id: expediente.province?.id,
        judicial_department_id: expediente.judicial_department?.id,
        organism_id: expediente.organism?.id,
        user_id: expediente.user?.id,
    };
}
