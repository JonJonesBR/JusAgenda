// src/__mocks__/@rneui/themed.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch as RNSwitch, ActivityIndicator } from 'react-native';

/**
 * Mock para a biblioteca @rneui/themed (React Native Elements).
 * Fornece implementações mockadas simples para os componentes mais comuns
 * para serem usados em testes Jest.
 */

// Helper para simular componentes que podem ter um título ou children
const mockComponentWithTitleAndChildren = (defaultDisplayName = 'RNEUIComponent') => {
  const Component = ({ title, children, ...props }) => (
    <View {...props} data-testid={`mock-${defaultDisplayName.toLowerCase()}`}>
      {title && <Text>{typeof title === 'function' ? title(props) : title}</Text>}
      {children}
    </View>
  );
  Component.displayName = defaultDisplayName;
  return Component;
};

// --- Mocks para Componentes Específicos ---

export const Avatar = mockComponentWithTitleAndChildren('Avatar');
export const Badge = mockComponentWithTitleAndChildren('Badge');

export const Button = jest.fn(({ title, onPress, children, ...props }) => (
  <TouchableOpacity onPress={onPress || jest.fn()} {...props} data-testid="mock-rneui-button">
    {/* Prioriza children se fornecido, senão usa title */}
    {children || (title && <Text>{typeof title === 'string' ? title : JSON.stringify(title)}</Text>)}
  </TouchableOpacity>
));
Button.displayName = 'Button';

export const Card = jest.fn(({ children, ...props }) => (
  <View {...props} data-testid="mock-rneui-card">
    {children}
  </View>
));
Card.displayName = 'Card';
Card.Title = mockComponentWithTitleAndChildren('Card.Title');
Card.Divider = () => <View data-testid="mock-rneui-card-divider" style={{ height: 1, backgroundColor: '#e0e0e0' }} />;
Card.FeaturedTitle = mockComponentWithTitleAndChildren('Card.FeaturedTitle');
Card.FeaturedSubtitle = mockComponentWithTitleAndChildren('Card.FeaturedSubtitle');
Card.Image = (props) => <View {...props} data-testid="mock-rneui-card-image" style={{ height: 100, backgroundColor: '#eee' }} />;


export const CheckBox = jest.fn(({ title, checked, onPress, ...props }) => (
  <TouchableOpacity onPress={onPress || jest.fn()} {...props} data-testid="mock-rneui-checkbox">
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{`[${checked ? 'X' : ' '}] `}</Text>
      {title && <Text>{title}</Text>}
    </View>
  </TouchableOpacity>
));
CheckBox.displayName = 'CheckBox';

export const Chip = mockComponentWithTitleAndChildren('Chip');

export const Dialog = jest.fn(({ isVisible, children, ...props }) =>
  isVisible ? <View {...props} data-testid="mock-rneui-dialog">{children}</View> : null
);
Dialog.displayName = 'Dialog';
Dialog.Title = mockComponentWithTitleAndChildren('Dialog.Title');
Dialog.Loading = ({ loadingProps, ...props }) => (
    <View {...props} data-testid="mock-rneui-dialog-loading">
        <ActivityIndicator {...loadingProps} />
        <Text>A carregar...</Text>
    </View>
);
Dialog.Actions = ({ children, ...props }) => <View {...props} data-testid="mock-rneui-dialog-actions">{children}</View>;
Dialog.Button = Button; // Reutiliza o mock do Button

export const Divider = () => <View data-testid="mock-rneui-divider" style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 }} />;

export const FAB = jest.fn(({ title, onPress, icon, children, ...props }) => {
  // console.log('[Mock RNEUI FAB] props:', props); // Log para depuração
  return (
    <TouchableOpacity onPress={onPress || jest.fn()} {...props} data-testid="mock-rneui-fab" style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center' }}>
      {icon && React.isValidElement(icon) ? icon : <Text style={{color: 'white'}}>{title || '+'}</Text>}
      {children}
    </TouchableOpacity>
  );
});
FAB.displayName = 'FAB';

export const Icon = jest.fn(({ name, type, color, size, ...props }) => (
  <Text {...props} data-testid="mock-rneui-icon" style={{ color, fontSize: size }}>
    {`[Icon: ${type}/${name}]`}
  </Text>
));
Icon.displayName = 'Icon';

