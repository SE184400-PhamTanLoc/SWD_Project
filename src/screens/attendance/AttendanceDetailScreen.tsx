/**
 * FILE: src/screens/AttendanceDetailScreen.tsx
 * MỤC ĐÍCH: Hiển thị chi tiết một bản ghi chấm công
 * - Employee info, work date, check-in/out times
 * - Status, late minutes, total hours
 * - Source (Face Recognition, IoT, Manual), confidence score
 */

import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { attendanceService } from "../service/attendance.service";
import { AttendanceDetailDto } from "../types/api.types";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "AttendanceDetail">;

export function AttendanceDetailScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const [detail, setDetail] = useState<AttendanceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceDetail();

    // Set header title
    if (detail?.employeeName) {
      navigation.setOptions({
        title: detail.employeeName,
      });
    }
  }, []);

  const loadAttendanceDetail = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceDetail(recordId);
      setDetail(data);
      navigation.setOptions({ title: data.employeeName });
    } catch (error) {
      console.error("Failed to load attendance detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy dữ liệu</Text>
      </View>
    );
  }

  const statusColor = attendanceService.getStatusColor(detail.status);
  const statusLabel = attendanceService.getStatusLabel(detail.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* STATUS HEADER */}
        <Animated.View entering={FadeInUp}>
          <LinearGradient
            colors={[statusColor, statusColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusHeader}
          >
            <View style={styles.statusBadge}>
              <Ionicons
                name={getStatusIcon(detail.status)}
                size={40}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.statusText}>{statusLabel}</Text>
            <Text style={styles.workDateText}>
              {attendanceService.formatDate(detail.workDate)}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* EMPLOYEE INFO */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <InfoSection title="Thông tin nhân viên">
            <InfoRow label="Tên nhân viên" value={detail.employeeName} />
          </InfoSection>
        </Animated.View>

        {/* CHECK-IN/OUT TIMES */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <InfoSection title="Thời gian">
            <InfoRow
              label="Giờ vào"
              value={attendanceService.formatTime(detail.checkInTime)}
              icon="log-in"
              color="#10B981"
            />
            {detail.checkOutTime ? (
              <InfoRow
                label="Giờ ra"
                value={attendanceService.formatTime(detail.checkOutTime)}
                icon="log-out"
                color="#3B82F6"
              />
            ) : (
              <InfoRow
                label="Giờ ra"
                value="Chưa quẹt ra"
                icon="time"
                color="#F59E0B"
              />
            )}
            <InfoRow
              label="Tổng giờ làm"
              value={`${detail.totalHours.toFixed(1)} giờ`}
              icon="checkmark-circle"
              color="#8B5CF6"
            />
          </InfoSection>
        </Animated.View>

        {/* ATTENDANCE METRICS */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <InfoSection title="Chi tiết">
            {detail.lateMinutes > 0 && (
              <InfoRow
                label="Đi muộn"
                value={`${detail.lateMinutes} phút`}
                icon="warning"
                color="#F59E0B"
              />
            )}
            <InfoRow
              label="Nguồn"
              value={getSourceLabel(detail.source)}
              icon="camera"
              color="#6B7280"
            />
            {detail.confidenceScore !== undefined && (
              <InfoRow
                label="Độ chính xác"
                value={`${(detail.confidenceScore * 100).toFixed(1)}%`}
                icon="shield-checkmark"
                color="#10B981"
              />
            )}
          </InfoSection>
        </Animated.View>

        {/* EXTRAS */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== COMPONENTS & HELPERS =====

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

function InfoRow({ label, value, icon, color = "#6B7280" }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={18}
          color={color}
          style={styles.infoIcon}
        />
      )}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getStatusIcon(
  status: "Present" | "Late" | "Absent" | "ExceptionPending",
): any {
  switch (status) {
    case "Present":
      return "checkmark-circle";
    case "Late":
      return "warning";
    case "Absent":
      return "close-circle";
    case "ExceptionPending":
      return "help-circle";
    default:
      return "help-circle";
  }
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    FaceRecognition: "Nhận diện khuôn mặt",
    IoTDevice: "Thiết bị IoT",
    Manual: "Nhập thủ công",
  };
  return labels[source] || source;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },

  // STATUS HEADER
  statusHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusBadge: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  workDateText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },

  // SECTIONS
  section: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },

  // INFO ROW
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  spacer: {
    height: 16,
  },
});
