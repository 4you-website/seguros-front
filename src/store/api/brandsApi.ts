import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Brand } from "../../types/Brand";
import { mapBrandFromApi, mapBrandToApi } from "../../mappers/brandMapper";

export const brandsApi = createApi({
    reducerPath: "brandsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Brand"],
    endpoints: (builder) => ({
        getBrands: builder.query<Brand[], void>({
            query: () => "/brands",
            transformResponse: (response: any[]) => response.map(mapBrandFromApi),
            providesTags: ["Brand"],
        }),
        getBrand: builder.query<Brand, number>({
            query: (id) => `/brands/${id}`,
            transformResponse: mapBrandFromApi,
        }),
        createBrand: builder.mutation<Brand, Brand>({
            query: (brand) => ({
                url: "/brands",
                method: "POST",
                body: mapBrandToApi(brand),
            }),
            invalidatesTags: ["Brand"],
        }),
        updateBrand: builder.mutation<Brand, Brand>({
            query: (brand) => ({
                url: `/brands/${brand.id}`,
                method: "PUT",
                body: mapBrandToApi(brand),
            }),
            invalidatesTags: ["Brand"],
        }),
        deleteBrand: builder.mutation<void, number>({
            query: (id) => ({
                url: `/brands/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Brand"],
        }),
    }),
});

export const {
    useGetBrandsQuery,
    useGetBrandQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} = brandsApi;