export const Image = (props) => <View {...props} data-testid="mock-rneui-image" style={{ height: 100, width: 100, backgroundColor: '#eee' }} />;

export const Input = jest.fn(React.forwardRef(({ errorMessage, leftIcon, rightIcon, label, ...props }, ref) => (
  <View data-testid="mock-rneui-input-container">
    {label && <Text>{typeof label === 'function' ? label(props) : label}</Text>}
    <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: errorMessage ? 'red' : '#ccc', borderWidth: 1, padding: 5 }}>
      {leftIcon}
      <TextInput ref={ref} {...props} style={[{ flex: 1 }, props.style]} />
      {rightIcon}
    </View>
    {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
  </View>
)));
Input.displayName = 'Input';


export const ListItem = jest.fn(({ children, onPress, bottomDivider, topDivider, ...props }) => (
  <TouchableOpacity onPress={onPress || jest.fn()} {...props} data-testid="mock-rneui-listitem">
    {topDivider && <Divider />}
    <View style={{ padding: 10 }}>{children}</View>
    {bottomDivider && <Divider />}
  </TouchableOpacity>
));
ListItem.displayName = 'ListItem';
ListItem.Accordion = mockComponentWithTitleAndChildren('ListItem.Accordion');
ListItem.CheckBox = CheckBox; // Reutiliza o mock do CheckBox
ListItem.Chevron = (props) => <Icon name="chevron-right" type="material-community" {...props} />;
ListItem.Content = ({ children, ...props }) => <View {...props} data-testid="mock-rneui-listitem-content">{children}</View>;
ListItem.Input = Input; // Reutiliza o mock do Input
ListItem.Subtitle = mockComponentWithTitleAndChildren('ListItem.Subtitle');
ListItem.Title = mockComponentWithTitleAndChildren('ListItem.Title');
// Adicionar outros subcomponentes do ListItem se usados: ButtonGroup, etc.

export const Overlay = jest.fn(({ isVisible, children, ...props }) =>
  isVisible ? <View {...props} data-testid="mock-rneui-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}><View style={{backgroundColor: 'white', padding: 20, borderRadius: 5}}>{children}</View></View> : null
);
Overlay.displayName = 'Overlay';

export const PricingCard = mockComponentWithTitleAndChildren('PricingCard');
export const Rating = mockComponentWithTitleAndChildren('Rating'); // Muito simplificado

export const SearchBar = jest.fn((props) => (
  <View data-testid="mock-rneui-searchbar-container">
    <TextInput
      placeholder={props.placeholder || "Procurar..."}
      onChangeText={props.onChangeText || jest.fn()}
      value={props.value || ""}
      style={{ borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 5 }}
      {...props.inputProps} // Se SearchBar tiver inputProps
    />
  </View>
));
SearchBar.displayName = 'SearchBar';
// Adicionar mocks para SearchBar.IOS, SearchBar.Android, SearchBar.Default se os usar especificamente

export const Slider = mockComponentWithTitleAndChildren('Slider'); // Muito simplificado

export const SocialIcon = mockComponentWithTitleAndChildren('SocialIcon');

export const SpeedDial = jest.fn(({ isOpen, openIcon, closeIcon, children, ...props }) => (
  <View {...props} data-testid="mock-rneui-speeddial">
    <Text>{isOpen ? 'Open' : 'Closed'}</Text>
    {isOpen && children}
  </View>
));
SpeedDial.displayName = 'SpeedDial';
SpeedDial.Action = Button; // Reutiliza o mock do Button

// Switch: @rneui/themed exporta o Switch do react-native, então podemos mocká-lo ou deixar o react-native cuidar.
// Se precisar de um mock específico para o Switch do RNEUI (caso ele adicione props/lógica):
export const Switch = jest.fn((props) => <RNSwitch {...props} data-testid="mock-rneui-switch" />);
Switch.displayName = 'Switch';


export const Tab = jest.fn(({ value, onChange, children, ...props }) => (
  <View {...props} data-testid="mock-rneui-tab">
    <Text>Current Tab: {value}</Text>
    {children}
  </View>
));
Tab.displayName = 'Tab';
Tab.Item = jest.fn(({ title, ...props }) => (
  <TouchableOpacity {...props} data-testid="mock-rneui-tab-item">
    <Text>{title}</Text>
  </TouchableOpacity>
));
Tab.Item.displayName = 'Tab.Item';


