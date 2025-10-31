// src/mappers/clienteMapper.ts
import { Cliente } from "../types/Cliente";

export const mapClienteFromApi = (data: any): Cliente => ({
    id: data.id,
    name: data.name,
    lastname: data.lastname,
    email: data.email,
    phone: data.phone,
    zipcode: data.zipcode,
    company_id: data.company_id,
});

export const mapClienteToApi = (cliente: Cliente): any => ({
    id: cliente.id,
    name: cliente.name,
    lastname: cliente.lastname,
    email: cliente.email,
    phone: cliente.phone,
    zipcode: cliente.zipcode,
    company_id: cliente.company_id,
});