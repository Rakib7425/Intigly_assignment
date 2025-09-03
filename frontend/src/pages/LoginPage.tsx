import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const { login, isConnecting, isAuthenticated, user, setUser } =
    useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Listen for authentication success
  useEffect(() => {
    const { socketManager } = useAuthStore.getState();

    if (!socketManager) return;

    const handleAuthenticated = (userData: any) => {
      console.log("✅ Authenticated:", userData);
      setUser(userData.user, userData.token);
      navigate("/home", { replace: true });
    };

    socketManager.on("authenticated", handleAuthenticated);

    return () => {
      socketManager.off("authenticated", handleAuthenticated);
    };
  }, [setUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      try {
        await login(username.trim());
      } catch (error) {
        console.error("Login failed:", error);
        // You could add error state here to show user-friendly messages
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CollabDocs</h1>
          <p className="text-gray-600">
            Real-time collaborative document editing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Choose a username
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your username"
                required
                disabled={isConnecting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Join Collaboration"}
          </button>
        </form>
      </div>
    </div>
  );
}
