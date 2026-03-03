import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
import { departmentApi } from "../api/department.api";
import CustomAlert from "../components/CustomAlert";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "AddDepartment">;

export function AddDepartmentScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        departmentCode: "",
        name: "",
        description: "",
    });

    const [alert, setAlert] = useState({
        visible: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
        onConfirm: undefined as (() => void) | undefined,
    });

    const handleInputChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const onSave = async () => {
        if (!form.departmentCode || !form.name) {
            setAlert({
                visible: true,
                title: "Validation Error",
                message: "Department Code and Name are required",
                type: "error",
                onConfirm: undefined,
            });
            return;
        }

        setLoading(true);
        try {
            await departmentApi.createDepartment({
                departmentCode: form.departmentCode,
                name: form.name,
                description: form.description || undefined,
            });

            setAlert({
                visible: true,
                title: "Success",
                message: "Department created successfully!",
                type: "success",
                onConfirm: () => navigation.goBack(),
            });
        } catch (error: any) {
            console.error("Create department error:", error);
            setAlert({
                visible: true,
                title: "Error",
                message: error.message || "Failed to create department",
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
                        <Text style={styles.title}>New Department</Text>
                        <View style={{ width: 28 }} />
                    </Animated.View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department Code *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="barcode-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="DEPT001"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.departmentCode}
                                        onChangeText={(v) => handleInputChange("departmentCode", v)}
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department Name *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="business-outline" size={20} color="#4FACFE" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Production Department"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={form.name}
                                        onChangeText={(v) => handleInputChange("name", v)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                    <Ionicons name="information-circle-outline" size={20} color="#4FACFE" style={[styles.inputIcon, { marginTop: 15 }]} />
                                    <TextInput
                                        placeholder="Enter department description"
                                        placeholderTextColor="#999"
                                        style={[styles.input, styles.textArea]}
                                        value={form.description}
                                        onChangeText={(v) => handleInputChange("description", v)}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
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
                                        <Text style={styles.saveButtonText}>CREATE DEPARTMENT</Text>
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
    textAreaContainer: {
        height: 120,
        alignItems: "flex-start",
        paddingTop: 5,
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
    textArea: {
        paddingTop: 15,
        height: "100%",
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
