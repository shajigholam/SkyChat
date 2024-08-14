import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import React, {useEffect, useRef, useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import ChatListScreen from "../screens/ChatListScreen";
import ChatSettingScreen from "../screens/ChatSettingScreen";
import SettingScreen from "../screens/SettingsScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import {useDispatch, useSelector} from "react-redux";
import {getFirebaseApp} from "../utils/firebaseHelper";
import {child, get, getDatabase, off, onValue, ref} from "firebase/database";
import {setChatsData} from "../store/chatSlice";
import {ActivityIndicator, Platform, View} from "react-native";
import commonStyles from "../constants/commonStyles";
import colors from "../constants/colors";
import {setStoredUsers} from "../store/userSlice";
import {setChatMessages, setStarredMessages} from "../store/messagesSlice";
import ContactScreen from "../screens/ContactScreen";
import DataListScreen from "../screens/DataListScreen";
import {StackActions, useNavigation} from "@react-navigation/native";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{headerTitle: "", headerShadowVisible: false}}
    >
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({color, size}) => {
            return (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({color, size}) => {
            return (
              <Ionicons name="settings-outline" size={size} color={color} />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerBackTitle: "Back",
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="ChatSetting"
          component={ChatSettingScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{
            headerTitle: "Contact info",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Group>

      <Stack.Group screenOptions={{presentation: "modal"}}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const MainNavigator = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);

  const [expoPushToken, setExpoPushToken] = useState("");
  // console.log(expoPushToken);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        // handle received notification
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        // console.log("Notification tapped:");
        // console.log(response);
        const {data} = response.notification.request.content;
        const chatId = data["chatId"];
        if (chatId) {
          const pushAction = StackActions.push("ChatScreen", {chatId});
          navigation.dispatch(pushAction);
        } else {
          console.log("No chat id sent with notification");
        }
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    console.log("Subscribing to firebase listeners");
    // once the app loads retrieve the chats that the user is part of
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userChatRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [userChatRef];

    onValue(userChatRef, querySnapshot => {
      // console.log(querySnapshot.val());
      const chatIdsData = querySnapshot.val() || {}; //with the keys
      const chatIds = Object.values(chatIdsData); // just the vals of yuor chatids

      const chatsData = {};
      let chatsFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);
        refs.push(chatRef);
        //onValue listens for changes while get execute one time
        onValue(chatRef, chatSnapshot => {
          chatsFoundCount++;

          const data = chatSnapshot.val();
          if (data && data.users.includes(userData.userId)) {
            // if you are not part of the gp chat anymore just return and doesn't show the chat gp in the chat list
            // if (!data.users.includes(userData.userId)) return;
            data.key = chatSnapshot.key; //adding a key prop(chat id) to data

            data.users.forEach(userId => {
              if (storedUsers[userId]) return;

              const userRef = child(dbRef, `users/${userId}`);

              get(userRef).then(userSnapshot => {
                const userSnapshotData = userSnapshot.val();
                dispatch(setStoredUsers({newUsers: {userSnapshotData}}));
              });
              refs.push(userRef);
            });

            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setChatsData({chatsData}));
            setIsLoading(false);
          }
        });

        const messagesRef = child(dbRef, `messages/${chatId}`);
        refs.push(messagesRef);

        onValue(messagesRef, messagesSnapshot => {
          const messagesData = messagesSnapshot.val();
          dispatch(setChatMessages({chatId, messagesData}));
        });

        if (chatsFoundCount == 0) {
          setIsLoading(false);
        }
      }
      // console.log(chatIds);
    });

    const userStarredMessagesRef = child(
      dbRef,
      `userStarredMessages/${userData.userId}`
    );
    refs.push(userStarredMessagesRef);
    onValue(userStarredMessagesRef, querySnapshot => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessages({starredMessages}));
    });

    return () => {
      console.log("Unsubscribing firebase listeners");
      refs.forEach(ref => off(ref));
    };
  }, []);

  if (isLoading) {
    <View style={commonStyles.center}>
      <ActivityIndicator size={"large"} color={colors.primary} />
    </View>;
  }

  return <StackNavigator />;
};

export default MainNavigator;

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

// in case

// useEffect(() => {
//   console.log("Subscribing to firebase listeners");

//   const app = getFirebaseApp();
//   const dbRef = ref(getDatabase(app));
//   const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
//   const refs = [userChatsRef];

//   onValue(userChatsRef, querySnapshot => {
//     const chatIdsData = querySnapshot.val() || {};
//     const chatIds = Object.values(chatIdsData);

//     const chatsData = {};
//     let chatsFoundCount = 0;

//     chatIds.forEach((chatId, index) => {
//       const chatRef = child(dbRef, `chats/${chatId}`);
//       refs.push(chatRef);

//       onValue(chatRef, chatSnapshot => {
//         const data = chatSnapshot.val();

//         if (data && data.users.includes(userData.userId)) {
//           data.key = chatSnapshot.key;

//           data.users.forEach(userId => {
//             if (!storedUsers[userId]) {
//               const userRef = child(dbRef, `users/${userId}`);
//               get(userRef).then(userSnapshot => {
//                 const userSnapshotData = userSnapshot.val();
//                 dispatch(
//                   setStoredUsers({newUsers: {[userId]: userSnapshotData}})
//                 );
//               });
//               refs.push(userRef);
//             }
//           });

//           chatsData[chatSnapshot.key] = data;
//         }

//         chatsFoundCount++;

//         if (chatsFoundCount >= chatIds.length) {
//           dispatch(setChatsData({chatsData}));
//           setIsLoading(false);
//         }
//       });

//       const messagesRef = child(dbRef, `messages/${chatId}`);
//       refs.push(messagesRef);

//       onValue(messagesRef, messagesSnapshot => {
//         const messagesData = messagesSnapshot.val();
//         dispatch(setChatMessages({chatId, messagesData}));
//       });
//     });

//     if (chatIds.length === 0) {
//       setIsLoading(false);
//     }
//   });

//   const userStarredMessagesRef = child(
//     dbRef,
//     `userStarredMessages/${userData.userId}`
//   );
//   refs.push(userStarredMessagesRef);
//   onValue(userStarredMessagesRef, querySnapshot => {
//     const starredMessages = querySnapshot.val() ?? {};
//     dispatch(setStarredMessages({starredMessages}));
//   });

//   return () => {
//     console.log("Unsubscribing firebase listeners");
//     refs.forEach(ref => off(ref));
//   };
// }, []);
