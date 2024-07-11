import React, {useState} from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {FontAwesome} from "@expo/vector-icons";

import userImage from "../assets/images/userImage.jpeg";
import colors from "../constants/colors";
import {launchImagePicker, uploadImageAync} from "../utils/imagePickerHelper";

const ProfileImage = props => {
  const source = props.uri ? {uri: props.uri} : userImage;

  const [image, setImage] = useState(source);

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();
      //console.log(tempUri);

      if (!tempUri) return;

      // upload the image
      const uploadUrl = await uploadImageAync(tempUri);
      console.log(uploadUrl);

      if (!uploadUrl) {
        throw new Error("Could not upload image");
      }

      // set the image
      setImage({uri: uploadUrl});
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
