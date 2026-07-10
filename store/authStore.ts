import { UserDetails } from "@/types/auth";
import { create } from "zustand";


type AuthState = {
    isLoggedIn: boolean;
    accessToken: string|null;
    user: UserDetails|null;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    setAccessToken: (accessToken: string) => void;
    setUser: (user: UserDetails) => void;
    logout: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    accessToken: null,
    user: null,
    setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    setUser: (user: UserDetails) => set({ user }),
    logout: () => set({ isLoggedIn: false, accessToken: null, user: null }),
}))

