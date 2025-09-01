import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { SocketManager } from "../services/SocketManager";

interface DocumentEditorProps {
  document: any;
  username: string;
  socketManager: SocketManager;
  onClose: () => void;
}

export function DocumentEditor({
  document,
  username,
  socketManager,
  onClose,
}: DocumentEditorProps) {
  const [content, setContent] = useState(document.document.content);
  const [messages, setMessages] = useState(document.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [presentUsers, setPresentUsers] = useState<string[]>(
    document.presentUsers || []
  );
  const [cursors, setCursors] = useState<any>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up document-specific socket listeners
    socketManager.on("documentUpdate", (data) => {
      if (data.author !== username) {
        setContent(data.content);
      }
    });

    socketManager.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketManager.on("userJoined", (data) => {
      setPresentUsers(data.presentUsers);
    });

    socketManager.on("userLeft", (data) => {
      setPresentUsers(data.presentUsers);
    });

    socketManager.on("cursorsUpdate", (cursorData) => {
      setCursors(cursorData);
    });

    return () => {
      socketManager.removeAllListeners();
    };
  }, [socketManager, username]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setContent(newContent);

    socketManager.emit("documentEdit", {
      documentId: document.document.id,
      content: newContent,
      cursorPosition,
    });
  };

  const handleCursorMove = () => {
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart;
      socketManager.emit("documentEdit", {
        documentId: document.document.id,
        content,
        cursorPosition,
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketManager.emit("sendMessage", {
        documentId: document.document.id,
        message: newMessage.trim(),
      });
      setNewMessage("");
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {document.document.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {presentUsers.length} user{presentUsers.length !== 1 ? "s" : ""}{" "}
                editing
                {presentUsers.length > 0 && (
                  <span className="ml-2">
                    {presentUsers.slice(0, 3).join(", ")}
                    {presentUsers.length > 3 &&
                      ` +${presentUsers.length - 3} more`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-lg border border-gray-200 p-6 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleCursorMove}
              onKeyUp={handleCursorMove}
              className="w-full h-full resize-none border-none outline-none text-gray-900 leading-relaxed"
              placeholder="Start writing your document..."
            />

            {/* Live Cursors */}
            {Object.entries(cursors).map(([user, data]: [string, any]) => {
              if (user === username) return null;

              return (
                <div
                  key={user}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${Math.floor(data.position / 80) * 24 + 24}px`,
                    left: `${(data.position % 80) * 8 + 24}px`,
                  }}
                >
                  <div className="bg-blue-500 w-0.5 h-5"></div>
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap -mt-1">
                    {user}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Chat</h2>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: any) => (
              <div key={msg.id} className="group">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm text-gray-900">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{msg.message}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
