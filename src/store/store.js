import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './auth/authSlice'
import cartReducer from './cart/cartSlice'
import commonReducer from './common/commonSlice'

const authConfig = {
  key: 'auth',
  version: 1,
  storage,
}


const cartConfig = {
  key: 'cart',
  version: 1,
  storage,
}
const commonConfig = {
  key: 'common',
  version: 1,
  storage,
}

const rootReducer = combineReducers({
  auth: persistReducer(authConfig, authReducer),
  cart: persistReducer(cartConfig, cartReducer),
  common: persistReducer(commonConfig, commonReducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export let persistor = persistStore(store)
