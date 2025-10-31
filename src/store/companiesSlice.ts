// src/store/companiesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Company } from "../types/Company";

interface CompaniesState {
  list: Company[];
  selected: Company | null;
}

const initialState: CompaniesState = {
  list: [],
  selected: null,
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.list = action.payload;
    },
    setCompanySelected: (state, action: PayloadAction<Company | null>) => {
      state.selected = action.payload;
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.list.push(action.payload);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.list.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
    },
    deleteCompany: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
  },
});

export const {
  setCompanies,
  setCompanySelected,
  addCompany,
  updateCompany,
  deleteCompany,
} = companiesSlice.actions;

export default companiesSlice.reducer;
