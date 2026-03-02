import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import CustomAlert from "../components/CustomAlert";
import { employeeService } from "../service/employee.service";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "AddEmployee">;

export function AddEmployeeScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        employeeCode: "",
        email: "",
        phoneNumber: "",
        identityNumber: "",
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString().split("T")[0],
        hireDate: new Date().toISOString().split("T")[0],
        isActive: true,
        departmentId: "1",
    });

    const [alert, setAlert] = useState({
        visible: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
        onConfirm: undefined as (() => void) | undefined,
    });

    const handleInputChange = (field: string, value: any) => {
        setForm({ ...form, [field]: value });
    };

    const onSave = async () => {
        if (!form.fullName || !form.employeeCode) {
            setAlert({
                visible: true,
                title: "Validation Error",
                message: "Full Name and Employee Code are required",
                type: "error",
                onConfirm: undefined,
            });
            return;
        }

        setLoading(true);
        try {
            const dataToSave = {
                ...form,
                departmentId: parseInt(form.departmentId) || 1,
                dateOfBirth: new Date(form.dateOfBirth).toISOString(),
                hireDate: new Date(form.hireDate).toISOString(),
            };
            await employeeService.createEmployee(dataToSave as any);
            setAlert({
                visible: true,
                title: "Success",
                message: "Employee created successfully!",
                type: "success",
                onConfirm: () => navigation.goBack(),
            });
        } catch (error: any) {
            let message = error.message || "Failed to create employee";
            let title = "Error";

            if (error.response?.status === 403) {
                title = "Permission Denied";
                message = "Your account does not have permission (Admin/HR) to create employees.";
            }

            setAlert({
                visible: true,
                title: title,
                message: message,
                type: "error",
                onConfirm: undefined,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.flex}
                >
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.title}>New Employee</Text>
                        <View style={{ width: 28 }} />
                    </Animated.View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter full name"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.fullName}
                                        onChangeText={(v) => handleInputChange("fullName", v)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Employee Code *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="barcode-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="EMP001"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.employeeCode}
                                        onChangeText={(v) => handleInputChange("employeeCode", v)}
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Identity Number (CCCD/CMND)</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="card-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter identity number"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.identityNumber}
                                        onChangeText={(v) => handleInputChange("identityNumber", v)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            placeholder="1990-01-01"
                                            placeholderTextColor="#999"
                                            style={styles.input}
                                            value={form.dateOfBirth}
                                            onChangeText={(v) => handleInputChange("dateOfBirth", v)}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Hire Date (YYYY-MM-DD)</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            placeholder="2024-01-01"
                                            placeholderTextColor="#999"
                                            style={styles.input}
                                            value={form.hireDate}
                                            onChangeText={(v) => handleInputChange("hireDate", v)}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department ID</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="business-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="1"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.departmentId}
                                        onChangeText={(v) => handleInputChange("departmentId", v)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="email@company.com"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.email}
                                        onChangeText={(v) => handleInputChange("email", v)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="0123456789"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.phoneNumber}
                                        onChangeText={(v) => handleInputChange("phoneNumber", v)}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, loading && styles.disabled]}
                                onPress={onSave}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={["#00F2FE", "#4FACFE"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>CREATE EMPLOYEE</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

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
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FFFFFF",
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    form: {
        marginTop: 15,
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: "#666",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 5,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        paddingHorizontal: 18,
        height: 60,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        color: "#1A1A1A",
        fontSize: 16,
        fontWeight: "500",
    },
    saveButton: {
        height: 64,
        borderRadius: 22,
        overflow: "hidden",
        marginTop: 25,
        elevation: 8,
        shadowColor: "#4FACFE",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    disabled: {
        opacity: 0.7,
    },
});
