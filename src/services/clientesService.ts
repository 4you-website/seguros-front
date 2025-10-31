// src/services/clientsService.ts
import { URL_API } from "./api";
import { Cliente } from "../types/Cliente";
import { mapClienteFromApi, mapClienteToApi } from "../mappers/clienteMapper";

// -------------------------------------------------------------
// GET: Listado de clientes
export async function getClientes(token: string): Promise<Cliente[]> {
    const res = await fetch(`${URL_API}/clients`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener clientes");
    const data = await res.json();
    return data.map(mapClienteFromApi);
}

// -------------------------------------------------------------
// GET: Cliente por ID
export async function getCliente(id: number, token: string): Promise<Cliente> {
    const res = await fetch(`${URL_API}/clients/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener cliente");
    return mapClienteFromApi(await res.json());
}

// -------------------------------------------------------------
// POST: Crear cliente
export async function createCliente(cliente: Cliente, token: string): Promise<Cliente> {
    const payload = mapClienteToApi(cliente);
    const res = await fetch(`${URL_API}/clients`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear cliente");
    return mapClienteFromApi(await res.json());
}

// -------------------------------------------------------------
// PUT: Actualizar cliente
export async function updateCliente(id: number, cliente: Cliente, token: string): Promise<Cliente> {
    const payload = mapClienteToApi(cliente);
    const res = await fetch(`${URL_API}/clients/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al actualizar cliente");
    return mapClienteFromApi(await res.json());
}

// -------------------------------------------------------------
// DELETE: Eliminar cliente
export async function deleteCliente(id: number, token: string): Promise<void> {
    const res = await fetch(`${URL_API}/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar cliente");
}
