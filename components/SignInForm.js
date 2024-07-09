import React, {useCallback, useEffect, useReducer, useState} from "react";
import {Feather} from "@expo/vector-icons";

import Input from "../components/Input";
import SubmitButton from "../components/SubmitButton";
import {validateInput} from "../utils/actions/formActions";
import {reducer} from "../utils/reducers/formReducer";
import {signIn} from "../utils/actions/authActions";
import {ActivityIndicator, Alert} from "react-native";
import colors from "../constants/colors";
import {useDispatch} from "react-redux";

const isTestMode = true;

const initialState = {
  inputValues: {
    email: isTestMode ? "samaneh@gmail.com" : "",
    password: isTestMode ? "123456" : "",
  },
  inputValidities: {
    email: isTestMode,
    password: isTestMode,
  },
  formIsValid: isTestMode,
};

const SignInForm = props => {
  const dispatch = useDispatch();

  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error);
    }
    // console.log(error);
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);

      const action = signIn(
        formState.inputValues.email,
        formState.inputValues.password
      );

      setError(null);

      await dispatch(action);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  return (
    <>
      <Input
        id="email"
        label="Email"
        icon="mail"
        iconPack={Feather}
        autoCapitalize="none"
        keyboardType="email-address"
        onInputChanged={inputChangeHandler}
        value={formState.inputValues.email}
        errorText={formState.inputValidities["email"]}
      />
      <Input
        id="password"
        label="Password"
        icon="lock"
        iconPack={Feather}
        autoCapitalize="none"
        secureTextEntry
        onInputChanged={inputChangeHandler}
        value={formState.inputValues.password}
        errorText={formState.inputValidities["password"]}
      />
      {isLoading ? (
        <ActivityIndicator
          size={"small"}
          color={colors.primary}
          style={{marginTop: 25}}
        />
      ) : (
        <SubmitButton
          title="Sign in"
          onPress={authHandler}
          style={{marginTop: 20}}
          disabled={!formState.formIsValid}
        />
      )}
    </>
  );
};

export default SignInForm;
