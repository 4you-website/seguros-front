// src/store/clientes/clientesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cliente } from "../types/Cliente";

interface ClientesState {
    list: Cliente[];
    selected: Cliente | null;
}

const initialState: ClientesState = {
    list: [],
    selected: null,
};

const clientesSlice = createSlice({
    name: "clientes",
    initialState,
    reducers: {
        setClientes: (state, action: PayloadAction<Cliente[]>) => {
            state.list = action.payload;
        },
        setClienteSeleccionado: (state, action: PayloadAction<Cliente | null>) => {
            state.selected = action.payload;
        },
        addCliente: (state, action: PayloadAction<Cliente>) => {
            state.list.push(action.payload);
        },
        updateCliente: (state, action: PayloadAction<Cliente>) => {
            const index = state.list.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) state.list[index] = action.payload;
        },
        deleteCliente: (state, action: PayloadAction<number>) => {
            state.list = state.list.filter((c) => c.id !== action.payload);
        },
    },
});

export const {
    setClientes,
    setClienteSeleccionado,
    addCliente,
    updateCliente,
    deleteCliente,
} = clientesSlice.actions;

export default clientesSlice.reducer;
