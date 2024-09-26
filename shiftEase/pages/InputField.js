import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';

const InputField = ({ label, placeholder, isPassword = false, errorMessage }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="rgba(102, 102, 102, 1)"
              secureTextEntry={isPassword && !showPassword}
              accessibilityLabel={label}
            />
            {isPassword && (
              <TouchableOpacity
                style={styles.showHideButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  resizeMode="contain"
                  source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f3b55df132da99dbc33a809c79877e7b0101eee6c8864bc69b8efc2d312f6d9c?placeholderIfAbsent=true&apiKey=b4d9577c60d14a339753390c221813ce" }}
                  style={styles.eyeIcon}
                />
                <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {/*{errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}*/}
        </View>
      );
    };

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 1)",
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(102, 102, 102, 0.35)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 12,
        outline: 'none',
    },
    showHideButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
    },
    eyeIcon: {
        width: 24,
        height: 24,
        marginRight: 3,
    },
    showHideText: {
        fontSize: 16,
        color: "rgba(102, 102, 102, 1)",
    },
    errorMessage: {
        color: "rgba(238, 29, 82, 1)",
        fontSize: 14,
        marginTop: 4,
    },
});

export default InputField;