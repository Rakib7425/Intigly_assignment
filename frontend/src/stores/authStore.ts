import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SocketHandler } from "../services/SocketHandler.ts";

interface User {
  id: string;
  username: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  socketManager: SocketHandler | null;
  isAuthenticated: boolean;
  isConnecting: boolean;

  // Actions
  login: (username: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  setSocketManager: (socketManager: SocketHandler | null) => void;
  setConnecting: (connecting: boolean) => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      socketManager: null,
      isAuthenticated: false,
      isConnecting: false,

      login: async (username: string) => {
        set({ isConnecting: true });

        try {
          const response = await fetch(
            `${
              (import.meta as any).env.VITE_APP_BACKEND_URL ||
              "http://localhost:3001"
            }/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username }),
            }
          );

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
          const { user, token } = data;

          // Create socket connection
          const socketManager = new SocketHandler(
            (import.meta as any).env.VITE_APP_BACKEND_URL ||
              "http://localhost:3001"
          );

          set({
            user,
            token,
            socketManager,
            isAuthenticated: true,
            isConnecting: false,
          });

          // Connect socket
          socketManager.connect();
        } catch (error) {
          console.error("Login error:", error);
          set({ isConnecting: false });
          throw error;
        }
      },

      logout: () => {
        const { socketManager } = get();

        // Disconnect socket
        socketManager?.disconnect();

        // Reset state
        set({
          user: null,
          token: null,
          socketManager: null,
          isAuthenticated: false,
          isConnecting: false,
        });
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isConnecting: false,
        });
      },

      setSocketManager: (socketManager: SocketHandler | null) => {
        set({ socketManager });
      },

      setConnecting: (isConnecting: boolean) => {
        set({ isConnecting });
      },

      getAuthHeaders: () => {
        const { token } = get();
        return {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        };
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
