import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3001";

export interface Document {
  id: number;
  title: string;
  content: string;
  server_version: number;
  created_by: string;
  created_by_username: string;
  createdBy: string;
  createdByUsername: string;
  IsOnlineUserWhoCreatedTheDocument?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentRequest {
  title: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const { getAuthHeaders } = useAuthStore.getState();
    return getAuthHeaders();
  }

  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    return response.json();
  }

  async getDocument(id: number): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Document not found");
      }
      throw new Error("Failed to fetch document");
    }

    return response.json();
  }

  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create document");
    }

    return response.json();
  }

  async updateDocument(
    id: number,
    data: UpdateDocumentRequest
  ): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Document not found");
      }
      throw new Error("Failed to update document");
    }

    return response.json();
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Document not found");
      }
      throw new Error("Failed to delete document");
    }
  }

  async authorizeLiveblocks(room: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/liveblocks/authorize`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ room }),
    });

    if (!response.ok) {
      throw new Error("Failed to authorize Liveblocks");
    }

    return response.json();
  }
}

export const apiService = new ApiService();
