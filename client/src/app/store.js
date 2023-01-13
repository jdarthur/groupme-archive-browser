import { configureStore } from '@reduxjs/toolkit';
import { createReduxHistoryContext } from 'redux-first-history';
import { createBrowserHistory } from 'history';
import {api} from "../services/api";

const { createReduxHistory } = createReduxHistoryContext({
  history: createBrowserHistory()
});

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },

  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),

});

export const history = createReduxHistory(store);