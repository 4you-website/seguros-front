export interface Notification {
    id: number;
    code: string;
    date: string;
    is_read: boolean;
    user_id: number;
    case_file: {
        id: number;
        title: string;
        organism: string;
    };
    procedural_step_id: number;
    procedural_step: {
        date: string;
        procedure: string;
    };

}
