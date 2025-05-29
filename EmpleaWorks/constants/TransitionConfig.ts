// Configuración global de transiciones para la aplicación EmpleaWorks
export const TRANSITION_CONFIG = {
  // Duraciones por defecto (en milisegundos)
  durations: {
    fast: 150,
    normal: 250,
    slow: 400,
    modal: 300,
  },

  // Configuraciones de spring para animaciones suaves
  spring: {
    gentle: {
      damping: 15,
      stiffness: 120,
    },
    bouncy: {
      damping: 12,
      stiffness: 200,
    },
    smooth: {
      damping: 20,
      stiffness: 150,
    },
  },

  // Valores de escala para efectos de presión
  scale: {
    subtle: 0.98,
    normal: 0.95,
    pronounced: 0.9,
  },

  // Tipos de animación recomendados por pantalla
  screenAnimations: {
    auth: 'slideUp',        // Login, registro, welcome
    main: 'slide',          // Navegación principal
    modal: 'slideUp',       // Modales y formularios
    profile: 'fade',        // Pantallas de perfil
    details: 'slide',       // Detalles de ofertas
  },

  // Configuraciones específicas para diferentes elementos UI
  ui: {
    button: {
      scale: 0.97,
      duration: 150,
      animationType: 'both' as const,
    },
    card: {
      scale: 0.98,
      duration: 200,
      animationType: 'scale' as const,
    },
    tab: {
      scale: 0.95,
      duration: 100,
      animationType: 'opacity' as const,
    },
  },
} as const;

// Función helper para obtener configuración de transición por tipo de pantalla
export function getScreenTransitionConfig(screenType: keyof typeof TRANSITION_CONFIG.screenAnimations) {
  return {
    animationType: TRANSITION_CONFIG.screenAnimations[screenType],
    duration: TRANSITION_CONFIG.durations.normal,
  };
}

// Función helper para obtener configuración de elemento UI
export function getUIElementConfig(elementType: keyof typeof TRANSITION_CONFIG.ui) {
  return TRANSITION_CONFIG.ui[elementType];
}
