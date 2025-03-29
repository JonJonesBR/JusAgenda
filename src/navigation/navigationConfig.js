import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Criação dos navegadores
export const Tab = createBottomTabNavigator();
export const Stack = createNativeStackNavigator();

// Configuração unificada de navegação padrão
// Estas configurações serão sobrescritas pelas configurações que usam o theme context
export const navigationConfig = {
  headerStyle: {
    backgroundColor: '#6200ee',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18
  },
  contentStyle: {
    backgroundColor: '#f5f5f5',
  }
};

// Configurações específicas para tabs
export const tabConfig = {
  screenOptions: {
    tabBarActiveTintColor: '#6200ee',
    tabBarInactiveTintColor: '#757575',
    tabBarStyle: {
      backgroundColor: '#ffffff',
      paddingBottom: 5,
      height: 60
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 5
    }
  }
};
