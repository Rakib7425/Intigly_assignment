import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Plus, FileText, LogOut, Users, Clock, Search } from "lucide-react";

interface DocumentListProps {
  documents: any[];
  username: string;
  onCreateDocument: (title: string) => void;
  onOpenDocument: (documentId: number) => void;
  onLogout: () => void;
}

export default function DocumentList({
  documents,
  username,
  onCreateDocument,
  onOpenDocument,
  onLogout,
}: DocumentListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Debounce effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreateDocument(newTitle.trim());
      setNewTitle("");
      setShowCreateForm(false);
    }
  };

  const capitalize = useCallback((str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getAvatarColor = (index: number) => {
    const colors = [
      "rgba(243, 35, 35, 1)",
      "rgba(20, 186, 81, 1)",
      "rgba(109, 51, 244, 1)",
    ];
    return colors[index % colors.length];
  };

  // Filter documents by debounced search
  const filteredDocs = useMemo(() => {
    if (!debouncedTerm) return documents;
    const term = debouncedTerm.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title?.toLowerCase().includes(term) ||
        doc.content?.toLowerCase().includes(term)
    );
  }, [debouncedTerm, documents]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CollabDocs</h1>
            <p className="text-gray-600">Welcome, {username}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Create Document Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create New Document
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTitle("");
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="topSection flex items-center justify-between gap-4 p-6 ">
        <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>

        {/* Search Box with Icon */}
        <div className="relative w-2/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-6">
        {!filteredDocs.length ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents found</p>
            <p className="text-sm text-gray-400">
              Try creating a new one or adjusting your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc.id)}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {doc.title || "untitled"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by{" "}
                        <span className="text-[limegreen] font-semibold">
                          {doc.createdByUsername
                            ? capitalize(doc.createdByUsername)
                            : doc.createdBy
                            ? capitalize(doc.createdBy)
                            : "Unknown"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {doc.content || "No content available"}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{doc.collaborators?.length || 3}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-1">
                    {(doc.collaborators || ["R", "S", "M"]).map(
                      (collaborator: string, i: number) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                          style={{
                            backgroundColor: getAvatarColor(i),
                            zIndex: 10 - i,
                          }}
                        >
                          {collaborator[0]?.toUpperCase() || "R"}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
