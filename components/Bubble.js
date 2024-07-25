import React, {useRef} from "react";
import {StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import colors from "../constants/colors";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import uuid from "react-native-uuid";
import * as Clipboard from "expo-clipboard";

const Bubble = props => {
  const {text, type} = props;

  const bubbleStyle = {...styles.container};
  const textStyle = {...styles.text};
  const wrapperStyle = {...styles.wrapperStyle};

  // useRef is to remember a value and make them exist for the whole life time of the element
  const menuRef = useRef(null);
  const id = useRef(uuid.v4()); // by using useRef the id tha has been generated in the 1st time round, will exist for the whole life time of the message element

  let Container = View;

  switch (type) {
    case "system":
      textStyle.color = "#65644A";
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    case "error":
      bubbleStyle.backgroundColor = colors.red;
      textStyle.color = "white";
      bubbleStyle.marginTop = 10;
      break;
    case "myMessage":
      wrapperStyle.justifyContent = "flex-end";
      bubbleStyle.backgroundColor = "#E7FED6";
      bubbleStyle.maxWidth = "90%";
      Container = TouchableWithoutFeedback;
      break;
    case "theirMessage":
      wrapperStyle.justifyContent = "flex-start";
      bubbleStyle.maxWidth = "90%";
      Container = TouchableWithoutFeedback;

      break;

    default:
      break;
  }

  const copyToClipboard = async text => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() =>
          menuRef.current.props.ctx.menuActions.openMenu(id.current)
        }
        style={{width: "100%"}}
      >
        <View style={bubbleStyle}>
          <Text style={textStyle}>{text}</Text>

          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuOption
                text="Copy to clipboard"
                onSelect={() => copyToClipboard(text)}
              />
              <MenuOption text="option2" />
              <MenuOption text="option3" />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 5,
    marginBottom: 10,
    borderColor: "#E2DACC",
    borderWidth: 1,
  },
  text: {
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
});

export default Bubble;
