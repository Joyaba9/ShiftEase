import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';
import businessReducer from './reducers/businessReducer';
import storage from 'redux-persist/lib/storage'; // This is for localStorage, use `sessionStorage` if needed
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',  // The key for the root of the persisted state
  storage,      // Local storage will be used to store the data
};

const rootReducer = combineReducers({
  user: userReducer,
  business: businessReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable checks for redux-persist
    }),
});

export const persistor = persistStore(store);

