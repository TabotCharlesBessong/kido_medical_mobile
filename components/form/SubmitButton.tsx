import React, { FC } from "react";
import { StyleSheet } from "react-native";
import AppButton from "../ui/AppButton";

interface SubmitButtonProps {
  title: string;
}

const SubmitButton: FC<SubmitButtonProps> = ({ title }) => {
  return <AppButton onPress={() => {}} title={title} />;
};

export default SubmitButton;

const styles = StyleSheet.create({});
