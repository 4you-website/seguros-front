import { UserData } from "./UserData";

export interface UserDataExtended extends UserData {
    field_name: string; // viene en la respuesta del backend
}
