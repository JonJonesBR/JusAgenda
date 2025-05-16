import React, { useMemo } from "react";
import { Icon } from "@rneui/themed";
import HomeStack from "./stacks/HomeStack";
import UnifiedCalendarScreenWithProvider from "../screens/UnifiedCalendarScreen";
import SearchStack from "./stacks/SearchStack";
import SyncStack from "./stacks/SyncStack";
import ClientsStack from "./stacks/ClientsStack";
import { Tab } from "./navigationConfig";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";

// Memoização do componente para evitar renderizações desnecessárias
const BottomTabNavigator: React.FC = React.memo(() => {
  // const { theme } = useTheme();

  const tabConfig = useMemo(
    () => ({
      screenOptions: {
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          color: "#fff",
          fontSize: 18,
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 5,
          height: 60,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      } as BottomTabNavigationOptions,
    }),
    []
  );

  const getTabIcon = (routeName: string): string => {
    switch (routeName) {
      case "Home":
        return "home";
      case "Calendar":
        return "calendar-today";
      case "Search":
        return "search";
      case "Clients":
        return "people";
      case "Sync":
        return "settings";
      default:
        return "circle";
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<Record<string, object | undefined>, string> }) => ({
        ...tabConfig.screenOptions,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Icon
            type="material"
            name={getTabIcon(route.name)}
            size={size}
            color={color}
          />
        ),
        headerTitle:
          route.name === "Home"
            ? "Início"
            : route.name === "Calendar"
            ? "Agenda"
            : route.name === "Search"
            ? "Buscar"
            : route.name === "Clients"
            ? "Clientes"
            : route.name === "Sync"
            ? "Opções"
            : route.name,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name="Calendar"
        component={UnifiedCalendarScreenWithProvider}
        options={{ title: "Agenda" }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsStack}
        options={{ title: "Clientes" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{ title: "Buscar" }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncStack}
        options={{ title: "Opções" }}
      />
    </Tab.Navigator>
  );
});

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
