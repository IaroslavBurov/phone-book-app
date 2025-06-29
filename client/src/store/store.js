import { configureStore } from '@reduxjs/toolkit';
import phoneReducer from './phoneSlice';

export default configureStore({
  reducer: {
    phoneBook: phoneReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});