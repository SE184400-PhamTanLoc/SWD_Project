import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import { authService } from "../service/auth.service";
import { colors } from "../theme/colors";
import { AuthStackParamList } from "../types/AuthParam";
import { Register } from "../types/api.types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [data, setData] = useState<Register>({
    username: "",
    password: "",
    confirmPassword: "",
    roleId: 4, // Default to Employee
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    onConfirm: undefined as (() => void) | undefined,
  });

  const handleInputChange = (field: keyof Register, value: string | number) => {
    setData({ ...data, [field]: value });
    if (touched && field !== "roleId" && errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field as keyof typeof errors]: "" });
    }
  };

  const validateForm = (formData: Register) => {
    let newErrors = {
      username: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (formData.username.trim() === "") {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (formData.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onRegister = async () => {
    setTouched(true);
    const trimmedData = {
      username: data.username.trim(),
      password: data.password.trim(),
      confirmPassword: data.confirmPassword.trim(),
      roleId: data.roleId,
    };

    if (validateForm(trimmedData)) {
      setLoading(true);
      try {
        const response = await authService.register(trimmedData);

        if (response.success) {
          setAlert({
            visible: true,
            title: "Success",
            message: response.message || "Registration successful!",
            type: "success",
            onConfirm: () => navigation.replace("Login"),
          });
        } else {
          setAlert({
            visible: true,
            title: "Registration Failed",
            message: response.message,
            type: "error",
            onConfirm: undefined,
          });
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred during registration";
        setAlert({
          visible: true,
          title: "Error",
          message: errorMessage,
          type: "error",
          onConfirm: undefined,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account ✨</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <TextInput
        placeholder="Username"
        value={data.username}
        onChangeText={(text) => handleInputChange("username", text)}
        autoCapitalize="none"
        placeholderTextColor={colors.subText}
        style={styles.input}
      />
      {errors.username ? (
        <Text style={styles.errorText}>{errors.username}</Text>
      ) : null}

      <TextInput
        placeholder="Password"
        value={data.password}
        onChangeText={(text) => handleInputChange("password", text)}
        placeholderTextColor={colors.subText}
        secureTextEntry
        style={styles.input}
      />
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      <TextInput
        placeholder="Confirm password"
        value={data.confirmPassword}
        onChangeText={(text) => handleInputChange("confirmPassword", text)}
        placeholderTextColor={colors.subText}
        secureTextEntry
        style={styles.input}
      />
      {errors.confirmPassword ? (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => {
            navigation.replace("Login");
          }}
        >
          Login
        </Text>
      </Text>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00B8D4",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCFBFF",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 0,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },
  button: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#00B8D4",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    color: "#FFE5E5",
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
    padding: 8,
    borderRadius: 8,
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#CCFBFF",
    fontSize: 15,
  },
  link: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
