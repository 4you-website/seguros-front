import { Brand } from "../types/Brand";

// -----------------------
// Mapeo de API → Front
export const mapBrandFromApi = (data: any): Brand => ({
    id: data.id,
    name: data.name,
});

// -----------------------
// Mapeo de Front → API
export const mapBrandToApi = (brand: Brand): any => ({
    name: brand.name,
});
