import { Redirect } from 'expo-router';

// Root redirect — AuthGate in _layout.tsx handles routing to login or tabs
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
