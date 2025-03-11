import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "@/app/types/data-types";

interface CustomersState {
  items: Customer[];
}

const initialState: CustomersState = {
  items: [],
};

export const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
    },
    updateCustomer: (
      state,
      action: PayloadAction<{ index: number; customer: Customer }>
    ) => {
      const { index, customer } = action.payload;
      if (index >= 0 && index < state.items.length) {
        state.items[index] = customer;
      }
    },
    deleteCustomer: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
  },
});

export const { setCustomers, updateCustomer, deleteCustomer } =
  customersSlice.actions;
export default customersSlice.reducer;
