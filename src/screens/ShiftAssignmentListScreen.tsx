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
import Animated, { FadeInDown } from "react-native-reanimated";
import { shiftApi } from "../api/shift.api";
import { ShiftAssignment } from "../types/api.types";
import { AppStackParamList } from "../types/navigation.types";

type Props = NativeStackScreenProps<AppStackParamList, "ShiftAssignmentList">;

export function ShiftAssignmentListScreen({ navigation }: Props) {
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<ShiftAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAssignments = useCallback(async () => {
        try {
            const data = await shiftApi.getAllAssignments();
            // Sort by fromDate descending
            const sortedData = [...data].sort((a, b) =>
                new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()
            );
            setAssignments(sortedData);
            setFilteredAssignments(sortedData);
        } catch (error) {
            console.error("Error fetching shift assignments:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();

        // Refresh when returning to this screen
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAssignments();
        });
        return unsubscribe;
    }, [fetchAssignments, navigation]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredAssignments(assignments);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = assignments.filter(
                (item) =>
                    item.employeeName.toLowerCase().includes(query) ||
                    item.shiftName.toLowerCase().includes(query) ||
                    (item.productionLineName && item.productionLineName.toLowerCase().includes(query))
            );
            setFilteredAssignments(filtered);
        }
    }, [searchQuery, assignments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignments();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderItem = ({ item, index }: { item: ShiftAssignment; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(500)}
            style={styles.cardWrapper}
        >
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={["#FFFFFF", "#F9FAFB"]}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.employeeIconContainer}>
                            <Ionicons name="person" size={20} color="#4FACFE" />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.employeeName}>{item.employeeName}</Text>
                            <View style={styles.shiftBadge}>
                                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                                <Text style={styles.shiftBadgeText}>{item.shiftName}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CCC" />
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.infoLabel}>Time:</Text>
                            <Text style={styles.infoValue}>
                                {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="git-network-outline" size={16} color="#666" />
                            <Text style={styles.infoLabel}>Line:</Text>
                            <Text style={styles.infoValue}>
                                {item.productionLineName || "Unknown"}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shift Assignments</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("AddShiftAssignment")}
                >
                    <LinearGradient
                        colors={["#4FACFE", "#00F2FE"]}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by employee, shift, line..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={18} color="#CCC" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4FACFE" />
                    <Text style={styles.loadingText}>Loading data...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAssignments}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={80} color="#E0E0E0" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? "No matching assignments found" : "No assignments available"}
                            </Text>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={onRefresh}
                            >
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "white",
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    addButton: {
        shadowColor: "#4FACFE",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        margin: 15,
        paddingHorizontal: 15,
        borderRadius: 15,
        height: 50,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#1A1A1A",
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 30,
        flexGrow: 1,
    },
    cardWrapper: {
        marginBottom: 15,
    },
    card: {
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardGradient: {
        padding: 15,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    employeeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(79, 172, 254, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    shiftBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#764BA2",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: "flex-start",
        gap: 4,
    },
    shiftBadgeText: {
        color: "white",
        fontSize: 11,
        fontWeight: "600",
    },
    cardContent: {
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        paddingTop: 12,
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 13,
        color: "#999",
        marginLeft: 8,
        width: 80,
    },
    infoValue: {
        fontSize: 13,
        color: "#1A1A1A",
        fontWeight: "500",
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 15,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    refreshButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "rgba(79, 172, 254, 0.1)",
        borderRadius: 10,
    },
    refreshButtonText: {
        color: "#4FACFE",
        fontWeight: "bold",
    },
});
