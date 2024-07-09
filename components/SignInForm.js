import React, {useCallback, useEffect, useReducer, useState} from "react";
import {Feather} from "@expo/vector-icons";

import Input from "../components/Input";
import SubmitButton from "../components/SubmitButton";
import {validateInput} from "../utils/actions/formActions";
import {reducer} from "../utils/reducers/formReducer";
import {signIn} from "../utils/actions/authActions";
import {Alert} from "react-native";
import {useDispatch} from "react-redux";

const initialState = {
  inputValues: {
    email: "",
    password: "",
  },
  inputValidities: {
    email: false,
    password: false,
  },
  formIsValid: false,
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
      dispatch(action);

      setError(null);
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
        errorText={formState.inputValidities["password"]}
      />
      <SubmitButton
        title="Sign in"
        onPress={authHandler}
        style={{marginTop: 20}}
        disabled={!formState.formIsValid}
      />
    </>
  );
};

export default SignInForm;
