import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>You are logged in 🎉</Text>
        <Text style={styles.cardText}>
          Welcome back, {user?.fullName || user?.username || "User"}!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.employeeBtn}
        onPress={() => navigation.navigate("EmployeeList")}
      >
        <Text style={styles.employeeBtnText}>👥 Employee List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00B8D4",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#00B8D4",
  },
  cardText: {
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
  },
  employeeBtn: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  employeeBtnText: {
    color: "#00B8D4",
    fontWeight: "700",
    fontSize: 18,
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
