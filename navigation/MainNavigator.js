import React, {useEffect} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import ChatListScreen from "../screens/ChatListScreen";
import ChatSettingScreen from "../screens/ChatSettingScreen";
import SettingScreen from "../screens/SettingsScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import {useSelector} from "react-redux";
import {getFirebaseApp} from "../utils/firebaseHelper";
import {child, getDatabase, off, onValue, ref} from "firebase/database";

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
      const chatIds = Object.values(chatIdsData); // just the val

      console.log(chatIds);
    });

    return () => {
      console.log("Unsubscribing firebase listeners");
      refs.forEach(ref => off(ref));
    };
  }, []);

  return <StackNavigator />;
};

export default MainNavigator;
