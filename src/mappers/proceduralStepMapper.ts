import { ProceduralStep } from "../types";
import { formatDate } from "../utils";

// 🔹 Backend → Front
export function mapProceduralStepFromApi(item: any): ProceduralStep {
    return {
        id: item.id ?? 0,
        date: formatDate(item.date),
        procedure: item.procedure ?? "-",
        ruling_text: item.ruling_text ?? "",
        signed: !!item.signed,
        pages: item.pages ?? null,
        attachments: item.attachments ?? [],
        references: item.references ?? [],
    };
}

// 🔹 Front → Backend
export function mapProceduralStepToApi(item: ProceduralStep) {
    return {
        id: item.id,
        date: new Date(item.date).toISOString().split("T")[0],
        procedure: item.procedure,
        ruling_text: item.ruling_text,
        signed: item.signed,
        pages: item.pages,
        attachments: item.attachments,
        references: item.references,
    };
}
