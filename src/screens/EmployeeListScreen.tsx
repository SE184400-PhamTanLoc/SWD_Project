import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import EmployeeCard from "../components/EmployeeCard";
import { AppStackParamList } from "../navigation/AppNavigator";
import { employeeService } from "../service/employee.service";
import { colors } from "../theme/colors";
import { Employee } from "../types/api.types";

type Props = NativeStackScreenProps<AppStackParamList, "EmployeeList">;

export default function EmployeeListScreen({ navigation }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined,
  );

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    onConfirm: undefined as (() => void) | undefined,
  });

  const loadEmployees = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const params =
        filterActive !== undefined ? { isActive: filterActive } : undefined;
      const data = await employeeService.getEmployees(params);

      setEmployees(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load employee list";
      setAlert({
        visible: true,
        title: "Error",
        message: errorMessage,
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees(false);
  };

  useEffect(() => {
    loadEmployees();
  }, [filterActive]);

  const handleEmployeePress = (employee: Employee) => {
    setAlert({
      visible: true,
      title: employee.fullName,
      message: `Employee Code: ${employee.employeeCode}\nEmail: ${employee.email || "N/A"}\nPhone: ${employee.phoneNumber || "N/A"}`,
      type: "info",
      onConfirm: undefined,
    });
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterActive === undefined && styles.filterButtonActive,
        ]}
        onPress={() => setFilterActive(undefined)}
      >
        <Text
          style={[
            styles.filterButtonText,
            filterActive === undefined && styles.filterButtonTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          filterActive === true && styles.filterButtonActive,
        ]}
        onPress={() => setFilterActive(true)}
      >
        <Text
          style={[
            styles.filterButtonText,
            filterActive === true && styles.filterButtonTextActive,
          ]}
        >
          Active
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          filterActive === false && styles.filterButtonActive,
        ]}
        onPress={() => setFilterActive(false)}
      >
        <Text
          style={[
            styles.filterButtonText,
            filterActive === false && styles.filterButtonTextActive,
          ]}
        >
          Inactive
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (employees.length === 0) {
    return (
      <View style={styles.container}>
        {renderFilterButtons()}
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No employees found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadEmployees()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>

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

  return (
    <View style={styles.container}>
      {renderFilterButtons()}

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EmployeeCard employee={item} onPress={handleEmployeePress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

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
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.subText,
  },
  emptyText: {
    fontSize: 16,
    color: colors.subText,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.subText,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
});
