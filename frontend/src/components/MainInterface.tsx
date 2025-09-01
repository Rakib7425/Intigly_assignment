import { useCallback, useEffect, useMemo, useState } from "react";
import { DocumentList } from "./DocumentList";
import { DocumentEditor } from "./DocumentEditor";
import { ActiveUsers } from "./ActiveUsers";
import { SocketHandler } from "../services/SocketHandler";

interface MainInterfaceProps {
  username: string;
  socketHandler: SocketHandler;
  onLogout: () => void;
}

type Doc = {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  version: number;
  active_participants?: number;
  created_by_username?: string;
};

export function MainInterface({
  username,
  socketHandler,
  onLogout,
}: MainInterfaceProps) {
  const [currentDocument, setCurrentDocument] = useState<Doc | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Helper to safely call socketHandler methods if present
  const safeEmit = useCallback(
    (event: string, payload?: any) => {
      try {
        socketHandler?.emit?.(event, payload);
        console.log("Emitted:", event, payload);
      } catch (err) {
        console.error("emit error", event, err);
      }
    },
    [socketHandler]
  );

  // Stable handlers so off() removes the same reference
  const handleSocketError = useCallback((err: any) => {
    // eslint-disable-next-line no-console
    console.error("Socket error:", err);
  }, []);

  const handleAuthError = useCallback((err: any) => {
    // Could show a toast here
    // eslint-disable-next-line no-console
    console.error("Auth error:", err);
  }, []);

  const handleAuthenticated = useCallback(
    (data: any) => {
      setIsReady(true);
      safeEmit("getDocuments");
      safeEmit("getActiveUsers");
      console.log(data);
    },
    [safeEmit]
  );

  const handleDocuments = useMemo(() => {
    return (docs: Doc[]) => {
      console.log("📄 All documents fetched after auth:", docs);
      setDocuments(docs || []);
    };
  }, []);

  const handleActiveUsers = useCallback((users: string[]) => {
    console.log("Active users updated:", users);
    setActiveUsers(users || []);
  }, []);

  const handleDocumentCreated = useCallback((doc: Doc) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  const handleDocumentJoined = useCallback((payload: any) => {
    // server sends { doc, messages, users, cursors } or similar
    // keep it flexible by storing the doc or the whole payload depending on your editor
    setCurrentDocument(payload);
  }, []);

  useEffect(() => {
    if (!socketHandler) {
      console.log("Socket handler not initialized");
      return;
    }

    // Basic error handlers
    socketHandler.on("error", handleSocketError);
    socketHandler.on("auth:error", handleAuthError);

    // Authenticated + data events
    socketHandler.on("authenticated", handleAuthenticated); // ✅
    socketHandler.on("documents", handleDocuments); // ✅
    socketHandler.on("documentCreated", handleDocumentCreated);
    socketHandler.on("activeUsers", handleActiveUsers);
    socketHandler.on("documentJoined", handleDocumentJoined);

    // If socketHandler is already connected, immediately attempt to authenticate and fetch docs
    // This helps with page reloads / reconnect flows
    if ((socketHandler as any).connected) {
      safeEmit("authenticate", { username });
      safeEmit("getDocuments");
    } else {
      // If not connected yet, you may still want to authenticate once it connects
      socketHandler.on("connect", () => {
        safeEmit("authenticate", { username });
        safeEmit("getDocuments");
      });
    }

    return () => {
      // remove all handlers we added
      socketHandler.off("error", handleSocketError);
      socketHandler.off("auth:error", handleAuthError);
      socketHandler.off("authenticated", handleAuthenticated);
      socketHandler.off("documents", handleDocuments);
      socketHandler.off("documentCreated", handleDocumentCreated);
      socketHandler.off("activeUsers", handleActiveUsers);
      socketHandler.off("documentJoined", handleDocumentJoined);

      // Also remove the temporary connect listener if present
      socketHandler.off("connect");
    };
  }, [
    socketHandler,
    username,
    handleSocketError,
    handleAuthError,
    handleAuthenticated,
    handleDocuments,
    handleDocumentCreated,
    handleActiveUsers,
    handleDocumentJoined,
    safeEmit,
  ]);

  // UI actions
  const handleCreateDocument = useCallback(
    (title: string) => {
      if (!title) return;
      safeEmit("createDocument", { title, username });
    },
    [safeEmit, username]
  );

  const handleOpenDocument = useCallback(
    (documentId: number) => {
      if (documentId == null) return;
      safeEmit("joinDocument", { documentId });
    },
    [safeEmit]
  );

  const handleCloseDocument = useCallback(() => {
    setCurrentDocument(null);
    // Optionally tell server you left the doc (if implemented)
    // safeEmit("leaveDocument", { documentId: currentDocument?.id });
  }, []);

  // Render
  if (currentDocument) {
    return (
      <DocumentEditor
        document={currentDocument}
        username={username}
        socketHandler={socketHandler}
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
            loading={!isReady && documents.length === 0}
          />
        </div>

        <div className="w-80 border-l border-gray-200 bg-white">
          <ActiveUsers users={activeUsers} currentUser={username} />
        </div>
      </div>
    </div>
  );
}
