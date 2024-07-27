import {createSlice} from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messagesData: {},
    starredMessages: {},
  },
  reducers: {
    setChatMessages: (state, action) => {
      const existingMessages = state.messagesData;

      const {chatId, messagesData} = action.payload;

      existingMessages[chatId] = messagesData;

      state.messagesData = existingMessages;
    },
    addStarredMessages: (state, action) => {
      const {starredMessagesData} = action.payload;
      state.starredMessages[starredMessagesData.messageId] =
        starredMessagesData;
    },
    removeStarredMessages: (state, action) => {
      const {messageId} = action.payload;
      delete state.starredMessages[messageId];
    },
    setStarredMessages: (state, action) => {
      const {starredMessages} = action.payload;
      state.starredMessages = {...starredMessages};
    },
  },
});

export const {
  setChatMessages,
  addStarredMessages,
  removeStarredMessages,
  setStarredMessages,
} = messagesSlice.actions;
export default messagesSlice.reducer;
