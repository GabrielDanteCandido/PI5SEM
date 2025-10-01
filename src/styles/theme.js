export const theme = {
  colors: {
    primary: '#2E7D32', // Verde escuro - boa visibilidade
    secondary: '#1565C0', // Azul - contraste adequado
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    disabled: '#BDBDBD',
    // Cores para idosos - alto contraste
    elderlyPrimary: '#000080', // Azul marinho
    elderlySecondary: '#006400', // Verde escuro
    elderlyBackground: '#FFFEF7', // Branco levemente amarelado (menos cansativo)
    elderlyText: '#000000', // Preto puro para máximo contraste
  },
  
  fonts: {
    // Tamanhos ajustados para telas móveis
    tiny: 12,
    small: 14,
    regular: 16,
    medium: 18,
    large: 20,
    xlarge: 22,
    xxlarge: 24,
    huge: 26,
    // Tamanhos específicos para idosos - reduzidos
    elderlySmall: 16,
    elderlyRegular: 18,
    elderlyMedium: 20,
    elderlyLarge: 22,
    elderlyHuge: 24,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    // Espaçamentos ajustados para idosos
    elderlySmall: 8,
    elderlyMedium: 12,
    elderlyLarge: 16,
    elderlyXLarge: 20,
  },
  
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
  },
  
  // Tamanhos mínimos para elementos tocáveis (WCAG recomenda 44x44)
  touchableSize: {
    small: 44,
    medium: 48,
    large: 56,
    elderly: 60, // Reduzido de 80 para 60
  },
  
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
  },
};