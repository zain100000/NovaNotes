/**
 * @file store.store.jsx
 * @module Redux/store
 * @description Redux store configuration with persistence for user authentication state.
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import noteReducer from '../slices/note.slices';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['note'],
};

const rootReducer = combineReducers({
  note: noteReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for Redux Persist
    }),
});

const persistor = persistStore(store);

export { store, persistor };
