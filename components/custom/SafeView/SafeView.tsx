import React from 'react';
import { View, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  hideStatusBar?: boolean;
  hideFooter?: boolean;
  statusBarColor?: string;
  footerColor?: string;
  statusBarStyle?: "default" | "light-content" | "dark-content";
}

const SafeView = ({
  children,
  style,
  hideStatusBar = false,
  hideFooter = false,
  statusBarColor = '#000',
  footerColor,
  statusBarStyle = "dark-content"
}: SafeViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar  backgroundColor={statusBarColor} barStyle={statusBarStyle} />

      {!hideStatusBar && (
        <View style={{ height: insets.top, backgroundColor: statusBarColor }} />
      )}

      <View style={[styles.container, style]}>
        {children}
      </View>

      {!hideFooter && (
        <View
          style={{
            height: insets.bottom,
            backgroundColor:
              footerColor ||
              (Array.isArray(style) ? style[0]?.backgroundColor : style?.backgroundColor) ||
              '#fff',
          }}
        />
      )}
    </>
  );
};

export default SafeView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
