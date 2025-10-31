2// src/services/companiesService.ts
import { URL_API } from "./api";
import { Company } from "../types/Company";
import { mapCompanyFromApi, mapCompanyToApi } from "../mappers/companyMapper";

// ------------------------- GET: lista de compañías
export async function getCompanies(token: string): Promise<Company[]> {
  const res = await fetch(`${URL_API}/companies`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener compañías");
  const data = await res.json();
  return data.map(mapCompanyFromApi);
}

// ------------------------- GET: compañía por ID
export async function getCompany(id: number, token: string): Promise<Company> {
  const res = await fetch(`${URL_API}/companies/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener compañía");
  return mapCompanyFromApi(await res.json());
}

// ------------------------- POST: crear compañía
export async function createCompany(company: Company, token: string): Promise<Company> {
  const payload = mapCompanyToApi(company);
  const res = await fetch(`${URL_API}/companies`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear compañía");
  return mapCompanyFromApi(await res.json());
}

// ------------------------- PUT: actualizar compañía
export async function updateCompany(id: number, company: Company, token: string): Promise<Company> {
  const payload = mapCompanyToApi(company);
  const res = await fetch(`${URL_API}/companies/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al actualizar compañía");
  return mapCompanyFromApi(await res.json());
}

// ------------------------- DELETE: eliminar compañía
export async function deleteCompany(id: number, token: string): Promise<void> {
  const res = await fetch(`${URL_API}/companies/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al eliminar compañía");
}
