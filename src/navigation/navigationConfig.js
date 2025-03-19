import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../utils/common';

// Criação dos navegadores
export const Tab = createBottomTabNavigator();
export const Stack = createNativeStackNavigator();

// Configuração unificada de navegação
export const navigationConfig = {
  headerStyle: {
    backgroundColor: '#6200ee',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  tabBarOptions: {
    activeTintColor: '#6200ee',
    inactiveTintColor: '#757575',
    style: {
      backgroundColor: '#ffffff',
      paddingBottom: 5,
      height: 60
    },
    labelStyle: {
      fontSize: 12,
      marginBottom: 5
    }
  },
  contentStyle: {
    backgroundColor: '#f5f5f5',
  }
};
