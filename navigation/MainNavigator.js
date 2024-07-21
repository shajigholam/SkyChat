import React, {useEffect, useState} from "react";
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
import {ActivityIndicator, View} from "react-native";
import commonStyles from "../constants/commonStyles";
import colors from "../constants/colors";
import {setStoredUsers} from "../store/userSlice";
import {setChatMessages} from "../store/messagesSlice";

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
            headerTitle: "Settings",
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

  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);

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
          // console.log(chatSnapshot.val());
          const data = chatSnapshot.val();
          if (data) {
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
