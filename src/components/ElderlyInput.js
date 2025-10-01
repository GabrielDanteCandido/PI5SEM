import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const ElderlyInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        underlineColorAndroid="transparent"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.elderlyMedium,
  },
  label: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.elderlyText,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.elderlyPrimary,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.elderlyMedium,
    paddingVertical: theme.spacing.elderlyMedium,
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.elderlyText,
    minHeight: theme.touchableSize.large,
    ...theme.shadow.small,
  },
  multilineInput: {
    minHeight: 80, // Reduzido de 120
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.7,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fonts.elderlySmall,
    marginTop: theme.spacing.xs,
  },
});

export default ElderlyInput;