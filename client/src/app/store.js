import {configureStore, createSlice} from '@reduxjs/toolkit';
import { createReduxHistoryContext } from 'redux-first-history';
import { createBrowserHistory } from 'history';
import {mainApi} from "../services/api";
import {useSelector} from "react-redux";
import {useMemo} from "react";
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import {persistReducer} from "redux-persist";

const { createReduxHistory } = createReduxHistoryContext({
  history: createBrowserHistory()
});

const slice = createSlice({
  name: 'auth',
  initialState: { token: null },
  reducers: {
    setToken: (state, { payload: { authToken } }) => {
      state.token = authToken;
    },
    logoutUser: (state) => {
      state.token = null;
    }
  }
});

export const useAuth = () => {
  const auth = useSelector(selectCurrentAuth);

  return useMemo(() => {
    return { ...auth };
  }, [auth]);
};


export const { setToken, logoutUser } = slice.actions;

export default slice.reducer;

export const selectCurrentAuth = (state) => state.auth;

const reducers = combineReducers({
  [mainApi.reducerPath]: mainApi.reducer,
  auth: slice.reducer,
});

const persistConfig = {
  key: 'groupme-archive-browser',
  storage,
  whitelist: ['auth']
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(mainApi.middleware),

});

export const history = createReduxHistory(store);


