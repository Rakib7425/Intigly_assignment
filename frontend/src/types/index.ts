export interface User {
  username: string;
  isActive: boolean;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  document_id: number;
  username: string;
  message: string;
  created_at: string;
}

export interface CursorPosition {
  position: number;
  timestamp: number;
}

export interface DocumentData {
  document: Document;
  messages: ChatMessage[];
  presentUsers: string[];
}
