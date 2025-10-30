export interface ProceduralStep {
    id: number;
    date: string;
    procedure: string;
    ruling_text: string;
    signed: boolean;
    pages: number | null;
    attachments: any[];
    references: any[];
}
