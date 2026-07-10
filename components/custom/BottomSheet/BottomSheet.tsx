import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

import { useColorsV2 } from "@/store/themeStore";
import { useUiStore } from "@/store/uiStore";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
};

export default function BottomSheet({
  isOpen,
  onClose,
  snapPoints,
  children,
}: BottomSheetProps) {
  const colors = useColorsV2();

  const ref = useRef<BottomSheetModal>(null);
  const firstRender = useRef(true);

  const setSheetOpen = useUiStore((s) => s.setSheetOpen);

  const points = useMemo(() => snapPoints ?? ["50%"], [snapPoints]);

  useEffect(() => {
    console.log("[BottomSheet] MOUNT");

    return () => {
      console.log("[BottomSheet] UNMOUNT");
    };
  }, []);

  useEffect(() => {
    console.log("[BottomSheet] isOpen =", isOpen);
    console.log("[BottomSheet] ref.current =", ref.current);

    setSheetOpen(isOpen);

    if (firstRender.current) {
      firstRender.current = false;
      console.log("[BottomSheet] skipping first effect");
      return;
    }

    if (isOpen) {
      console.log("[BottomSheet] calling present()");
      ref.current?.present();
      console.log("[BottomSheet] present() finished");
    }
  }, [isOpen, setSheetOpen]);

  const handleDismiss = useCallback(() => {
    console.log("[BottomSheet] onDismiss");

    setSheetOpen(false);

    if (isOpen) {
      onClose();
    }
  }, [isOpen, onClose, setSheetOpen]);

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
      containerStyle={{
        zIndex: 9999,
        elevation: 9999, // Android
      }}
      onChange={(index) => {
        console.log("[BottomSheet] onChange =", index);
      }}
      onAnimate={(fromIndex, toIndex) => {
        console.log("[BottomSheet] onAnimate", fromIndex, "->", toIndex);
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.card,
      }}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
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
