import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

test('Text puro', () => {
  const { getByText } = render(<Text>Teste puro</Text>);
  expect(getByText('Teste puro')).toBeTruthy();
});
