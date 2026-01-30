import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmployeeListScreen from "../screens/EmployeeListScreen";
import HomeScreen from "../screens/HomeScreen";

// Define navigation param list
export type AppStackParamList = {
  Home: undefined;
  EmployeeList: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "AppName" }}
      />
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        options={{ title: "Employees List" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
