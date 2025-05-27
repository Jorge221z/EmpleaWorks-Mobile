const tintColorLight = '#7c28eb';
const tintColorDark = '#9b6dff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: 'rgba(43, 31, 60, 0.15)',
    fieldBackground: '#f8f8f8',
    tabBarBackground: '#ffffff',
    headerBackground: '#ffffff',
  },
  dark: {
    text: '#fff',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    card: '#2d2d2d',
    border: 'rgba(128, 128, 128, 0.3)', // Cambiado a gris en lugar de blanco
    fieldBackground: '#333333', // Ajustado para un contraste sutil con el fondo de la tarjeta
    tabBarBackground: '#1a1a1a',
    headerBackground: '#1a1a1a',
  },
};
