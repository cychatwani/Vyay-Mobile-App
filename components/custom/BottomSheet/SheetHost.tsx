import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

import { registerSheetHandle, useSheetStore } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";

/**
 * The one and only BottomSheetModal in the app. Mounted once at the root,
 * above the navigator. Screens never own sheet state — they call
 * `openSheet(<Content />)` and forget about it.
 */
export default function SheetHost() {
  const colors = useColorsV2();
  const ref = useRef<BottomSheetModal>(null);

  const content = useSheetStore((s) => s.content);
  const snapPoints = useSheetStore((s) => s.options.snapPoints);
  const openToken = useSheetStore((s) => s.openToken);

  const points = useMemo(() => snapPoints ?? ["50%"], [snapPoints]);

  // Expose dismiss() to closeSheet().
  useEffect(() => {
    registerSheetHandle({ dismiss: () => ref.current?.dismiss() });
    return () => registerSheetHandle(null);
  }, []);

  // Present on every token increment. Content is already rendered by now,
  // because the state update that bumped the token also set the content.
  useEffect(() => {
    if (openToken === 0 || !content) return;
    ref.current?.present();
  }, [openToken, content]);

  const handleDismiss = useCallback(() => {
    // Read from the store rather than a closed-over value: onDismiss is
    // invoked from a Reanimated worklet via runOnJS, so the closure that runs
    // is not guaranteed to be the render-current one. Reading fresh state here
    // is what kept the old wrapper from getting permanently wedged.
    const { options } = useSheetStore.getState();
    options.onClose?.();
    useSheetStore.setState({ content: null, options: {} });
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView style={styles.content}>{content}</BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
