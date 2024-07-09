import {getFirebaseApp} from "../firebaseHelper";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {child, getDatabase, set, ref} from "firebase/database";
import {authenticate} from "../../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getUserData} from "./userActions";

export const signUp = (firstName, lastName, email, password) => {
  return async dispatch => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const {uid, stsTokenManager} = result.user;
      const {accessToken, expirationTime} = stsTokenManager;

      const expiryDate = new Date(expirationTime);

      const userData = await createUser(firstName, lastName, email, uid);

      dispatch(authenticate({token: accessToken, userData}));

      saveDataToStorage(accessToken, uid, expiryDate);
    } catch (error) {
      const errorCode = error.code;

      let message = "Something went wrong.";

      if (errorCode === "auth/email-already-in-use") {
        message = "This email is already in use";
      } else if (errorCode === "auth/invalid-password") {
        message = "Invalid password";
      }

      throw new Error(message);
    }
  };
};

export const signIn = (email, password) => {
  return async dispatch => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const {uid, stsTokenManager} = result.user;
      const {accessToken, expirationTime} = stsTokenManager;

      const expiryDate = new Date(expirationTime);

      const userData = await getUserData(uid);

      dispatch(authenticate({token: accessToken, userData}));

      saveDataToStorage(accessToken, uid, expiryDate);
    } catch (error) {
      const errorCode = error.code;

      let message = "Something went wrong.";

      if (errorCode === "auth/email-already-in-use") {
        message = "This email is already in use";
      } else if (errorCode === "auth/invalid-password") {
        message = "Invalid password";
      }

      throw new Error(message);
    }
  };
};

const createUser = async (firstName, lastName, email, userId) => {
  const firstLast = `${firstName} ${lastName}`.toLowerCase();
  //create a user obj to store it into db
  const userData = {
    firstName,
    lastName,
    firstLast,
    email,
    userId,
    signUpDate: new Date().toISOString(),
  };
  // get the reference to our db
  const dbRef = ref(getDatabase());
  // now put the db in the user node
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};

const saveDataToStorage = (token, userId, expiryDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token,
      userId,
      expiryDate: expiryDate.toISOString(),
    })
  );
};

/**
 *  WARN  [2024-07-05T13:44:22.573Z]  @firebase/auth: Auth (10.12.3): 
You are initializing Firebase Auth for React Native without providing
AsyncStorage. Auth state will default to memory persistence and will not
persist between sessions. In order to persist auth state, install the package
"@react-native-async-storage/async-storage" and provide it to
initializeAuth:

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
 */
