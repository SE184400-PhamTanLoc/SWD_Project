import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Department, departmentApi } from "../api/department.api";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "DepartmentList">;

export function DepartmentListScreen({ navigation }: Props) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");

    const loadDepartments = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await departmentApi.getDepartments();
            setDepartments(data);
        } catch (error: any) {
            console.error("Error loading departments:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            loadDepartments(false);
        });
        return unsubscribe;
    }, [navigation, loadDepartments]);

    const onRefresh = () => {
        setRefreshing(true);
        loadDepartments(false);
    };

    const filtered = departments.filter(
        (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.departmentCode.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item, index }: { item: Department; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
            <View style={styles.card}>
                <View style={styles.cardIcon}>
                    <Ionicons name="business" size={22} color="#4FACFE" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardCode}>{item.departmentCode}</Text>
                    {item.description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.titleRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Departments</Text>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => navigation.navigate("AddDepartment")}
                        >
                            <LinearGradient colors={["#00F2FE", "#4FACFE"]} style={styles.addGrad}>
                                <Ionicons name="add" size={26} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="Search departments..."
                            placeholderTextColor="#999"
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch("")}>
                                <Ionicons name="close-circle" size={18} color="#999" />
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </View>

                {loading && !refreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#4FACFE" />
                        <Text style={styles.loadingText}>Loading departments...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4FACFE" colors={["#4FACFE"]} />
                        }
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="business-outline" size={80} color="#E0E0E0" />
                                <Text style={styles.emptyText}>No departments found</Text>
                                <TouchableOpacity style={styles.retryBtn} onPress={() => loadDepartments()}>
                                    <Text style={styles.retryText}>Refresh</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: "#F8F9FA" },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    backBtn: { padding: 5 },
    title: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A", letterSpacing: 0.5 },
    addBtn: { elevation: 8, shadowColor: "#4FACFE", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    addGrad: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    searchBox: {
        flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 18,
        paddingHorizontal: 15, height: 54, borderWidth: 1, borderColor: "#E0E0E0",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    searchInput: { flex: 1, color: "#1A1A1A", fontSize: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 15, color: "#666", fontSize: 16 },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        flexDirection: "row", backgroundColor: "white", borderRadius: 20, padding: 18, marginBottom: 12,
        borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    },
    cardIcon: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(79, 172, 254, 0.1)",
        justifyContent: "center", alignItems: "center", marginRight: 14,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: "bold", color: "#1A1A1A" },
    cardCode: { fontSize: 13, color: "#4FACFE", fontWeight: "600", marginTop: 2 },
    cardDesc: { fontSize: 13, color: "#999", marginTop: 4 },
    empty: { marginTop: 100, alignItems: "center", justifyContent: "center" },
    emptyText: { color: "#999", fontSize: 18, marginTop: 12 },
    retryBtn: { marginTop: 25, paddingHorizontal: 35, paddingVertical: 14, borderRadius: 28, borderWidth: 1.5, borderColor: "#4FACFE" },
    retryText: { color: "#4FACFE", fontWeight: "bold", fontSize: 15 },
});
