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
import { useAuth } from "../context/AuthContext";
import { authService } from "../service/auth.service";
import { colors } from "../theme/colors";
import { AuthStackParamList } from "../types/AuthParam";
import { Login } from "../types/api.types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();

  const [data, setData] = useState<Login>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
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

  const handleInputChange = (field: keyof Login, value: string) => {
    setData({ ...data, [field]: value });
    if (touched && errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = (formData: Login) => {
    let newErrors = {
      username: "",
      password: "",
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

    setErrors(newErrors);
    return isValid;
  };

  const onLogin = async () => {
    setTouched(true);

    const trimmedData = {
      username: data.username.trim(),
      password: data.password.trim(),
    };

    if (validateForm(trimmedData)) {
      setLoading(true);
      try {
        const response = await authService.login(trimmedData);

        login(response.token, {
          username: response.user.username,
          fullName: response.user.fullName,
        });

        setAlert({
          visible: true,
          title: "Success",
          message: `Welcome back, ${response.user.username}!`,
          type: "success",
          onConfirm: undefined,
        });
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Invalid username or password";
        setAlert({
          visible: true,
          title: "Login Failed",
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
      <Text style={styles.title}>Welcome back 👋</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => navigation.replace("Register")}
        >
          Register
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
    color: "#0066FF",
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
    color: "#FFFFFF",
    fontSize: 15,
  },
  link: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
