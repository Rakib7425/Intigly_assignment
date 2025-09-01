import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { MainInterface } from "./components/MainInterface";
import { SocketHandler } from "./services/SocketHandler";

function App() {
  const [user, setUser] = useState<any>(null);
  const [socketManager, setSocketManager] = useState<SocketHandler | null>(
    null
  );

  // When authenticated by backend
  useEffect(() => {
    if (!socketManager) return; // ✅ check instance, not class

    const handleAuthenticated = (userData: any) => {
      console.log("✅ Authenticated:", userData);
      setUser(userData);

      // ask backend for documents
      socketManager.emit("getDocuments");
    };

    socketManager.on("authenticated", handleAuthenticated);

    return () => {
      socketManager.off("authenticated", handleAuthenticated);
    };
  }, [socketManager]);

  // If not logged in, show auth screen
  if (!user) {
    return (
      <AuthScreen
        onAuth={(username: string) => {
          // create socket only after clicking "Join"
          const sh = new SocketHandler(
            import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3001"
          );
          setSocketManager(sh);

          // connect & authenticate
          sh.connect(() => {
            sh.emit("authenticate", { username });
          });
        }}
      />
    );
  }

  return (
    <MainInterface
      username={user.username}
      socketHandler={socketManager!}
      onLogout={() => {
        socketManager?.disconnect();
        setUser(null);
        setSocketManager(null);
      }}
    />
  );
}

export default App;
