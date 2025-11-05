import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Cliente } from "../../types/Cliente";
import { mapClienteFromApi, mapClienteToApi } from "../../mappers/clienteMapper";

export const clientesApi = createApi({
    reducerPath: "clientesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Clientes"],
    endpoints: (builder) => ({
        // ------------------------------
        // 🔹 Obtener todos los clientes
        // ------------------------------
        getClientes: builder.query<Cliente[], void>({
            query: () => "/clients",
            transformResponse: (response: any[]) => response.map(mapClienteFromApi),
            providesTags: ["Clientes"],
        }),

        // ------------------------------
        // 🔹 Crear cliente
        // ------------------------------
        addCliente: builder.mutation<Cliente, Cliente>({
            query: (nuevo) => ({
                url: "/clients",
                method: "POST",
                body: mapClienteToApi(nuevo),
            }),
            transformResponse: mapClienteFromApi,
            invalidatesTags: ["Clientes"],
        }),

        // ------------------------------
        // 🔹 Actualizar cliente
        // ------------------------------
        updateCliente: builder.mutation<Cliente, Cliente>({
            query: (cliente) => ({
                url: `/clients/${cliente.id}`,
                method: "PUT",
                body: mapClienteToApi(cliente),
            }),
            transformResponse: mapClienteFromApi,
            invalidatesTags: ["Clientes"],
        }),

        // ------------------------------
        // 🔹 Eliminar cliente
        // ------------------------------
        deleteCliente: builder.mutation<void, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Clientes"],
        }),
    }),
});

export const {
    useGetClientesQuery,
    useAddClienteMutation,
    useUpdateClienteMutation,
    useDeleteClienteMutation,
} = clientesApi;
