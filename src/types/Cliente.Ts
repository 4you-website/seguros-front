// src/types/Cliente.ts
export interface Cliente {
    id: number;
    name: string;        // nombre (solo el nombre)
    lastname: string;    // apellido
    email: string;
    phone: string;
    zipcode: string;     // código postal
   company_id: number;  // relación con la empresa
}
