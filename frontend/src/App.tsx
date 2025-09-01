import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { MainInterface } from "./components/MainInterface";
import { SocketManager } from "./services/SocketManager.ts";

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [socketManager, setSocketManager] = useState<SocketManager | null>(
    null
  );
  useEffect(() => {
    if (user) {
      const sm = new SocketManager();
      sm.connect(user)
        .then(() => {
          setSocketManager(sm);
          console.log("Socket connected successfully");
        })
        .catch((error) => {
          console.error("Failed to connect socket:", error);
          setUser(null); // Reset auth on connection failure
        });

      return () => {
        sm.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const sm = new SocketManager();
      sm.connect(user);
      setSocketManager(sm);

      return () => {
        sm.disconnect();
      };
    }
  }, [user]);

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  return (
    <MainInterface
      username={user}
      socketManager={socketManager!}
      onLogout={() => {
        socketManager?.disconnect();
        setUser(null);
        setSocketManager(null);
      }}
    />
  );
}

export default App;
