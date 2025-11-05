import { Cliente } from "../types/Cliente";

export const mapClienteFromApi = (data: any): Cliente => ({
    id: data.id,
    name: data.name,
    lastname: data.lastname,
    email: data.email,
    phone: data.phone,
    zipcode: data.zipcode,
    vat: data.vat,
    is_company: data.is_company,
    state_id: data.state_id,
});

export const mapClienteToApi = (cliente: Cliente) => ({
    id: cliente.id,
    name: cliente.name,
    lastname: cliente.lastname,
    email: cliente.email,
    phone: cliente.phone,
    zipcode: cliente.zipcode,
    vat: cliente.vat,
    is_company: cliente.is_company,
    state_id: cliente.state_id,
});
