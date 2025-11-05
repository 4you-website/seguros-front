import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface CotizacionRequest {
    anio: string;
    codpostal: string;
    es0km: string;
    marca: string;
    modelo: string;
    provincia: string;
    valordelvehiculo: string;
}

export const cotizadorApi = createApi({
    reducerPath: "cotizadorApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        cotizar: builder.mutation<any, CotizacionRequest>({
            query: (body) => ({
                url: "/cotizar",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useCotizarMutation } = cotizadorApi;
