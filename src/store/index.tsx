import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeConfigSlice from "./themeConfigSlice";
import authSlice from "./authSlice";
import { clientesApi } from "./api/clientesApi";
import { statesApi } from "./api/statesApi";
import { usersApi } from "./api/usersApi";
import { usersDataApi } from "./api/usersDataApi";
import { usersFieldsApi } from "./api/usersFieldsApi";
import { authApi } from "./api/authApi";
import { brandsApi } from "./api/brandsApi";
import { modelsApi } from "./api/modelsApi";
import { cotizadorApi } from "./api/cotizadorApi";

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authSlice,
    [clientesApi.reducerPath]: clientesApi.reducer,
    [statesApi.reducerPath]: statesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [usersDataApi.reducerPath]: usersDataApi.reducer,
    [usersFieldsApi.reducerPath]: usersFieldsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [modelsApi.reducerPath]: modelsApi.reducer,
    [cotizadorApi.reducerPath]: cotizadorApi.reducer,

});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(clientesApi.middleware)
            .concat(statesApi.middleware)
            .concat(usersApi.middleware)
            .concat(usersDataApi.middleware)
            .concat(usersFieldsApi.middleware)
            .concat(authApi.middleware)
            .concat(brandsApi.middleware)
            .concat(modelsApi.middleware)
            .concat(cotizadorApi.middleware),

});

export default store;
export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
