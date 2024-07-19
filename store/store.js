import {configureStore} from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import chatSlice from "./chatSlice";

// slices are the collections of reducer's logic
export const store = configureStore({
  //contains slices of state
  reducer: {
    auth: authSlice,
    users: userSlice,
    chats: chatSlice,
  },
});
