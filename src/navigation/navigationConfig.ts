import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { ParamListBase } from '@react-navigation/native'; // Import ParamListBase

// Criação dos navegadores
export const Tab = createBottomTabNavigator<ParamListBase>(); // Typed
export const Stack = createNativeStackNavigator<ParamListBase>(); // Typed

// Configuração unificada de navegação padrão
// Estas configurações serão sobrescritas pelas configurações que usam o theme context
export const navigationConfig: NativeStackNavigationOptions = { // Typed
  headerStyle: {
    backgroundColor: "#6200ee",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 18,
  },
  contentStyle: {
    backgroundColor: "#f5f5f5",
  },
};

// Configurações específicas para tabs
export const tabConfig: { screenOptions: BottomTabNavigationOptions } = { // Typed
  screenOptions: {
    tabBarActiveTintColor: "#6200ee",
    tabBarInactiveTintColor: "#757575",
    tabBarStyle: {
      backgroundColor: "#ffffff",
      paddingBottom: 5,
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 5,
    },
  },
};
