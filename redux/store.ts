import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./slice/auth.slice";
import doctorSlice from "./slice/doctor.slice";
import { useDispatch } from "react-redux";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // Only persist the auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  doctor: doctorSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const persistor = persistStore(store);
