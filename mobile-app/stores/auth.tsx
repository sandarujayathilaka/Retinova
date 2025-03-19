import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { api } from "@/services/api.service";

interface User {
  id: number;
  username: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  profile: Profile | null;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: User) => void;
  setProfile: (profile: any) => void;
  isLoggedIn: () => boolean;
  refreshProfile: () => void;
  logout: () => void;
}

// Create the secure storage adapter
const secureStorage = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

// Create your store with typed state and actions
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      refreshToken: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      isLoggedIn: () => get().user !== null && get().token !== null,
      setRefreshToken: (refreshToken) => set(() => ({ refreshToken })),
      logout: () =>
        set(() => ({ user: null, token: null, refreshToken: null })),
      refreshProfile: async () => {
        if (!get().isLoggedIn()) {
          console.log("User is not logged in, skipping profile refresh.");
          return;
        }

        try {
          const response = await api.get("/auth/me");
          set({ profile: response.data });
          console.log("Profile refreshed:", response.data);
        } catch (error) {
          console.error("Failed to refresh profile:", error);
        }
      },
    }),
    {
      name: "secure-auth-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export default useAuthStore;
