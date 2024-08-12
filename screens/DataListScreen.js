import React, {useEffect} from "react";
import {Text} from "react-native";

const DataListScreen = props => {
  const {title, data, type, chatId} = props.route.params;

  useEffect(() => {
    props.navigation.setOptions({headerTitle: title});
  }, [title]);

  return <Text>data list screen</Text>;
};

export default DataListScreen;
