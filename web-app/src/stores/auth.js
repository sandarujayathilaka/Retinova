import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: () => get().user !== null && get().token !== null,
      setUser: user => set(() => ({ user })),
      setToken: token => set(() => ({ token })),
    }),
    {
      name: "user-storage",
      // storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
