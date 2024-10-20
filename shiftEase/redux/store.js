import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';
import businessReducer from './reducers/businessReducer';

export const store = configureStore({
    reducer: {
      user: userReducer, // Combine reducers here
      business: businessReducer,
    },
});

