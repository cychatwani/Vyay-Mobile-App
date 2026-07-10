import * as SecureStore from "expo-secure-store";
import { StoreKeys } from "@/config/StoreKeys";

export const saveRefreshToken = async (refreshToken: string) => {
  await SecureStore.setItemAsync(StoreKeys.REFRESH_TOKEN, refreshToken);
};


export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(StoreKeys.REFRESH_TOKEN);
};

export const deleteRefreshToken = async () => {
    await SecureStore.deleteItemAsync(StoreKeys.REFRESH_TOKEN);
}