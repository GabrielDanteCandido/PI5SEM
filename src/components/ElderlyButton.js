import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

const ElderlyButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  size = 'large'
}) => {
  const getButtonStyle = () => {
    const styles = [baseStyles.button];
    
    // Variante
    if (variant === 'primary') {
      styles.push(baseStyles.primaryButton);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondaryButton);
    } else if (variant === 'success') {
      styles.push(baseStyles.successButton);
    } else if (variant === 'danger') {
      styles.push(baseStyles.dangerButton);
    }
    
    // Tamanho
    if (size === 'small') {
      styles.push(baseStyles.smallButton);
    } else if (size === 'medium') {
      styles.push(baseStyles.mediumButton);
    } else {
      styles.push(baseStyles.largeButton);
    }
    
    // Desabilitado
    if (disabled || loading) {
      styles.push(baseStyles.disabledButton);
    }
    
    if (style) {
      styles.push(style);
    }
    
    return styles;
  };
  
  const getTextStyle = () => {
    const styles = [baseStyles.buttonText];
    
    if (size === 'small') {
      styles.push(baseStyles.smallText);
    } else if (size === 'medium') {
      styles.push(baseStyles.mediumText);
    } else {
      styles.push(baseStyles.largeText);
    }
    
    if (disabled || loading) {
      styles.push(baseStyles.disabledText);
    }
    
    if (textStyle) {
      styles.push(textStyle);
    }
    
    return styles;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <>
          {icon && icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.large,
    ...theme.shadow.medium,
  },
  
  // Variantes
  primaryButton: {
    backgroundColor: theme.colors.elderlyPrimary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.elderlySecondary,
  },
  successButton: {
    backgroundColor: theme.colors.success,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
    elevation: 0,
  },
  
  // Tamanhos - Ajustados para não ultrapassar a tela
  smallButton: {
    paddingVertical: theme.spacing.elderlySmall,
    paddingHorizontal: theme.spacing.elderlyMedium,
    minHeight: theme.touchableSize.medium,
  },
  mediumButton: {
    paddingVertical: theme.spacing.elderlyMedium,
    paddingHorizontal: theme.spacing.elderlyLarge,
    minHeight: theme.touchableSize.large,
  },
  largeButton: {
    paddingVertical: theme.spacing.elderlyLarge,
    paddingHorizontal: theme.spacing.elderlyXLarge,
    minHeight: theme.touchableSize.elderly,
  },
  
  // Textos
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fonts.elderlySmall,
  },
  mediumText: {
    fontSize: theme.fonts.elderlyRegular,
  },
  largeText: {
    fontSize: theme.fonts.elderlyMedium,
  },
  disabledText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
});

export default ElderlyButton;