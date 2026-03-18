/**
 * FILE: src/screens/DashboardScreen.tsx
 * MỤC ĐÍCH: Dashboard - Hiển thị tổng quan chấm công hôm nay
 * - Today Summary (Tổng, Có mặt, Đi muộn, Vắng mặt)
 * - Department Summary (Thống kê theo phòng ban)
 * - Production Line Summary (Thống kê theo dây chuyền)
 * - Real-time updates qua SignalR
 */

import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { dashboardService } from "../service/dashboard.service";
import { attendanceService } from "../service/attendance.service";
import { signalRService } from "../service/signalr.service";
import { useAuth } from "../context/AuthContext";
import {
  DepartmentSummaryDto,
  ProductionLineSummaryDto,
  TodayAttendanceDto,
} from "../types/api.types";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [today, setToday] = useState<TodayAttendanceDto | null>(null);
  const [departments, setDepartments] = useState<DepartmentSummaryDto[]>([]);
  const [productionLines, setProductionLines] = useState<
    ProductionLineSummaryDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();

    // Setup SignalR connection for real-time updates
    if (token) {
      setupSignalR();
    }

    return () => {
      // Cleanup on unmount
      signalRService.disconnect();
    };
  }, [token]);

  const setupSignalR = async () => {
    try {
      await signalRService.connect(token!);

      // Subscribe to attendance updates
      const unsubscribe = signalRService.subscribe(() => {
        console.log("Attendance updated, refreshing dashboard...");
        loadDashboard(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn("SignalR unavailable, fallback to manual refresh");
      // Fallback to polling is not implemented but could be added here
    }
  };

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [todayData, deptData, prodLineData] = await Promise.all([
        dashboardService.getTodayAttendance(),
        dashboardService.getDepartmentSummary(),
        dashboardService.getProductionLineSummary(),
      ]);

      setToday(todayData);
      setDepartments(deptData);
      setProductionLines(prodLineData);
    } catch (error) {
      console.warn("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={styles.titleContainer}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
          </TouchableOpacity>

          <Text style={styles.title}>Dashboard</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadDashboard(false)}
          >
            <LinearGradient
              colors={["#00F2FE", "#4FACFE"]}
              style={styles.refreshGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* TODAY SUMMARY CARD */}
        {today && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <LinearGradient
              colors={["#3B82F6", "#1E40AF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.todayCard}
            >
              <Text style={styles.todayDate}>
                {attendanceService.formatDate(today.date)}
              </Text>

              <View style={styles.statsRow}>
                <StatBox
                  icon="people"
                  label="Tổng NV"
                  value={today.totalEmployees}
                  color="#FFFFFF"
                />
                <StatBox
                  icon="checkmark-circle"
                  label="Có mặt"
                  value={today.present}
                  color="#10B981"
                />
              </View>

              <View style={styles.statsRow}>
                <StatBox
                  icon="time"
                  label="Đi muộn"
                  value={today.late}
                  color="#F59E0B"
                />
                <StatBox
                  icon="close-circle"
                  label="Vắng mặt"
                  value={today.absent}
                  color="#EF4444"
                />
              </View>

              {/* Attendance Rate */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Tỷ lệ có mặt</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          today.totalEmployees > 0
                            ? (today.present / today.totalEmployees) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {today.totalEmployees > 0
                    ? ((today.present / today.totalEmployees) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* DEPARTMENT SUMMARY SECTION */}
        {departments.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="folder" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Thống kê Phòng ban</Text>
              </View>

              {departments.map((dept, idx) => (
                <DepartmentCard key={idx} department={dept} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* PRODUCTION LINE SUMMARY SECTION */}
        {productionLines.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="hammer" size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Thống kê Dây chuyền</Text>
              </View>

              {productionLines.map((line, idx) => (
                <ProductionLineCard key={idx} productionLine={line} />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== COMPONENTS =====

interface StatBoxProps {
  icon: string;
  label: string;
  value: number;
  color: string;
}

function StatBox({ icon, label, value, color }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

interface DepartmentCardProps {
  department: DepartmentSummaryDto;
}

function DepartmentCard({ department }: DepartmentCardProps) {
  const rate =
    department.totalEmployees > 0
      ? (department.present / department.totalEmployees) * 100
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{department.department}</Text>
        <Text style={styles.cardRate}>{rate.toFixed(0)}%</Text>
      </View>

      <View style={styles.miniStatsRow}>
        <MiniStat
          label="Tổng"
          value={department.totalEmployees}
          color="#6B7280"
        />
        <MiniStat label="Có mặt" value={department.present} color="#10B981" />
        <MiniStat label="Đi muộn" value={department.late} color="#F59E0B" />
      </View>

      <View style={styles.miniProgressBar}>
        <View
          style={[
            styles.miniProgressFill,
            {
              width: `${rate}%`,
              backgroundColor:
                rate > 80 ? "#10B981" : rate > 50 ? "#F59E0B" : "#EF4444",
            },
          ]}
        />
      </View>
    </View>
  );
}

interface ProductionLineCardProps {
  productionLine: ProductionLineSummaryDto;
}

function ProductionLineCard({ productionLine }: ProductionLineCardProps) {
  const rate =
    productionLine.totalEmployees > 0
      ? (productionLine.present / productionLine.totalEmployees) * 100
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{productionLine.productionLine}</Text>
        <Text style={styles.cardRate}>{rate.toFixed(0)}%</Text>
      </View>

      <View style={styles.miniStatsRow}>
        <MiniStat
          label="Tổng"
          value={productionLine.totalEmployees}
          color="#6B7280"
        />
        <MiniStat
          label="Có mặt"
          value={productionLine.present}
          color="#10B981"
        />
        <MiniStat label="Đi muộn" value={productionLine.late} color="#F59E0B" />
      </View>

      <View style={styles.miniProgressBar}>
        <View
          style={[
            styles.miniProgressFill,
            {
              width: `${rate}%`,
              backgroundColor:
                rate > 80 ? "#10B981" : rate > 50 ? "#F59E0B" : "#EF4444",
            },
          ]}
        />
      </View>
    </View>
  );
}

interface MiniStatProps {
  label: string;
  value: number;
  color: string;
}

function MiniStat({ label, value, color }: MiniStatProps) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },

  // HEADER
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#F3F4F6",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  refreshButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    overflow: "hidden",
  },
  refreshGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // TODAY CARD
  todayCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  todayDate: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },

  // PROGRESS BAR
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },

  // SECTIONS
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },

  // CARDS
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardRate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
  },

  miniStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  miniStat: {
    alignItems: "center",
  },
  miniStatLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  miniProgressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
