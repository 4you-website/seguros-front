import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeConfigSlice from "./themeConfigSlice";
import authSlice from "./authSlice";
import googleAuth from "./googleAuthSlice";
import clientesSlice from "./clientesSlice";
import companiesSlice from "./companiesSlice"; 


const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authSlice,
    authGoogle: googleAuth,    
    clientes: clientesSlice,
    companies: clientesSlice,
});

export const store = configureStore({
    reducer: rootReducer,
});

export default store;
export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
