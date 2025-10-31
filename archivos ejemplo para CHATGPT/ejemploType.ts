import { ProceduralStep } from "./proceduralStep"
export interface Expediente {
    id: number;
    barcode: string;
    file_number: string;
    receiver_number: string;
    title: string;
    jurisdiction: string;
    status: string;
    start_date: string;
    company: {
        id: number;
        name: string;
    };
    province: {
        id: number;
        name: string;
    };
    judicial_department: {
        id: number;
        name: string;
    };
    organism: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        username: string;
        email: string;
    };
    procedural_steps?: ProceduralStep[];
}
