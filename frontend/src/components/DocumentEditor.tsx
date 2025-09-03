import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  socketHandler,
  Document,
  ChatMessage,
  CursorPosition,
  SocketHandler,
} from "../types/index.ts";

interface DocumentEditorProps {
  socketHandler: SocketHandler;
  document: Document;
  currentUser: string;
  onBack: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  socketHandler,
  document,
  currentUser,
  onBack,
}) => {
  const [content, setContent] = useState(document.content || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [chatTyping, setChatTyping] = useState<Record<string, boolean>>({});
  const [showChat, setShowChat] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ connected: true });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const chatTypingTimeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef(content);
  const versionRef = useRef(document.version);

  // Update refs when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    versionRef.current = document.version;
  }, [document.version]);

  // Socket event handlers
  useEffect(() => {
    const handleDocumentUpdate = ({
      content: newContent,
      version,
      author,
    }: any) => {
      if (author !== currentUser) {
        setContent(newContent);
        versionRef.current = version;
      }
    };

    const handleChatMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // Scroll to bottom of chat
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    };

    const handlePresenceUpdate = ({ users }: { users: string[] }) => {
      setActiveUsers(users);
    };

    const handleCursorsUpdate = (
      newCursors: Record<string, CursorPosition>
    ) => {
      // Remove current user's cursor from display
      const { [currentUser]: _, ...otherCursors } = newCursors;
      setCursors(otherCursors);
    };

    const handleTypingStart = ({
      username,
      type,
    }: {
      username: string;
      type: string;
    }) => {
      if (username !== currentUser) {
        if (type === "chat") {
          setChatTyping((prev) => ({ ...prev, [username]: true }));
          setTimeout(() => {
            setChatTyping((prev) => ({ ...prev, [username]: false }));
          }, 3000);
        } else {
          setIsTyping((prev) => ({ ...prev, [username]: true }));
          setTimeout(() => {
            setIsTyping((prev) => ({ ...prev, [username]: false }));
          }, 2000);
        }
      }
    };

    const handleTypingStop = ({
      username,
      type,
    }: {
      username: string;
      type: string;
    }) => {
      if (username !== currentUser) {
        if (type === "chat") {
          setChatTyping((prev) => ({ ...prev, [username]: false }));
        } else {
          setIsTyping((prev) => ({ ...prev, [username]: false }));
        }
      }
    };

    const handleConnectionStatus = (status: any) => {
      setConnectionStatus(status);
    };

    const handleConflict = ({ message }: { message: string }) => {
      alert(
        `Conflict detected: ${message}. Please refresh to get the latest version.`
      );
    };

    const handleDocumentSynced = ({
      doc,
      users,
      cursors: syncedCursors,
    }: any) => {
      setContent(doc.content);
      versionRef.current = doc.version;
      setActiveUsers(users);
      const { [currentUser]: _, ...otherCursors } = syncedCursors;
      setCursors(otherCursors);
    };

    // Subscribe to events
    socketHandler.on("documentUpdate", handleDocumentUpdate);
    socketHandler.on("chat:new", handleChatMessage);
    socketHandler.on("presence:update", handlePresenceUpdate);
    socketHandler.on("cursorsUpdate", handleCursorsUpdate);
    socketHandler.on("typing:start", handleTypingStart);
    socketHandler.on("typing:stop", handleTypingStop);
    socketHandler.on("connectionStatus", handleConnectionStatus);
    socketHandler.on("conflict", handleConflict);
    socketHandler.on("documentSynced", handleDocumentSynced);

    // Set current document for reconnection
    socketHandler.setCurrentDocument(document.id.toString());

    return () => {
      socketHandler.off("documentUpdate", handleDocumentUpdate);
      socketHandler.off("chat:new", handleChatMessage);
      socketHandler.off("presence:update", handlePresenceUpdate);
      socketHandler.off("cursorsUpdate", handleCursorsUpdate);
      socketHandler.off("typing:start", handleTypingStart);
      socketHandler.off("typing:stop", handleTypingStop);
      socketHandler.off("connectionStatus", handleConnectionStatus);
      socketHandler.off("conflict", handleConflict);
      socketHandler.off("documentSynced", handleDocumentSynced);

      // Leave document when component unmounts
      socketHandler.emit("leaveDocument", { documentId: document.id });
      socketHandler.setCurrentDocument(null);
    };
  }, [socketHandler, document.id, currentUser]);

  // Load initial data
  useEffect(() => {
    const handleDocumentJoined = ({
      doc,
      messages: initialMessages,
      users,
      cursors: initialCursors,
    }: any) => {
      setContent(doc.content);
      setMessages(initialMessages);
      setActiveUsers(users);
      versionRef.current = doc.version;

      // Remove current user's cursor
      const { [currentUser]: _, ...otherCursors } = initialCursors;
      setCursors(otherCursors);
    };

    socketHandler.on("documentJoined", handleDocumentJoined);
    socketHandler.emit("joinDocument", { documentId: document.id });

    return () => {
      socketHandler.off("documentJoined", handleDocumentJoined);
    };
  }, [socketHandler, document.id, currentUser]);

  // Handle content changes
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      const textarea = e.target;

      setContent(newContent);

      // Get cursor position
      const cursor: CursorPosition = {
        line:
          textarea.value.substr(0, textarea.selectionStart).split("\n").length -
          1,
        column:
          textarea.selectionStart -
          textarea.value.lastIndexOf("\n", textarea.selectionStart - 1) -
          1,
      };

      // Emit typing indicator
      socketHandler.emit("typing:start", {
        documentId: document.id,
        type: "editor",
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketHandler.emit("typing:stop", {
          documentId: document.id,
          type: "editor",
        });
      }, 1000);

      // Debounce document updates
      const timeoutId = setTimeout(() => {
        socketHandler.emit("documentEdit", {
          documentId: document.id,
          content: newContent,
          cursor,
          version: versionRef.current,
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [socketHandler, document.id]
  );

  // Handle cursor movement without content change
  const handleCursorMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLTextAreaElement>
        | React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      const textarea = e.currentTarget;

      const cursor: CursorPosition = {
        line:
          textarea.value.substr(0, textarea.selectionStart).split("\n").length -
          1,
        column:
          textarea.selectionStart -
          textarea.value.lastIndexOf("\n", textarea.selectionStart - 1) -
          1,
      };

      // Add selection if there is one
      if (textarea.selectionStart !== textarea.selectionEnd) {
        const selectionEnd = textarea.selectionEnd;
        cursor.selection = {
          start: cursor,
          end: {
            line: textarea.value.substr(0, selectionEnd).split("\n").length - 1,
            column:
              selectionEnd -
              textarea.value.lastIndexOf("\n", selectionEnd - 1) -
              1,
          },
        };
      }

      socketHandler.emit("cursorMove", { documentId: document.id, cursor });
    },
    [socketHandler, document.id]
  );

  // Handle chat message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketHandler.emit("sendMessage", {
        documentId: document.id,
        message: newMessage.trim(),
      });
      setNewMessage("");
    }
  };

  // Handle chat typing
  const handleChatTyping = useCallback(() => {
    socketHandler.emit("typing:start", {
      documentId: document.id,
      type: "chat",
    });

    if (chatTypingTimeoutRef.current) {
      clearTimeout(chatTypingTimeoutRef.current);
    }

    chatTypingTimeoutRef.current = setTimeout(() => {
      socketHandler.emit("typing:stop", {
        documentId: document.id,
        type: "chat",
      });
    }, 1000);
  }, [socketHandler, document.id]);

  // Render cursor overlays (simplified version)
  const renderCursors = () => {
    return Object.entries(cursors).map(([username, cursor]) => (
      <div
        key={username}
        className="absolute bg-blue-500 opacity-50 pointer-events-none"
        style={{
          top: `${cursor.line * 20}px`, // Approximate line height
          left: `${cursor.column * 8}px`, // Approximate character width
          width: "2px",
          height: "20px",
        }}
      >
        <span className="absolute -top-6 left-0 bg-blue-500 text-white px-1 py-0.5 text-xs rounded">
          {username}
        </span>
      </div>
    ));
  };

  const getTypingUsers = () => {
    return Object.entries(isTyping)
      .filter(([_, typing]) => typing)
      .map(([username]) => username);
  };

  const getChatTypingUsers = () => {
    return Object.entries(chatTyping)
      .filter(([_, typing]) => typing)
      .map(([username]) => username);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Documents
          </button>
          <h1 className="text-xl font-semibold">{document.title}</h1>
          {!connectionStatus.connected && (
            <span className="text-red-500 text-sm">
              {connectionStatus.reconnectFailed
                ? "Connection failed"
                : "Reconnecting..."}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Active users */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active users:</span>
            <div className="flex space-x-1">
              {activeUsers.map((user) => (
                <span
                  key={user}
                  className={`px-2 py-1 text-xs rounded-full ${
                    user === currentUser
                      ? "bg-green-200 text-green-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {user} {user === currentUser && "(you)"}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              onKeyUp={handleCursorMove}
              onMouseUp={handleCursorMove}
              className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none"
              placeholder="Start typing your document..."
            />
            {/* Cursor overlays */}
            <div className="absolute top-4 left-4 pointer-events-none">
              {renderCursors()}
            </div>
          </div>

          {/* Typing indicator */}
          {getTypingUsers().length > 0 && (
            <div className="px-4 py-2 bg-yellow-50 border-t text-sm text-gray-600">
              <span className="italic">
                {getTypingUsers().join(", ")}{" "}
                {getTypingUsers().length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold">Document Chat</h3>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded max-w-xs ${
                    message.username === currentUser
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-200"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.username} •{" "}
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                  <div className="text-sm">{message.message}</div>
                </div>
              ))}

              {/* Chat typing indicator */}
              {getChatTypingUsers().length > 0 && (
                <div className="text-xs text-gray-500 italic">
                  {getChatTypingUsers().join(", ")}{" "}
                  {getChatTypingUsers().length === 1 ? "is" : "are"} typing...
                </div>
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleChatTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
