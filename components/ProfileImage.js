import React, {useState} from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {FontAwesome} from "@expo/vector-icons";

import userImage from "../assets/images/userImage.jpeg";
import colors from "../constants/colors";
import {launchImagePicker} from "../utils/imagePickerHelper";

const ProfileImage = props => {
  const source = props.uri ? {uri: props.uri} : userImage;

  const [image, setImage] = useState(source);

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();

      if (!tempUri) return;

      // upload the image

      // set the image
      setImage({uri: tempUri});
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <TouchableOpacity onPress={pickImage}>
      <Image
        source={image}
        style={{...styles.image, ...{width: props.size, height: props.size}}}
      />
      <View style={styles.editIconContainer}>
        <FontAwesome name="pencil" size={15} color="black" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 6,
  },
});

export default ProfileImage;
