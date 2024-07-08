import {configureStore} from "@reduxjs/toolkit";
import authSlice from "./authSlice";

// slices are the collections of reducer's logic
export const store = configureStore({
  //contains slices of state
  reducer: {
    auth: authSlice,
  },
});
