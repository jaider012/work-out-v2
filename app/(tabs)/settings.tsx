import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
  title: string;
  value?: string;
  onPress?: () => void;
  type?: 'navigation' | 'toggle' | 'destructive';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingsItem({ title, value, onPress, type = 'navigation', toggleValue, onToggle }: SettingsItemProps) {
  const renderRight = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: Colors.neutral.textTertiary, true: Colors.semantic.success }}
            thumbColor={toggleValue ? Colors.neutral.lightBackground : Colors.neutral.textSecondary}
          />
        );
      case 'destructive':
        return null;
      default:
        return (
          <View style={styles.navigationRight}>
            {value && (
              <ThemedText type="caption" style={styles.itemValue}>
                {value}
              </ThemedText>
            )}
            <ThemedText style={styles.chevron}>›</ThemedText>
          </View>
        );
    }
  };

  const textColor = type === 'destructive' ? Colors.semantic.error : Colors.neutral.textPrimary;

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={type === 'toggle'}
      activeOpacity={0.7}
    >
      <ThemedText type="body" style={[styles.itemTitle, { color: textColor }]}>
        {title}
      </ThemedText>
      {renderRight()}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotifications = () => {
    console.log('Navigate to notification settings');
  };

  const handleProfile = () => {
    console.log('Navigate to profile settings');
  };

  const handleWorkspace = () => {
    console.log('Navigate to workspace settings');
  };

  const handlePrivacy = () => {
    console.log('Navigate to privacy settings');
  };

  const handleHelp = () => {
    console.log('Navigate to help');
  };

  const handleFeedback = () => {
    console.log('Navigate to feedback');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.headerTitle}>
            Settings
          </ThemedText>
          {user?.email && (
            <ThemedText type="caption" style={styles.headerSubtitle}>
              {user.email}
            </ThemedText>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <ThemedText type="caption" style={styles.sectionTitle}>
              ACCOUNT
            </ThemedText>
            <Card style={styles.settingsCard}>
              <SettingsItem
                title="Profile"
                value="Edit profile"
                onPress={handleProfile}
              />
              <SettingsItem
                title="Workspace"
                value="Personal"
                onPress={handleWorkspace}
              />
            </Card>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <ThemedText type="caption" style={styles.sectionTitle}>
              PREFERENCES
            </ThemedText>
            <Card style={styles.settingsCard}>
              <SettingsItem
                title="Notifications"
                onPress={handleNotifications}
              />
              <SettingsItem
                title="Push Notifications"
                type="toggle"
                toggleValue={notifications}
                onToggle={setNotifications}
              />
              <SettingsItem
                title="Auto Backup"
                type="toggle"
                toggleValue={autoBackup}
                onToggle={setAutoBackup}
              />
              <SettingsItem
                title="Privacy"
                onPress={handlePrivacy}
              />
            </Card>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <ThemedText type="caption" style={styles.sectionTitle}>
              SUPPORT
            </ThemedText>
            <Card style={styles.settingsCard}>
              <SettingsItem
                title="Help & FAQ"
                onPress={handleHelp}
              />
              <SettingsItem
                title="Send Feedback"
                onPress={handleFeedback}
              />
              <SettingsItem
                title="Rate App"
                onPress={() => console.log('Rate app')}
              />
            </Card>
          </View>

          {/* System Section */}
          <View style={styles.section}>
            <ThemedText type="caption" style={styles.sectionTitle}>
              SYSTEM
            </ThemedText>
            <Card style={styles.settingsCard}>
              <SettingsItem
                title="App Version"
                value="1.0.0"
              />
            </Card>
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <Card style={styles.settingsCard}>
              <SettingsItem
                title="Log Out"
                type="destructive"
                onPress={handleLogout}
              />
            </Card>
          </View>
        </ScrollView>
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    color: Colors.neutral.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Layout.listItem.height,
    paddingHorizontal: Layout.listItem.padding.horizontal,
    paddingVertical: Layout.listItem.padding.vertical,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.cardBackground,
  },
  itemTitle: {
    flex: 1,
  },
  navigationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    color: Colors.neutral.textSecondary,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 18,
    color: Colors.neutral.textTertiary,
    fontWeight: '300',
  },
}); 