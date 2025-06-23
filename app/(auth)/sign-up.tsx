import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Layout, Spacing } from '@/constants/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Button
                title="← Back"
                onPress={handleBack}
                variant="outline"
                size="small"
                style={styles.backButton}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <ThemedText type="hero" style={styles.title}>
                  Create Account
                </ThemedText>
                <ThemedText type="body" style={styles.subtitle}>
                  Start your fitness journey today
                </ThemedText>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <ThemedText type="caption" style={styles.label}>
                    EMAIL ADDRESS
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.neutral.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText type="caption" style={styles.label}>
                    PASSWORD
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor={Colors.neutral.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <ThemedText type="small" style={styles.passwordHint}>
                    8+ characters, uppercase, lowercase, number
                  </ThemedText>
                </View>

                <Button
                  title="Create Account"
                  onPress={handleSignUp}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={loading}
                  style={styles.signUpButton}
                />
              </View>

              <View style={styles.footer}>
                <ThemedText type="caption" style={styles.footerText}>
                  Already have an account?{' '}
                  <ThemedText type="caption" style={styles.linkText} onPress={handleSignIn}>
                    Sign In
                  </ThemedText>
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.darkBackground,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: Layout.input.height,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Layout.input.padding.horizontal,
    paddingVertical: Layout.input.padding.vertical,
    color: Colors.neutral.textPrimary,
    fontSize: 16,
  },
  passwordHint: {
    color: Colors.neutral.textTertiary,
    marginTop: Spacing.xs,
  },
  signUpButton: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: Colors.neutral.textSecondary,
  },
  linkText: {
    color: Colors.primary.accentBlue,
  },
}); 