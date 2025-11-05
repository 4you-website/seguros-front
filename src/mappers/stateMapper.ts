import { State } from "../types/State";

// -----------------------------
// 🔹 Mapper: API → Front
// -----------------------------
export const mapStateFromApi = (data: any): State => ({
    id: data.id,
    name: data.name,
});

// -----------------------------
// 🔹 Mapper: Front → API
// -----------------------------
export const mapStateToApi = (state: State) => ({
    id: state.id,
    name: state.name,
});
