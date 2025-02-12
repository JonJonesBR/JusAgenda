import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../utils/common';

// Criação dos navegadores
export const Tab = createBottomTabNavigator();
export const Stack = createNativeStackNavigator();

// Configurações comuns para o Stack Navigator
export const stackConfig = {
  screenOptions: {
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  },
};

// Configurações comuns para o Tab Navigator
export const tabConfig = {
  screenOptions: {
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: 'gray',
    headerShown: false,
  },
}; 