/**
 * AttendanceCheckInScreen - Public screen for employee attendance check-in
 * Displays ESP32 camera stream and triggers face recognition via /send endpoint
 */

import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { WebView } from "react-native-webview";
import CustomAlert from "../components/CustomAlert";
import { AuthStackParamList } from "../types/AuthParam";
import { CAMERA_STREAM_PORT } from "../utils/constants";

const { width, height } = Dimensions.get("window");

type Props = NativeStackScreenProps<AuthStackParamList, "AttendanceCheckIn">;

export default function AttendanceCheckInScreen({ navigation }: Props) {
    const [cameraIP, setCameraIP] = useState<string>("");
    const [serverIP, setServerIP] = useState<string>("");
    const [streamURL, setStreamURL] = useState<string>("");
    const [discovering, setDiscovering] = useState(true);
    const [capturing, setCapturing] = useState(false);
    const [webViewKey, setWebViewKey] = useState(0);

    const [alert, setAlert] = useState({
        visible: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
        onConfirm: undefined as (() => void) | undefined,
    });

    const [lastCheckIn, setLastCheckIn] = useState<{
        name: string;
        timestamp: string;
        confidence: number;
    } | null>(null);

    // Simple UDP discovery simulation - In production, use actual UDP library
    // For now, we'll use a hardcoded IP as fallback
    useEffect(() => {
        discoverCamera();
    }, []);

    const discoverCamera = async () => {
        setDiscovering(true);

        const hosts = ["10.0.2.2", "10.159.86.141", "192.168.1.7", "192.168.1.9"]; // Add your PC IP as a persistent candidate

        for (const host of hosts) {
            try {
                const response = await fetch(`http://${host}:8000/api/camera/ip`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.ok && data.ip) {
                        setCameraIP(data.ip);
                        setServerIP(host); // Save the server that actually responded
                        setStreamURL(`http://${data.ip}:${CAMERA_STREAM_PORT}/stream`);
                        setDiscovering(false);
                        return;
                    }
                }
            } catch (e) {
                // Try next host
            }
        }

        // Fallback to defaults
        setTimeout(() => {
            const fallbackCamera = "10.159.86.166";
            const fallbackServer = "10.0.2.2";
            setCameraIP(fallbackCamera);
            setServerIP(fallbackServer);
            setStreamURL(`http://${fallbackCamera}:${CAMERA_STREAM_PORT}/stream`);
            setDiscovering(false);
        }, 1000);
    };

    const handleCapture = async () => {
        // Double check we have IPs, if not, use last known or defaults
        const currentCameraIP = cameraIP || "10.159.86.166";
        const currentServerIP = serverIP || "10.0.2.2";

        setCapturing(true);

        try {
            // Step 1: Capture RAW image from ESP32 camera
            const captureUrl = `http://${currentCameraIP}/capture`;
            console.log("Capturing from:", captureUrl);

            const response = await fetch(captureUrl);
            if (!response.ok) {
                throw new Error("Failed to capture image from camera");
            }

            const blob = await response.blob();

            // Step 2: Prepare FormData for .NET backend
            const formData = new FormData();
            formData.append("File", {
                uri: captureUrl,
                type: "image/jpeg",
                name: "capture.jpg",
            } as any);
            formData.append("DeviceId", "esp32cam-01");

            // Step 3: Call .NET backend directly
            const netUrl = `http://${currentServerIP}:5028/api/Attendance/face-checkin`;
            console.log("Uploading to .NET:", netUrl);

            const attendanceResponse = await fetch(netUrl, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!attendanceResponse.ok) {
                const errorText = await attendanceResponse.text();
                throw new Error(`Server error: ${attendanceResponse.status}`);
            }

            const recognitionData = await attendanceResponse.json();

            if (recognitionData && recognitionData.success) {
                const { employeeName, confidence, checkInTime, status } = recognitionData;

                // Save last check-in info
                setLastCheckIn({
                    name: employeeName || "Unknown",
                    timestamp: checkInTime || new Date().toISOString(),
                    confidence: confidence || 0,
                });

                // Format timestamp
                const formattedTime = new Date(checkInTime).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                // Differentiate between Check-in and Check-out
                if (status === "CheckedIn") {
                    setAlert({
                        visible: true,
                        title: `Welcome, ${employeeName}! 👋`,
                        message: `Check-in successful!\n\nTime: ${formattedTime}\nConfidence: ${confidence?.toFixed(1)}%`,
                        type: "success",
                        onConfirm: undefined,
                    });
                } else if (status === "CheckedOut") {
                    setAlert({
                        visible: true,
                        title: `Goodbye, ${employeeName}! 👋`,
                        message: `Check-out successful!\n\nTime: ${formattedTime}\nConfidence: ${confidence?.toFixed(1)}%\n\nSee you tomorrow!`,
                        type: "success",
                        onConfirm: undefined,
                    });
                } else {
                    setAlert({
                        visible: true,
                        title: recognitionData.message || "Attendance Processed",
                        message: `Status: ${status}\nConfidence: ${confidence?.toFixed(1)}%`,
                        type: "info",
                        onConfirm: undefined,
                    });
                }
            } else if (recognitionData) {
                // Handle failure cases from .NET
                const { message, status } = recognitionData;

                if (status === "UnknownFace") {
                    setAlert({
                        visible: true,
                        title: "Face Not Recognized",
                        message: "Your face was not recognized. Please contact admin.",
                        type: "error",
                        onConfirm: undefined,
                    });
                } else if (status === "AlreadyCheckedOut") {
                    setAlert({
                        visible: true,
                        title: "Already Checked Out",
                        message: message || "You've already checked out today.",
                        type: "info",
                        onConfirm: undefined,
                    });
                } else {
                    setAlert({
                        visible: true,
                        title: "Process Failed",
                        message: message || "Failed to process attendance.",
                        type: "error",
                        onConfirm: undefined,
                    });
                }
            }
        } catch (error: any) {
            console.error("Capture Error:", error);
            setAlert({
                visible: true,
                title: "Capture Failed",
                message: error.message || "Failed to communicate with camera or server.",
                type: "error",
                onConfirm: undefined,
            });
        } finally {
            setCapturing(false);
        }
    };

    const handleRefresh = () => {
        setWebViewKey((prev) => prev + 1);
        discoverCamera();
    };

    return (
        <LinearGradient colors={["#0F2027", "#203A43", "#2C5364"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Attendance Check-in</Text>

                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.content}>
                    {discovering ? (
                        <Animated.View entering={FadeInDown.duration(600)} style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#00F2FE" />
                            <Text style={styles.loadingText}>Discovering camera...</Text>
                            <Text style={styles.loadingSubtext}>Please wait</Text>
                        </Animated.View>
                    ) : (
                        <>
                            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.infoBox}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="camera" size={20} color="#00F2FE" />
                                    <Text style={styles.infoLabel}>Camera IP:</Text>
                                    <Text style={styles.infoValue}>{cameraIP || "Not found"}</Text>
                                </View>
                                <View style={styles.statusIndicator}>
                                    <View style={[styles.statusDot, cameraIP && styles.statusDotActive]} />
                                    <Text style={styles.statusText}>{cameraIP ? "Connected" : "Disconnected"}</Text>
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.streamContainer}>
                                {streamURL ? (
                                    <WebView
                                        key={webViewKey}
                                        source={{ uri: streamURL }}
                                        style={styles.webview}
                                        onError={() => {
                                            setAlert({
                                                visible: true,
                                                title: "Stream Error",
                                                message: "Failed to load camera stream. Please check camera connection.",
                                                type: "error",
                                                onConfirm: undefined,
                                            });
                                        }}
                                    />
                                ) : (
                                    <View style={styles.noStreamContainer}>
                                        <Ionicons name="videocam-off" size={60} color="rgba(255,255,255,0.3)" />
                                        <Text style={styles.noStreamText}>No stream available</Text>
                                    </View>
                                )}
                            </Animated.View>

                            {lastCheckIn && (
                                <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.lastCheckInBox}>
                                    <View style={styles.lastCheckInHeader}>
                                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                        <Text style={styles.lastCheckInTitle}>Last Check-in</Text>
                                    </View>
                                    <View style={styles.lastCheckInContent}>
                                        <View style={styles.lastCheckInRow}>
                                            <Ionicons name="person" size={16} color="#00F2FE" />
                                            <Text style={styles.lastCheckInLabel}>Name:</Text>
                                            <Text style={styles.lastCheckInValue}>{lastCheckIn.name}</Text>
                                        </View>
                                        <View style={styles.lastCheckInRow}>
                                            <Ionicons name="time" size={16} color="#00F2FE" />
                                            <Text style={styles.lastCheckInLabel}>Time:</Text>
                                            <Text style={styles.lastCheckInValue}>
                                                {new Date(lastCheckIn.timestamp).toLocaleString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Text>
                                        </View>
                                        <View style={styles.lastCheckInRow}>
                                            <Ionicons name="analytics" size={16} color="#00F2FE" />
                                            <Text style={styles.lastCheckInLabel}>Confidence:</Text>
                                            <Text style={styles.lastCheckInValue}>{lastCheckIn.confidence.toFixed(1)}%</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            )}

                            <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.instructions}>
                                <Text style={styles.instructionTitle}>Instructions:</Text>
                                <Text style={styles.instructionText}>• Position your face in the camera frame</Text>
                                <Text style={styles.instructionText}>• Ensure good lighting</Text>
                                <Text style={styles.instructionText}>• Press "Capture & Check-in" button</Text>
                            </Animated.View>

                            <TouchableOpacity
                                style={[styles.captureButton, capturing && styles.buttonDisabled]}
                                onPress={handleCapture}
                                disabled={capturing || !cameraIP}
                            >
                                <LinearGradient colors={["#00F2FE", "#4FACFE"]} style={styles.buttonGradient}>
                                    {capturing ? (
                                        <View style={styles.buttonContent}>
                                            <ActivityIndicator color="white" style={{ marginRight: 10 }} />
                                            <Text style={styles.buttonText}>PROCESSING...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="camera" size={24} color="white" style={{ marginRight: 10 }} />
                                            <Text style={styles.buttonText}>CAPTURE & CHECK-IN</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </SafeAreaView>

            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
                onConfirm={alert.onConfirm}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: { padding: 5 },
    refreshButton: { padding: 5 },
    title: { fontSize: 22, fontWeight: "bold", color: "white" },
    content: { flex: 1, paddingHorizontal: 20 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#00F2FE",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    loadingSubtext: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        marginTop: 5,
    },
    infoBox: {
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    infoLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        marginLeft: 8,
        marginRight: 8,
    },
    infoValue: {
        color: "#00F2FE",
        fontSize: 14,
        fontWeight: "bold",
    },
    statusIndicator: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FF4D4D",
        marginRight: 8,
    },
    statusDotActive: {
        backgroundColor: "#4CAF50",
    },
    statusText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
    },
    streamContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 15,
        overflow: "hidden",
        marginBottom: 15,
    },
    webview: {
        flex: 1,
    },
    noStreamContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noStreamText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 16,
        marginTop: 15,
    },
    lastCheckInBox: {
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(76, 175, 80, 0.3)",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    lastCheckInHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    lastCheckInTitle: {
        color: "#4CAF50",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    lastCheckInContent: {
        gap: 8,
    },
    lastCheckInRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    lastCheckInLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        marginLeft: 8,
        marginRight: 8,
        minWidth: 80,
    },
    lastCheckInValue: {
        color: "white",
        fontSize: 13,
        fontWeight: "600",
    },
    instructions: {
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    instructionTitle: {
        color: "#00F2FE",
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 8,
    },
    instructionText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginBottom: 3,
    },
    captureButton: {
        height: 60,
        borderRadius: 15,
        overflow: "hidden",
        marginBottom: 20,
        elevation: 8,
        shadowColor: "#4FACFE",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
    },
});
