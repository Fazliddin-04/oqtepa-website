import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    },
    logout: (state) => initialState,
    login: (state, action) => { state.user.name = action.payload },
    updateName: (state, action) => { state.user.name = action.payload }
  },
})

export const { reset, logout, updateName, login } = authSlice.actions
export default authSlice.reducer
