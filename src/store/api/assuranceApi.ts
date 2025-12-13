import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Cotizacion, CotizarPayload } from "../../types/Cotizacion";
import { mapCotizacionFromApi, mapCotizarToApi } from "../../mappers/cotizacionMapper";

export const assuranceApi = createApi({
    reducerPath: "assuranceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        cotizar: builder.mutation<Cotizacion, CotizarPayload>({
            query: (payload) => ({
                url: "/assurance/cotizar",
                method: "POST",
                body: mapCotizarToApi(payload),
            }),
            transformResponse: (response: any) => mapCotizacionFromApi(response),
        }),
    }),
});

export const { useCotizarMutation } = assuranceApi;
