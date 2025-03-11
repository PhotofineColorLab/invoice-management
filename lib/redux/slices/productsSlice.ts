import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/app/types/data-types";

interface ProductsState {
  items: Product[];
}

const initialState: ProductsState = {
  items: [],
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    updateProduct: (
      state,
      action: PayloadAction<{ index: number; product: Product }>
    ) => {
      const { index, product } = action.payload;
      if (index >= 0 && index < state.items.length) {
        state.items[index] = product;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
  },
});

export const { setProducts, updateProduct, deleteProduct } =
  productsSlice.actions;
export default productsSlice.reducer;
