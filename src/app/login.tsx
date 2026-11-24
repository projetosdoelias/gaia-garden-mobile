import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { session } from '@/lib/auth/session';
import { signIn, signInErrorMessage } from '@/lib/auth/signIn';
import { useSession } from '@/lib/auth/useSession';
import { loginSchema } from '@/lib/schemas/auth';
import { colors, gaia, spacing, TOUCH_TARGET } from '@/theme';

type FieldErrors = { username?: string; password?: string };

function validate(username: string, password: string) {
  const result = loginSchema.safeParse({ username, password });
  if (result.success) return { credentials: result.data, fieldErrors: {} as FieldErrors };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === 'username' || field === 'password') fieldErrors[field] ??= issue.message;
  }
  return { credentials: null, fieldErrors };
}

export default function LoginScreen() {
  const { endReason } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  async function handleSubmit() {
    if (submitLock.current) return;
    const { credentials, fieldErrors: errors } = validate(username, password);
    setFieldErrors(errors);
    setFormError(null);
    if (!credentials) return;

    submitLock.current = true;
    setIsSubmitting(true);
    // The password never outlives the submit, whatever the outcome.
    setPassword('');
    session.dismissEndReason();
    try {
      // On success the route guard replaces this screen with the Dashboard.
      await signIn(credentials);
    } catch (error) {
      setFormError(signInErrorMessage(error));
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  function goHome() {
    session.dismissEndReason();
    router.dismissTo('/');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Brand />
            <Pressable accessibilityRole="link" onPress={goHome} style={styles.back}>
              <AppText variant="small" color={gaia.greenDeep}>
                Back to home
              </AppText>
            </Pressable>
          </View>

          <View style={styles.center}>
            <Card style={styles.card}>
              <View style={styles.titles}>
                <AppText
                  variant="title"
                  color={gaia.greenDeep}
                  accessibilityRole="header"
                  style={styles.centerText}
                >
                  Sign in to your account
                </AppText>
                <AppText variant="small" color={colors.textMuted} style={styles.centerText}>
                  Monitor your habitats.
                </AppText>
              </View>

              {endReason === 'session_expired' && (
                <Notice
                  tone="warning"
                  message="Your session has expired. Please sign in again."
                />
              )}
              {formError !== null && <Notice tone="critical" message={formError} />}

              <TextField
                label="Username"
                value={username}
                onChangeText={setUsername}
                error={fieldErrors.username}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextField
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                error={fieldErrors.password}
                editable={!isSubmitting}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
              <Button
                label="Sign in"
                loadingLabel="Signing in…"
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: gaia.bg },
  content: { flexGrow: 1, padding: spacing[6], gap: spacing[6] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center' },
  card: { gap: spacing[4] },
  titles: { gap: spacing[1] },
  centerText: { textAlign: 'center' },
});
