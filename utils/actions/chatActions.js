import {getFirebaseApp} from "../firebaseHelper";
import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {deleteUserChat, getUserChats} from "./userActions";

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

export const sendTextMessage = async (
  chatId,
  senderId,
  messageText,
  replyTo
) => {
  await sendMessage(chatId, senderId, messageText, null, replyTo, null);
};

export const sendInfoMessage = async (chatId, senderId, messageText) => {
  await sendMessage(chatId, senderId, messageText, null, null, "info");
};

export const sendImage = async (chatId, senderId, imageUrl, replyTo) => {
  await sendMessage(chatId, senderId, "Image", imageUrl, replyTo, null);
};

export const updateChatData = async (chatId, userId, chatData) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${chatId}`);

  await update(chatRef, {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  });
};

const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  replyTo,
  type
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const messageRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }
  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }
  if (type) {
    messageData.type = type;
  }

  await push(messageRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const starMessage = async (messageId, chatId, userId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      // starred item exist -> unstar
      // console.log("unstartring");
      await remove(childRef);
    } else {
      // starred item does not exist -> star
      // console.log("starring");
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };

      await set(childRef, starredMessageData);
    }
  } catch (error) {
    console.log(error);
  }
};

export const removeUserFromChat = async (
  userLoggedInData,
  UserToRemoveData,
  chatData
) => {
  const UserToRemoveId = UserToRemoveData.userId;
  const newUsers = chatData.users.filter(uid => uid !== UserToRemoveId);
  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: newUsers,
  });
  // get all the chats of the user that is gonna be removed and delete that gp chat from his/her chat list(userChats node)
  const userChats = getUserChats(UserToRemoveId);

  for (const key in userChats) {
    const currentChatId = userChats[key]; // to get the value(which is the chatId, not the key itself)
    if (currentChatId === chatData.key) {
      await deleteUserChat(UserToRemoveId, key);
      break;
    }
  }

  const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} removed ${UserToRemoveData.firstName} ${UserToRemoveData.lastName} from the chat`;

  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};
