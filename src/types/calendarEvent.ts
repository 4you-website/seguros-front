// types/calendarEvent.ts
export interface CalendarEvent {
    id?: number | null;
    subject: string;
    body: string;
    start_date: string; // formato ISO
    end_date: string;   // formato ISO
    case_file_id?: number | null;
    case_file_title?: string | null; // título descriptivo del expediente (solo lectura)
}
