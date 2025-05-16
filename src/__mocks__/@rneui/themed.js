import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

const Button = (props) => React.createElement(View, props, [
  props.title ? React.createElement(RNText, {}, props.title) : null,
  ...(Array.isArray(props.children) ? props.children : props.children ? [props.children] : [])
]);

const FAB = (props) => {
  console.log('DEBUG FAB props:', props);
  const { children, ...rest } = props;
  return React.createElement(TouchableOpacity, { ...rest }, children);
};

const Card = (props) => React.createElement(View, props, props.children);

const Icon = (props) => React.createElement(RNText, null, `Icon:${props.name}`);

const Text = (props) => React.createElement(RNText, props, props.children);

// Mocking ThemeProvider and withTheme as they are used in the original file
const ThemeProvider = ({ children }) => React.createElement(React.Fragment, null, children);
const withTheme = (Component) => {
  const ThemedComponent = (props) => React.createElement(Component, { ...props, theme: {} });
  ThemedComponent.displayName = `WithTheme(${Component.displayName || Component.name || 'Component'})`;
  return ThemedComponent;
};
const useTheme = () => ({ theme: {}, updateTheme: () => {} });

export { Button, FAB, Card, Icon, Text, ThemeProvider, withTheme, useTheme };

export default {
  Button,
  FAB,
  Card,
  Icon,
  Text,
  ThemeProvider,
  withTheme,
  useTheme,
};
