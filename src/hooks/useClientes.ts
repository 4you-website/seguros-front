// src/hooks/useClientes.ts
import { useState, useCallback } from "react";
import { Cliente } from "../types/Cliente";
import { getClientes, getCliente, createCliente, updateCliente, deleteCliente } from "../services/clientesService";

// -----------------------

export const useClientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------

    const fetchClientes = useCallback(async (token: string) => {
        setLoading(true);
        try {
            const data = await getClientes(token);
            setClientes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCliente = useCallback(async (id: number, token: string) => {
        setLoading(true);
        try {
            const data = await getCliente(id, token);
            setCliente(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addCliente = useCallback(async (nuevo: Cliente, token: string) => {
        setLoading(true);
        try {
            const created = await createCliente(nuevo, token);
            setClientes((prev) => [...prev, created]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const editCliente = useCallback(async (id: number, actualizado: Cliente, token: string) => {
        setLoading(true);
        try {
            const updated = await updateCliente(id, actualizado, token);
            setClientes((prev) => prev.map((c) => (c.id === id ? updated : c)));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeCliente = useCallback(async (id: number, token: string) => {
        setLoading(true);
        try {
            await deleteCliente(id, token);
            setClientes((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // -----------------------
    // Retorno del hook
    return {
        clientes,
        cliente,
        loading,
        error,
        fetchClientes,
        fetchCliente,
        addCliente,
        editCliente,
        removeCliente,
    };
};
