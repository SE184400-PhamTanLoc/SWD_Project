import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { logout, user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.fullName || user?.username || "Admin"}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
              <LinearGradient
                colors={["#4FACFE", "#00F2FE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Ionicons name="person" size={24} color="white" />
              </LinearGradient>
              <View style={styles.onlineStatus} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.mainStatsContainer}>
            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(79, 172, 254, 0.1)" }]}>
                <Ionicons name="people" size={20} color="#4FACFE" />
              </View>
              <View>
                <Text style={styles.statValue}>124</Text>
                <Text style={styles.statName}>Employees</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(0, 242, 254, 0.1)" }]}>
                <Ionicons name="checkmark-circle" size={20} color="#00F2FE" />
              </View>
              <View>
                <Text style={styles.statValue}>82%</Text>
                <Text style={styles.statName}>Attendance</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Command Center</Text>
            <Text style={styles.sectionSubtitle}>Select an operation to begin</Text>
          </View>

          <View style={styles.menuGrid}>
            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.menuItemWrapper}>
              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => navigation.navigate("EmployeeList")}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["rgba(79, 172, 254, 0.15)", "rgba(79, 172, 254, 0.05)"]}
                  style={styles.menuIconContainer}
                >
                  <Ionicons name="people-outline" size={32} color="#4FACFE" />
                </LinearGradient>
                <Text style={styles.menuTitle}>Employees</Text>
                <Text style={styles.menuDesc}>Registry Operations</Text>
                <Ionicons name="arrow-forward" size={16} color="#4FACFE" style={styles.cardArrow} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.menuItemWrapper}>
              <TouchableOpacity style={styles.menuCard} activeOpacity={0.9}>
                <LinearGradient
                  colors={["rgba(0, 242, 254, 0.15)", "rgba(0, 242, 254, 0.05)"]}
                  style={styles.menuIconContainer}
                >
                  <Ionicons name="calendar-outline" size={32} color="#00F2FE" />
                </LinearGradient>
                <Text style={styles.menuTitle}>Attendance</Text>
                <Text style={styles.menuDesc}>Reporting Suite</Text>
                <Ionicons name="arrow-forward" size={16} color="#00F2FE" style={styles.cardArrow} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.menuItemWrapper}>
              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => navigation.navigate("IoTDeviceList")}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["rgba(75, 121, 161, 0.15)", "rgba(75, 121, 161, 0.05)"]}
                  style={styles.menuIconContainer}
                >
                  <Ionicons name="hardware-chip-outline" size={32} color="#4B79A1" />
                </LinearGradient>
                <Text style={styles.menuTitle}>IoT Nodes</Text>
                <Text style={styles.menuDesc}>System Hardware</Text>
                <Ionicons name="arrow-forward" size={16} color="#4B79A1" style={styles.cardArrow} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.menuItemWrapper}>
              <TouchableOpacity style={styles.menuCard} onPress={logout} activeOpacity={0.9}>
                <LinearGradient
                  colors={["rgba(255, 77, 77, 0.15)", "rgba(255, 77, 77, 0.05)"]}
                  style={styles.menuIconContainer}
                >
                  <Ionicons name="log-out-outline" size={32} color="#FF4D4D" />
                </LinearGradient>
                <Text style={styles.menuTitle}>Logout</Text>
                <Text style={styles.menuDesc}>Secure Exit</Text>
                <Ionicons name="power-outline" size={16} color="#FF4D4D" style={styles.cardArrow} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
  },
  greetingText: {
    color: "#999",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  userName: {
    color: "#1A1A1A",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 2,
  },
  profileButton: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4FACFE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  onlineStatus: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00E676",
    borderWidth: 2.5,
    borderColor: "white",
  },
  mainStatsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statName: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItemWrapper: {
    width: "47.5%",
    marginBottom: 18,
  },
  menuCard: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  menuIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  menuTitle: {
    color: "#1A1A1A",
    fontSize: 17,
    fontWeight: "bold",
  },
  menuDesc: {
    color: "#999",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardArrow: {
    position: "absolute",
    top: 22,
    right: 22,
    opacity: 0.6,
  },
});
