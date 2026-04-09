import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

export function LoadingSpinner({ size = "large", color = "#6366F1" }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
