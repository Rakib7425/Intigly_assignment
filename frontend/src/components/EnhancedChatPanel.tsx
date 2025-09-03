import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useStorage,
  useMutation,
  useOthers,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { useAuthStore } from "../stores/authStore";
import { MessageSquare, Send, Users, Smile } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  color: string;
  type: "message" | "system";
}

interface EnhancedChatPanelProps {
  documentId: number;
}

export function EnhancedChatPanel({
  documentId: _documentId,
}: EnhancedChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useAuthStore();

  // Liveblocks hooks
  const messages = useStorage((root) => root.messages || []);
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  // Mutations
  const addMessage = useMutation(({ storage }, message: ChatMessage) => {
    const messages = storage.get("messages") || [];
    if (Array.isArray(messages)) {
      messages.push(message);
      storage.set("messages", messages);
    }
  }, []);

  const addSystemMessage = useMutation(({ storage }, message: string) => {
    const messages = storage.get("messages") || [];
    if (Array.isArray(messages)) {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        user: "System",
        message,
        timestamp: new Date().toISOString(),
        color: "#6b7280",
        type: "system",
      };
      messages.push(systemMessage);
      storage.set("messages", messages);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      updateMyPresence({ isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateMyPresence({ isTyping: false });
    }, 1000);
  }, [isTyping, updateMyPresence]);

  // Get typing users
  const typingUsers = others
    .filter((other) => other.presence?.isTyping)
    .map((other) => (other.presence?.user as any)?.name || "Anonymous");

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: user.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      type: "message",
    };

    addMessage(message);
    setNewMessage("");
    setIsTyping(false);
    updateMyPresence({ isTyping: false });
  };

  // Handle Enter key (send) vs Shift+Enter (new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Quick reactions
  const quickReactions = ["👍", "👎", "❤️", "😂", "😮", "😢"];
  const sendReaction = (reaction: string) => {
    if (!user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: user.username,
      message: reaction,
      timestamp: new Date().toISOString(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      type: "message",
    };

    addMessage(message);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-96 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-900">Chat</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-500">{others.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs">Start the conversation!</p>
          </div>
        ) : (
          Array.isArray(messages) &&
          messages.map((msg: ChatMessage) => (
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
              <p
                className={`text-sm ml-4 ${
                  msg.type === "system"
                    ? "text-gray-500 italic"
                    : "text-gray-900"
                }`}
              >
                {msg.message}
              </p>
            </div>
          ))
        )}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
              <div
                className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick reactions */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Smile className="h-3 w-3 text-gray-400" />
          <div className="flex gap-1">
            {quickReactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => sendReaction(reaction)}
                className="text-sm hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                title={`Send ${reaction}`}
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200"
      >
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-20"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message (Enter)"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
