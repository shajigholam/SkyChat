import {getFirebaseApp} from "../firebaseHelper";
import {child, getDatabase, push, ref} from "firebase/database";

export const createChat = async (loggedInUserId, chatData) => {
  // got the new chat data
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // added to the db
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const newChat = await push(child(dbRef, "chats"), newChatData);
  // in the above when we push sth, firebase will automatically generates an id for it,and it will be in the key property

  // adding one entry for every single user in the userChats node
  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }

  return newChat.key;
};
