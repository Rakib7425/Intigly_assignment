import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useMyPresence,
  useRoom,
} from "@liveblocks/react";
import { apiService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { Users, MessageSquare } from "lucide-react";
import { EnhancedChatPanel } from "./EnhancedChatPanel";

interface CollaborativeEditorProps {
  documentId: number;
  initialContent: string;
  documentTitle: string;
}

// (Legacy ChatPanel removed)

// Collaborators panel component
function CollaboratorsPanel() {
  const others = useOthers();
  const [myPresence] = useMyPresence();
  const { user } = useAuthStore();

  const allUsers = [
    {
      id: "me",
      name: user?.username || "Anonymous",
      color: (myPresence?.user as any)?.color || "#6b7280",
      isTyping: myPresence?.isTyping || false,
      isOnline: true,
    },
    ...others.map(({ connectionId, presence }) => ({
      id: connectionId,
      name: (presence?.user as any)?.name || "Anonymous",
      color: (presence?.user as any)?.color || "#6b7280",
      isTyping: presence?.isTyping || false,
      isOnline: true,
    })),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-3 border-b border-gray-200 flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-sm text-gray-900">
          Collaborators ({allUsers.length})
        </span>
      </div>

      <div className="p-3 space-y-3">
        {allUsers.map((collaborator) => (
          <div key={collaborator.id} className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  collaborator.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {collaborator.name}
                  {collaborator.id === "me" && " (You)"}
                </span>
                {collaborator.isTyping && (
                  <span className="text-xs text-blue-600 animate-pulse">
                    typing...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    collaborator.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {collaborator.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Liveblocks room component
function EditorContent({
  documentId,
  initialContent,
}: {
  documentId: number;
  initialContent: string;
}) {
  // Shared document content via Liveblocks storage
  const content = useStorage(
    (root) => (root as any).get?.("content") as string | undefined
  );
  const setContentInStorage = useMutation(({ storage }, newValue: string) => {
    storage.set("content", newValue);
  }, []);

  // Local mirror for textarea controlled input to avoid uncontrolled flickers
  const [localContent, setLocalContent] = useState(initialContent);
  const [storageReady, setStorageReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const { user } = useAuthStore();

  // Update presence when user starts typing
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      if (storageReady) {
        setContentInStorage(newContent);
      }

      // Update presence with precise caret
      const textarea = textareaRef.current;
      if (textarea) {
        const { x, y } = computeCaretCoordinates(
          textarea,
          textarea.selectionStart || 0
        );
        updateMyPresence({ cursor: { x, y }, isTyping: true });
        window.setTimeout(() => {
          updateMyPresence({ isTyping: false });
        }, 1000);
      } else {
        updateMyPresence({ isTyping: true });
        window.setTimeout(() => updateMyPresence({ isTyping: false }), 1000);
      }
    },
    [storageReady, setContentInStorage, updateMyPresence]
  );

  // Handle cursor movement and selection
  const handleCursorMove = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      updateMyPresence({
        cursor: { x, y },
      });
    },
    [updateMyPresence]
  );

  // Compute exact caret coordinates inside a textarea
  const computeCaretCoordinates = (
    textarea: HTMLTextAreaElement,
    selectionIndex: number
  ) => {
    const div = document.createElement("div");
    const style = getComputedStyle(textarea);
    // Mirror textarea styles that affect layout
    const properties = [
      "boxSizing",
      "width",
      "height",
      "overflowX",
      "overflowY",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontStyle",
      "fontVariant",
      "fontWeight",
      "fontStretch",
      "fontSize",
      "fontFamily",
      "lineHeight",
      "letterSpacing",
      "textTransform",
      "textAlign",
      "textIndent",
      "whiteSpace",
    ];
    properties.forEach((prop) => {
      (div.style as any)[prop] = (style as any)[prop];
    });
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    // Split content into before caret and after caret
    const value = textarea.value.substring(0, selectionIndex);
    const span = document.createElement("span");
    span.textContent = textarea.value.substring(selectionIndex) || "."; // placeholder to get box
    div.textContent = value;
    div.appendChild(span);
    document.body.appendChild(div);
    const rect = span.getBoundingClientRect();
    const base = textarea.getBoundingClientRect();
    const x = rect.left - base.left;
    const y = rect.top - base.top;
    document.body.removeChild(div);
    return { x, y };
  };

  const handleSelectionChange = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        // User is selecting text
        updateMyPresence({
          selection: { start, end },
        });
      } else {
        // User has a cursor position
        const { x, y } = computeCaretCoordinates(textarea, start);
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [updateMyPresence]
  );

  // Save document content
  const saveDocument = useCallback(
    async (newContent: string) => {
      try {
        setIsSaving(true);
        await apiService.updateDocument(documentId, { content: newContent });
      } catch (error) {
        console.error("Failed to save document:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [documentId]
  );

  // Debounced save
  // Keep localContent in sync with shared storage when others edit
  useEffect(() => {
    if (typeof content === "string") {
      setLocalContent(content);
    }
  }, [content]);

  // Debounced autosave based on shared content
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (storageReady && typeof content === "string") {
        saveDocument(content);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, saveDocument, storageReady]);

  // Initialize storage once loaded
  const room = useRoom();
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { root } = await room.getStorage();
        if (!alive) return;
        if (!(root as any).get("content")) {
          (root as any).set("content", initialContent);
        }
        if (!(root as any).get("messages")) {
          (root as any).set("messages", []);
        }
        setStorageReady(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Storage init failed", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [room, initialContent]);

  // Set initial presence
  useEffect(() => {
    updateMyPresence({
      user: {
        name: user?.username || "Anonymous",
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      },
    });
  }, [updateMyPresence, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main editor area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {others.length + 1} user{others.length !== 0 ? "s" : ""} online
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showChat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
        </div>

        {/* Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onMouseMove={handleCursorMove}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            onFocus={handleSelectionChange}
            placeholder="Start writing your document..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
          />

          {/* Cursor indicators for other users */}
          {others.map(({ connectionId, presence }) => {
            if (!presence?.cursor) return null;
            const cursor = presence.cursor as any;
            const user = presence.user as any;

            return (
              <div
                key={connectionId}
                className="absolute pointer-events-none z-10 transition-all duration-150"
                style={{
                  left: cursor.x,
                  top: cursor.y,
                }}
              >
                {/* Cursor line */}
                <div
                  className="w-0.5 h-6 animate-pulse"
                  style={{ backgroundColor: user?.color || "#6b7280" }}
                />

                {/* User label */}
                <div
                  className="absolute -top-8 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: user?.color || "#6b7280" }}
                >
                  {user?.name || "Anonymous"}
                  {presence.isTyping && (
                    <span className="ml-1 animate-pulse">✏️</span>
                  )}
                </div>

                {/* Selection indicator */}
                {presence.selection && (
                  <div
                    className="absolute top-0 left-0 w-full h-6 opacity-20 rounded"
                    style={{
                      backgroundColor: user?.color || "#6b7280",
                    }}
                  />
                )}
              </div>
            );
          })}

          {isSaving && (
            <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
              Saving...
            </div>
          )}
        </div>

        {/* Document stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{(localContent || "").length} characters</span>
          <span>
            {
              (localContent || "")
                .split(/\s+/)
                .filter((word) => word.length > 0).length
            }{" "}
            words
          </span>
        </div>

        {/* Chat panel (when enabled) */}
        {showChat && (
          <div className="lg:hidden">
            <EnhancedChatPanel documentId={documentId} />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <CollaboratorsPanel />
        {showChat && (
          <div className="hidden lg:block">
            <EnhancedChatPanel documentId={documentId} />
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Liveblocks provider
export function CollaborativeEditor({
  documentId,
  initialContent,
  documentTitle: _documentTitle,
}: CollaborativeEditorProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Authorize with Liveblocks
        await apiService.authorizeLiveblocks(`document-${documentId}`);
      } catch (err) {
        console.error("Failed to connect to Liveblocks:", err);
        setError("Failed to connect to collaborative features");
      } finally {
        setIsConnecting(false);
      }
    };

    connectToRoom();
  }, [documentId]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          Connecting to collaborative features...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-1">
          You can still edit the document, but real-time collaboration is
          unavailable.
        </p>
      </div>
    );
  }

  return (
    <RoomProvider
      id={`document-${documentId}`}
      initialPresence={{
        user: {
          name: user?.username || "Anonymous",
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        },
        cursor: null,
        isTyping: false,
      }}
    >
      <EditorContent documentId={documentId} initialContent={initialContent} />
    </RoomProvider>
  );
}
