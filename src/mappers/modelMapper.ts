import { Model } from "../types/Model";

export const mapModelFromApi = (data: any): Model => ({
    id: data.id,
    name: data.name,
    brand_id: data.brand_id,
});

export const mapModelToApi = (model: Model) => ({
    name: model.name,
    brand_id: model.brand_id,
});
