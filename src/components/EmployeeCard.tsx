import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { Employee } from "../types/api.types";

interface EmployeeCardProps {
  employee: Employee;
  onPress?: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onPress }: EmployeeCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(employee)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{employee.fullName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: employee.isActive ? "#4CAF50" : "#9E9E9E" },
          ]}
        >
          <Text style={styles.statusText}>
            {employee.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <Text style={styles.code}>EmployeeCode: {employee.employeeCode}</Text>

      {employee.email && <Text style={styles.info}>📧 {employee.email}</Text>}

      {employee.phoneNumber && (
        <Text style={styles.info}>📱 {employee.phoneNumber}</Text>
      )}

      <Text style={styles.info}>
        🗓️ Hire date: {new Date(employee.hireDate).toLocaleDateString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  code: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: colors.subText,
    marginTop: 4,
  },
});
