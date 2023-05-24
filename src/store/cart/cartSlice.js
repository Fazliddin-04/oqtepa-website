import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  cart: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const itemInCart = state.cart.find((item) => item.product_id === action.payload.product_id);
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        state.cart.push({ ...action.payload, quantity: action.payload.quantity ? action.payload.quantity : 1, key: uuidv4() });
      }
    },
    incrementQuantity: (state, action) => {
      const product = state.cart.find((item) => item.key === action.payload);
      product.quantity++;
    },
    decrementQuantity: (state, action) => {
      const product = state.cart.find((item) => item.key === action.payload);
      if (product.quantity === 1) {
        product.quantity = 1
      } else {
        product.quantity--;
      }
    },
    removeProduct: (state, action) => {
      const product = state.cart.filter((item) => item.key !== action.payload);
      state.cart = product;
    },
    incrementLastofProduct: (state, action) => {
      const product = state.cart.findLast((item) => item.product_id === action.payload);
      product.quantity++;
    },
    decrementLastofProduct: (state, action) => {
      const item = state.cart.findLast((item) => item.product_id === action.payload);
      if (item.quantity === 1) {
        item.quantity = 1
      } else {
        item.quantity--;
      }
    },
    removeLastofProduct: (state, action) => {
      const item = state.cart.findLast((item) => item.product_id === action.payload);
      let index = state.cart.indexOf(item)
      state.cart.splice(index, 1);
    },
    clear: (state) => {
      state.cart = []
    }
  },
});

export default cartSlice.reducer;
export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeProduct, incrementLastofProduct, decrementLastofProduct,
  removeLastofProduct, clear
} = cartSlice.actions;
