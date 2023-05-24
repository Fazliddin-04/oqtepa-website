// src/redux/commonSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMapModal: false,
  location: null,
  deliveryType: null,
  branch: null,
  orderIds: null,
  points: [],
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    deliveryTypeHandler: (state, action) => {
      state.deliveryType = action.payload;
    },
    branchIdHandler: (state, action) => {
      state.branch = action.payload;
    },
    mapModalHandler: (state, action) => {
      state.isMapModal = action.payload;
    },
    addUserLocation: (state, action) => {
      state.location = action.payload;
    },
    removeUserLocation: (state) => {
      state.location = null;
    },
    setOrderIds: (state, action) => {
      state.orderIds = action.payload
    },
    clearOrderIds: (state) => {
      state.orderIds = null
    },
    savePoint: (state, action) => {
      state.points = state.points.map((item) => ({ ...item, isActive: false }))
      state.points.push(action.payload);
      state.location = action.payload.location;
    },
    updatePoint: (state, action) => {
      const selectedPoint = state.points.find((item) => item.id === action.payload.id);
      if (selectedPoint) {
        state.points = state.points.map((item) => item.id === selectedPoint.id ? action.payload : { ...item, isActive: false })
        state.location = action.payload.location;
      }
    },
    activateAddress: (state, action) => {
      const selectedPoint = state.points.find((item) => item.id === action.payload);
      if (selectedPoint) {
        state.points = state.points.map((item) => item.id !== selectedPoint.id ? { ...item, isActive: false } : { ...item, isActive: true })
        state.location = selectedPoint.location;
      }
    },
    removePoint: (state, action) => {
      const filteredArray = state.points.filter((item) => item.id !== action.payload);
      state.points = filteredArray;
      state.location = null;
    },
  },
});

export default commonSlice.reducer;
export const {
  addUserLocation, removeUserLocation, setOrderIds, deliveryTypeHandler, branchIdHandler,
  clearOrderIds, savePoint, updatePoint, removePoint, activateAddress, mapModalHandler
} = commonSlice.actions;