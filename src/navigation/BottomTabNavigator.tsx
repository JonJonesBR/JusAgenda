import React, { useMemo } from "react";
import { Icon } from "@rneui/themed";
import HomeStack from "./stacks/HomeStack";
import CalendarStack from "./stacks/CalendarStack";
import SearchStack from "./stacks/SearchStack";
import SyncStack from "./stacks/SyncStack";
import ClientsStack from "./stacks/ClientsStack";
import { Tab } from "./navigationConfig";
import { useTheme } from "../contexts/ThemeContext";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";

const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  const tabConfig = useMemo(
    () => ({
      screenOptions: {
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          color: "#fff",
          fontSize: 18,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary || "#757575",
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          paddingBottom: 5,
          height: 60,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      } as BottomTabNavigationOptions,
    }),
    [theme]
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
        component={CalendarStack}
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
};

export default BottomTabNavigator;
