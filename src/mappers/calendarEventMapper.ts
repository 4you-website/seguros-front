// mappers/calendarEventMapper.ts
import { CalendarEvent } from "../types";

export function mapCalendarEventFromApi(data: any): CalendarEvent {
    return {
        id: data.id,
        subject: data.subject,
        body: data.body,
        start_date: data.start_date,
        end_date: data.end_date,
        case_file_id: data.case_file_id ?? null,
        case_file_title: data.case_file_title ?? null,
    };
}

export function mapCalendarEventToApi(event: CalendarEvent): any {
    return {
        id: event.id,
        subject: event.subject,
        body: event.body,
        start_date: event.start_date,
        end_date: event.end_date,
        case_file_id: event.case_file_id,        
    };
}
