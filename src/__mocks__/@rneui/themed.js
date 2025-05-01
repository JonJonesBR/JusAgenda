const React = require('react');
const { View, Text: RNText } = require('react-native');

module.exports = {
  Button: (props) => React.createElement(View, props, [
    props.title ? React.createElement(RNText, {}, props.title) : null,
    ...(Array.isArray(props.children) ? props.children : props.children ? [props.children] : [])
  ]),
  FAB: (props) => {
  console.log('DEBUG FAB props:', props);
  const { TouchableOpacity } = require('react-native');
  const { children, ...rest } = props;
  return React.createElement(TouchableOpacity, { ...rest }, children);
},
  Card: (props) => React.createElement(View, props, props.children),
  Icon: (props) => React.createElement(RNText, null, `Icon:${props.name}`),
  Text: (props) => React.createElement(RNText, props, props.children),
};
