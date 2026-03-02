import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AddEmployeeScreen,
  AddIoTDeviceScreen,
  EmployeeListScreen,
  EnrollFaceScreen,
  HomeScreen,
  IoTDeviceListScreen,
} from "../screens";
import { AppStackParamList } from "../types/navigation.types";

// Define navigation param list

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="EnrollFace" component={EnrollFaceScreen} />
      <Stack.Screen name="IoTDeviceList" component={IoTDeviceListScreen} />
      <Stack.Screen name="AddIoTDevice" component={AddIoTDeviceScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
