import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

import { useColorsV2 } from "@/store/themeStore";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
};

/**
 * Generic, state-controlled bottom sheet. Uses BottomSheetModal so it always
 * portals to the root and overlays the whole screen, no matter which component
 * renders it. Requires <BottomSheetModalProvider> at the app root.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  snapPoints,
  children,
}: BottomSheetProps) {
  const colors = useColorsV2();
  const ref = useRef<BottomSheetModal>(null);

  // Always have a snap point so the sheet never depends on dynamic measurement.
  const points = useMemo(() => snapPoints ?? ["50%"], [snapPoints]);

  useEffect(() => {
    console.log("[sheet] useEffect, isOpen =", isOpen, "ref =", !!ref.current);
    if (isOpen) {
      requestAnimationFrame(() => {
        console.log("[sheet] RAF firing present(), ref =", !!ref.current);
        ref.current?.present();
        console.log("[sheet] present() called");
      });
    } else {
      ref.current?.dismiss();
    }
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    if (isOpen) onClose();
  }, [isOpen, onClose]);

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
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
});
