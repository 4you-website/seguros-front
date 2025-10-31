// src/mappers/companyMapper.ts
import { Company } from "../types/Company";

export const mapCompanyFromApi = (data: any): Company => ({
  id: data.id,
  name: data.name,
  address: data.address,
  email: data.email,
  phone: data.phone,
});

export const mapCompanyToApi = (company: Company): any => ({
  id: company.id,
  name: company.name,
  address: company.address,
  email: company.email,
  phone: company.phone,
});
