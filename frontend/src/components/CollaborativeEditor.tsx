import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useMyPresence,
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

// Chat component with Liveblocks storage (legacy - not used)
function ChatPanel() {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Use Liveblocks storage for persistent chat messages
  const messages = useStorage((root) => root.messages || []);
  const addMessage = useMutation(({ storage }, message: any) => {
    const messages = storage.get("messages") || [];
    if (Array.isArray(messages)) {
      messages.push(message);
      storage.set("messages", messages);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now().toString(),
      user: user.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    };

    addMessage(message);
    setNewMessage("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-80 flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-sm text-gray-900">Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!messages || messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          Array.isArray(messages) &&
          messages.map((msg: any) => (
            <div key={msg.id} className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: msg.color }}
                />
                <span className="text-xs font-medium text-gray-700">
                  {msg.user}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-900 ml-4">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

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
  const [content, setContent] = useState(initialContent);
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
      setContent(newContent);

      // Update presence to show user is typing
      updateMyPresence({
        cursor: { x: 0, y: 0 },
        isTyping: true,
      });

      // Clear typing status after a delay
      setTimeout(() => {
        updateMyPresence({
          isTyping: false,
        });
      }, 1000);
    },
    [updateMyPresence]
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
        updateMyPresence({
          cursor: { x: 0, y: 0 }, // Will be updated by mouse move
        });
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
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content !== initialContent) {
        saveDocument(content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, initialContent, saveDocument]);

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
            value={content}
            onChange={handleContentChange}
            onMouseMove={handleCursorMove}
            onSelect={handleSelectionChange}
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
          <span>{content.length} characters</span>
          <span>
            {content.split(/\s+/).filter((word) => word.length > 0).length}{" "}
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
