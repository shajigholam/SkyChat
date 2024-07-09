import react, {useCallback, useReducer} from "react";
import {View, Text, StyleSheet} from "react-native";
import PageTitle from "../components/PageTitle";
import PageContainer from "../components/PageContainer";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {validateInput} from "../utils/actions/formActions";
import {reducer} from "../utils/reducers/formReducer";
import Input from "../components/Input";
import {useSelector} from "react-redux";

const initialState = {
  inputValues: {
    firstName: "",
    lastName: "",
    email: "",
    about: "",
  },
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    about: false,
  },
  formIsValid: false,
};

const SettingScreen = props => {
  const userData = useSelector(state => state.auth.userData);

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({
        inputId: inputId,
        validationResult: result,
        inputValue: inputValue,
      });
    },
    [dispatchFormState]
  );

  return (
    <PageContainer style={styles.container}>
      <PageTitle text="Settings" />

      <Input
        id="firstName"
        label="First name"
        icon="user-o"
        iconPack={FontAwesome}
        onInputChanged={inputChangeHandler}
        errorText={formState.inputValidities["firstName"]}
        initialValue={userData.firstName}
      />
      <Input
        id="lastName"
        label="Last name"
        icon="user-o"
        iconPack={FontAwesome}
        onInputChanged={inputChangeHandler}
        errorText={formState.inputValidities["lastName"]}
        initialValue={userData.lastName}
      />
      <Input
        id="email"
        label="Email"
        icon="mail"
        iconPack={Feather}
        autoCapitalize="none"
        keyboardType="email-address"
        onInputChanged={inputChangeHandler}
        errorText={formState.inputValidities["email"]}
        initialValue={userData.email}
      />
      <Input
        id="about"
        label="About"
        icon="question-circle-o"
        iconPack={FontAwesome}
        onInputChanged={inputChangeHandler}
        errorText={formState.inputValidities["about"]}
        initialValue={userData.about}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingScreen;
