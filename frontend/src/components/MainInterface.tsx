import { useState, useEffect } from "react";
import { DocumentList } from "./DocumentList";
import { DocumentEditor } from "./DocumentEditor";
import { ActiveUsers } from "./ActiveUsers";
import { SocketManager } from "../services/SocketManager";

interface MainInterfaceProps {
  username: string;
  socketManager: SocketManager;
  onLogout: () => void;
}

export function MainInterface({
  username,
  socketManager,
  onLogout,
}: MainInterfaceProps) {
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socketManager) return;

    const onError = (error: any) => {
      console.error("Socket error:", error);
    };

    socketManager.on("error", onError);
    socketManager.on("auth:error", onError);

    return () => {
      socketManager.off("error", onError);
      socketManager.off("auth:error", onError);
    };
  }, [socketManager]);

  useEffect(() => {
    const onAuth = () => {
      console.log("first");
    };
    const onDocs = (docs: any[]) => setDocuments(docs);
    const onDocCreated = (doc: any) => setDocuments((prev) => [doc, ...prev]);
    const onActiveUsers = (users: string[]) => setActiveUsers(users);
    const onJoined = (data: any) => setCurrentDocument(data);

    socketManager.on("authenticated", onAuth);
    socketManager.on("documents", onDocs);
    socketManager.on("documentCreated", onDocCreated);
    socketManager.on("activeUsers", onActiveUsers);
    socketManager.on("documentJoined", onJoined);

    return () => {
      socketManager.off("authenticated", onAuth);
      socketManager.off("documents", onDocs);
      socketManager.off("documentCreated", onDocCreated);
      socketManager.off("activeUsers", onActiveUsers);
      socketManager.off("documentJoined", onJoined);
    };
  }, [socketManager]);

  const handleCreateDocument = (title: string) => {
    socketManager.emit("createDocument", { title }); // ✅ send object
  };

  const handleOpenDocument = (documentId: number) => {
    socketManager.emit("joinDocument", { documentId }); // ✅ send object
  };

  const handleCloseDocument = () => {
    setCurrentDocument(null);
  };

  if (currentDocument) {
    return (
      <DocumentEditor
        document={currentDocument}
        username={username}
        socketManager={socketManager}
        onClose={handleCloseDocument}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <DocumentList
            documents={documents}
            username={username}
            onCreateDocument={handleCreateDocument}
            onOpenDocument={handleOpenDocument}
            onLogout={onLogout}
          />
        </div>
        <div className="w-80 border-l border-gray-200 bg-white">
          <ActiveUsers users={activeUsers} currentUser={username} />
        </div>
      </div>
    </div>
  );
}
