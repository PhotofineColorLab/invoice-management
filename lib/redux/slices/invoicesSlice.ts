import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Invoice } from "@/app/types/data-types";

interface InvoicesState {
  items: Invoice[];
}

const initialState: InvoicesState = {
  items: [],
};

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.items = action.payload;
    },
    updateInvoice: (
      state,
      action: PayloadAction<{ index: number; invoice: Invoice }>
    ) => {
      const { index, invoice } = action.payload;
      if (index >= 0 && index < state.items.length) {
        state.items[index] = invoice;
      }
    },
    deleteInvoice: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
  },
});

export const { setInvoices, updateInvoice, deleteInvoice } =
  invoicesSlice.actions;
export default invoicesSlice.reducer;
