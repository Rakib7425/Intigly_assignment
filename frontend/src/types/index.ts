import type { SocketManager } from "../services/SocketManager";

export interface User {
  id: number;
  username: string;
  created_at: string;
  last_seen: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  version: number;
  active_participants?: number;
  created_by_username?: string;
}

export interface ChatMessage {
  id: number;
  document_id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ConnectionStatus {
  connected: boolean;
  connecting?: boolean;
  reconnected?: boolean;
  reconnectFailed?: boolean;
  error?: string;
  reason?: string;
  attempt?: number;
}

export interface DocumentJoinedData {
  doc: Document;
  messages: ChatMessage[];
  users: string[];
  cursors: Record<string, CursorPosition>;
}

export interface DocumentUpdateData {
  content: string;
  version: number;
  author: string;
}

export interface PresenceUpdateData {
  users: string[];
}

export interface ErrorResponse {
  message: string;
  code?: string;
}

// Socket event types
export interface ServerToClientEvents {
  authenticated: (user: User) => void;
  "auth:error": (error: ErrorResponse) => void;

  // Document events
  documents: (documents: Document[]) => void;
  documentCreated: (document: Document) => void;
  documentJoined: (data: DocumentJoinedData) => void;
  documentUpdate: (data: DocumentUpdateData) => void;
  documentSynced: (data: DocumentJoinedData) => void;
  "documents:updated": () => void;

  // Presence events
  activeUsers: (users: string[]) => void;
  "presence:update": (data: PresenceUpdateData) => void;
  cursorsUpdate: (cursors: Record<string, CursorPosition>) => void;

  // Chat events
  "chat:new": (message: ChatMessage) => void;

  // Typing events
  "typing:start": (data: { username: string; type: "editor" | "chat" }) => void;
  "typing:stop": (data: { username: string; type: "editor" | "chat" }) => void;

  // Error and conflict events
  error: (error: ErrorResponse) => void;
  conflict: (data: { message: string; version?: number }) => void;
}

export interface ClientToServerEvents {
  authenticate: (data: { username: string }) => void;

  createDocument: (data: { title: string }) => void;
  getDocuments: () => void;
  joinDocument: (data: { documentId: number }) => void;
  leaveDocument: (data: { documentId: number }) => void;
  reconnect: (data: { documentId: number }) => void;

  documentEdit: (data: {
    documentId: number;
    content: string;
    cursor?: CursorPosition;
    version?: number;
  }) => void;
  cursorMove: (data: { documentId: number; cursor: CursorPosition }) => void;

  // Chat
  sendMessage: (data: { documentId: number; message: string }) => void;

  // Typing indicators
  "typing:start": (data: {
    documentId: number;
    type?: "editor" | "chat";
  }) => void;
  "typing:stop": (data: {
    documentId: number;
    type?: "editor" | "chat";
  }) => void;
}

export interface SocketData {
  userId?: number;
  username?: string;
  currentDocumentId?: number;
}

// Component prop types
export interface DocumentEditorProps {
  socketManager: SocketManager;
  document: Document;
  currentUser: string;
  onBack: () => void;
}

// Export SocketManager
export { SocketManager } from "../services/SocketManager";
