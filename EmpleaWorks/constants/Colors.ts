const tintColorLight = '#7c28eb';
const tintColorDark = '#9b6dff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#e9d5ff', // Morado extremadamente claro, casi transparente
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: 'rgba(43, 31, 60, 0.15)',
    fieldBackground: '#f8f8f8',
    tabBarBackground: '#ffffff',
    headerBackground: '#ffffff',
    tabBarBorder: 'rgba(43, 31, 60, 0.15)',
  },
  dark: {
    text: '#fff',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#f3f4f6', // Gris muy claro, casi blanco para modo oscuro
    tabIconSelected: tintColorDark,
    card: '#2d2d2d',
    border: 'rgba(128, 128, 128, 0.3)', // Cambiado a gris en lugar de blanco
    fieldBackground: '#333333', // Ajustado para un contraste sutil con el fondo de la tarjeta
    tabBarBackground: '#1a1a1a',
    headerBackground: '#1a1a1a',
    tabBarBorder: 'rgba(128, 128, 128, 0.3)',
  },
};