export const Text = jest.fn(({ h1, h2, h3, h4, style, children, ...props }) => {
  let textStyle = style;
  if (h1) textStyle = [{ fontSize: 32, fontWeight: 'bold' }, style];
  else if (h2) textStyle = [{ fontSize: 28, fontWeight: 'bold' }, style];
  else if (h3) textStyle = [{ fontSize: 24, fontWeight: 'bold' }, style];
  else if (h4) textStyle = [{ fontSize: 20, fontWeight: 'bold' }, style];
  return <ReactText {...props} style={textStyle} data-testid="mock-rneui-text">{children}</ReactText>;
});
const ReactText = Text; // Para evitar conflito de nome na linha acima
Text.displayName = 'Text';


export const Tooltip = mockComponentWithTitleAndChildren('Tooltip');

// --- Hooks e Utilitários ---

export const useTheme = jest.fn(() => ({
  theme: {
    colors: {
      primary: '#6200EE',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      card: '#F5F5F5',
      text: '#000000',
      placeholder: '#A0A0A0',
      disabled: '#BDBDBD',
      error: '#B00020',
      warning: '#FFA000',
      success: '#4CAF50',
      info: '#2196F3',
      white: '#FFFFFF',
      black: '#000000',
      grey0: '#393e42',
      grey1: '#43484d',
      grey2: '#5e6977',
      grey3: '#86939e',
      grey4: '#bdc6cf',
      grey5: '#e1e8ee',
      greyOutline: '#bbb',
      searchBg: '#303337',
      divider: '#bcbbc1',
      platform: {
        ios: { primary: 'blue', secondary: 'green', grey: 'grey', searchBg: 'lightgrey', success: 'green', error: 'red', warning: 'orange' },
        android: { primary: 'blue', secondary: 'green', grey: 'grey', searchBg: 'lightgrey', success: 'green', error: 'red', warning: 'orange' },
        web: { primary: 'blue', secondary: 'green', grey: 'grey', searchBg: 'lightgrey', success: 'green', error: 'red', warning: 'orange' },
        default: { primary: 'blue', secondary: 'green', grey: 'grey', searchBg: 'lightgrey', success: 'green', error: 'red', warning: 'orange' },
      },
    },
    spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
    typography: { fontFamily: { regular: 'System', bold: 'System' }, fontSize: {sm: 12, md: 14, lg: 16, xl: 18} }, // Simplificado
    radii: {sm: 2, md: 4, lg: 8, xl: 12, round: 999}, // Simplificado
    shadows: {sm: {}, md: {}, lg: {}}, // Simplificado
    // Adicione outras propriedades do tema que você usa
  },
  updateTheme: jest.fn(),
  replaceTheme: jest.fn(),
  isDark: false, // Pode ser mockado para true em testes específicos
}));

export const ThemeProvider = ({ children }) => <>{children}</>; // Mock simples
export const withTheme = (WrappedComponent) => (props) => <WrappedComponent {...props} theme={{ colors: {}, updateTheme: jest.fn() }} />; // Mock simplificado

// Skeleton (se você usa o Skeleton do RNEUI e não um customizado)
export const Skeleton = jest.fn(({ animation, children, ...props }) => (
  <View {...props} data-testid="mock-rneui-skeleton" style={[{ backgroundColor: '#e0e0e0', borderRadius: 4 }, props.style]}>
    {/* O Skeleton real tem uma lógica de animação complexa. Este é um placeholder visual. */}
    {/* Se precisar testar a presença de children dentro do Skeleton, eles são passados aqui. */}
    {children}
  </View>
));
Skeleton.displayName = 'Skeleton';


// Adicione outros componentes que você usa de @rneui/themed
// Ex: BottomSheet, Header (o deles, não o seu customizado), LinearProgress, etc.

// Utilitário para criar tema (se você o usa)
export const createTheme = jest.fn((updates) => ({
  // Retorna um objeto de tema mockado, possivelmente fundindo com um tema base mockado
  colors: { primary: '#6200EE', ...updates?.colors },
  // ...outras propriedades do tema
  ...updates,
}));

// makeStyles (se você o usa para criar estilos temáticos)
export const makeStyles = jest.fn((stylesFactory) => (props) => {
  // Simula a chamada da factory com um tema mock e props
  const mockTheme = useTheme().theme; // Usa o tema mockado do hook
  return stylesFactory(mockTheme, props);
});
