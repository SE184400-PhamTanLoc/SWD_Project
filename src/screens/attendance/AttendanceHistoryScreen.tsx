/**
 * FILE: src/screens/AttendanceHistoryScreen.tsx
 * MỤC ĐÍCH: Hiển thị danh sách lịch sử chấm công
 * - Pagination support
 * - Filter by date range, employee, department, production line
 * - Real-time updates qua SignalR
 * - Navigate to detail by tapping row
 */

import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { attendanceService } from "../service/attendance.service";
import {
  AttendanceHistoryDto,
  AttendanceQueryParams,
} from "../types/api.types";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "AttendanceHistory">;

export function AttendanceHistoryScreen({ navigation, route }: Props) {
  const [historicalRecords, setHistoricalRecords] = useState<
    AttendanceHistoryDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );

  // Cấu hình filter từ route params (nếu có)
  const preFilters = route.params;

  useEffect(() => {
    loadAttendanceHistory();
  }, [pageNumber, filterStatus]);

  const loadAttendanceHistory = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const params: AttendanceQueryParams = {
        pageNumber,
        pageSize,
        ...preFilters,
      };

      const response = await attendanceService.getAttendanceHistory(params);
      setHistoricalRecords(response.data);
      setTotalRecords(response.totalRecords);
    } catch (error) {
      console.error("Failed to load attendance history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPageNumber(1);
    loadAttendanceHistory(false);
  };

  const handleEndReached = () => {
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const filteredData = historicalRecords.filter((item) =>
    searchQuery === ""
      ? true
      : item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAttendanceSelect = (record: AttendanceHistoryDto) => {
    navigation.navigate("AttendanceDetail", { recordId: record.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SEARCH & FILTER HEADER */}
      <LinearGradient
        colors={["#3B82F6", "#1E40AF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên nhân viên..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* STATUS FILTER PILLS */}
        <View style={styles.filterPills}>
          {["Present", "Late", "Absent", "ExceptionPending"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() =>
                setFilterStatus(filterStatus === status ? undefined : status)
              }
              style={[
                styles.pill,
                filterStatus === status && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  filterStatus === status && styles.pillTextActive,
                ]}
              >
                {attendanceService.getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ATTENDANCE LIST */}
      {loading && pageNumber === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AttendanceHistoryItem
              item={item}
              onPress={() => handleAttendanceSelect(item)}
            />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loading && pageNumber > 1 ? (
              <ActivityIndicator
                size="small"
                color="#3B82F6"
                style={styles.footerLoader}
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* PAGINATION INFO */}
      <View style={styles.paginationFooter}>
        <Text style={styles.paginationText}>
          {filteredData.length > 0
            ? `Trang ${pageNumber} • Tổng: ${totalRecords}`
            : ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ===== COMPONENTS =====

interface AttendanceHistoryItemProps {
  item: AttendanceHistoryDto;
  onPress: () => void;
}

function AttendanceHistoryItem({ item, onPress }: AttendanceHistoryItemProps) {
  const statusColor = attendanceService.getStatusColor(item.status);
  const statusLabel = attendanceService.getStatusLabel(item.status);
  const checkInTime = attendanceService.formatTime(item.checkInTime);

  return (
    <Animated.View entering={FadeInDown.delay(100)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.attendanceCard}>
          {/* LEFT: STATUS BADGE */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusColor === "#FFFFFF" ? "#1F2937" : "#FFFFFF" },
              ]}
            >
              {statusLabel.charAt(0)}
            </Text>
          </View>

          {/* MIDDLE: INFO */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.employeeName}</Text>
            <Text style={styles.cardSubtitle}>{item.department}</Text>
            <Text style={styles.cardTime}>{checkInTime}</Text>
          </View>

          {/* RIGHT: STATUS & ARROW */}
          <View style={styles.cardRight}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#D1D5DB"
              style={styles.arrow}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  // HEADER
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  clearButton: {
    padding: 4,
  },

  // FILTER PILLS
  filterPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  pillActive: {
    backgroundColor: "#FFFFFF",
  },
  pillText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#3B82F6",
  },

  // CONTENT
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // ATTENDANCE CARD
  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  cardTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  cardRight: {
    alignItems: "flex-end",
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  arrow: {
    marginTop: 2,
  },

  // FOOTER
  footerLoader: {
    marginVertical: 16,
  },
  paginationFooter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  paginationText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
