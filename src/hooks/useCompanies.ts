import { useState, useCallback } from "react";
import { Company } from "../types/Company";
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../services/companiesService";

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingInicial, setLoadingInicial] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------- FETCH LIST (solo inicial)
  const fetchCompanies = useCallback(async (token: string) => {
    setLoadingInicial(true);
    try {
      const data = await getCompanies(token);
      setCompanies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingInicial(false);
    }
  }, []);

  // ------------------- CREATE
  const addCompany = useCallback(async (nuevo: Company, token: string) => {
    setLoadingAccion(true);
    try {
      const created = await createCompany(nuevo, token);
      setCompanies((prev) => [...prev, created]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAccion(false);
    }
  }, []);

  // ------------------- UPDATE
  const editCompany = useCallback(async (id: number, actualizado: Company, token: string) => {
    setLoadingAccion(true);
    try {
      const updated = await updateCompany(id, actualizado, token);
      setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAccion(false);
    }
  }, []);

  // ------------------- DELETE
  const removeCompany = useCallback(async (id: number, token: string) => {
    setLoadingAccion(true);
    try {
      await deleteCompany(id, token);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAccion(false);
    }
  }, []);

  return {
    companies,
    company,
    loadingInicial,
    loadingAccion,
    error,
    fetchCompanies,
    addCompany,
    editCompany,
    removeCompany,
  };
};
