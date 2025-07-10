// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import authReducer from "./slice/auth.slice";
// import doctorSlice from "./slice/doctor.slice";
// import { useDispatch } from "react-redux";
// import timeslotSlice from "./slice/timeslot.slice";
// import appointmentSlice from "./slice/appointment.slice";
// import prescriptionSlice from "./slice/prescription.slice";
// import educationalSlice from "./slice/educational.slice";

// const persistConfig = {
//   key: "root",
//   storage: AsyncStorage,
//   whitelist: ["auth"], // Only persist the auth slice
// };

// const rootReducer = combineReducers({
//   auth: authReducer,
//   doctor: doctorSlice,
//   timeslots: timeslotSlice,
//   appointments: appointmentSlice,
//   prescriptions: prescriptionSlice,
//   educational: educationalSlice
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore these action types
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//         // Ignore these field paths in all actions
//         ignoredActionPaths: ['register', 'rehydrate'],
//         // Ignore these paths in the state
//         ignoredPaths: ['register', 'rehydrate'],
//       },
//     }),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const persistor = persistStore(store);

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import doctorProfileReducer from './slice/doctorProfileSlice';
import adminReducer from './slice/adminSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer, // Add your auth reducer here
    admin: adminReducer,
    doctorProfile: doctorProfileReducer
  },
  // `middleware` is automatically added by `configureStore` to include redux-thunk
});

// Define RootState and AppDispatch types for better TypeScript inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;