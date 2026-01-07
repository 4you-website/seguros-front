import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GuardarCotizacionPayload } from "../../types/Cotizacion";
import type { CotizacionGuardada, QuotationsListApi } from "../../types";
import { mapCotizacionGuardadaFromApi } from "../../mappers";

type GetQuotationsArgs = {
    client_id: number;
    date?: string;
};

export const quotationsApi = createApi({
    reducerPath: "quotationsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Quotations"],
    endpoints: (builder) => ({
        // ------------------------------
        // GET /quotations?client_id=..&date=..
        // devuelve: { items, page, per_page, total }
        // ------------------------------
        getQuotations: builder.query<CotizacionGuardada[], GetQuotationsArgs>({
            query: ({ client_id, date }) => {
                const params = new URLSearchParams();
                params.set("client_id", String(client_id));
                if (date) params.set("date", date);
                return `/quotations?${params.toString()}`;
            },
            transformResponse: (response: QuotationsListApi) => {
                const items = response?.items || [];
                return items.map(mapCotizacionGuardadaFromApi);
            },
            providesTags: ["Quotations"],
        }),

        // ------------------------------
        // POST /quotations/result
        // ------------------------------
        addQuotationResult: builder.mutation<any, GuardarCotizacionPayload>({
            query: (body) => ({
                url: "/quotations/result",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Quotations"],
        }),
    }),
});

export const { useGetQuotationsQuery, useAddQuotationResultMutation } = quotationsApi;
