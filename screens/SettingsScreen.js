import react from "react";
import {View, Text, StyleSheet} from "react-native";
import PageTitle from "../components/PageTitle";
import PageContainer from "../components/PageContainer";

const SettingScreen = props => {
  return (
    <PageContainer style={styles.container}>
      <PageTitle text="Settings" />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingScreen;
