import React from "react";
import { useAuth } from "../context/AuthContext";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
  const { token } = useAuth();

  return token ? <AppNavigator /> : <AuthNavigator />;
}
