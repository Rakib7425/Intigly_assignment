import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { apiService, Document } from "../services/api";
import { CollaborativeEditor } from "../components/CollaborativeEditor";
import { Header } from "../components/Header";
import { CollaborationDemo } from "../components/CollaborationDemo";
import { ArrowLeft, FileText, HelpCircle } from "lucide-react";

export function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("Document ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const doc = await apiService.getDocument(parseInt(id));
        setDocument(doc);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Document not found
            </h3>
            <p className="text-gray-600 mb-4">
              The document you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <button
              onClick={handleBackToHome}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </button>

          <button
            onClick={() => setShowDemo(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            How to Collaborate
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Created by{" "}
              {document.createdByUsername || document.created_by_username}
            </p>
          </div>

          <div className="p-6">
            <CollaborativeEditor
              documentId={document.id}
              initialContent={document.content}
              documentTitle={document.title}
            />
          </div>
        </div>
      </div>

      {/* Collaboration Demo Modal */}
      {showDemo && <CollaborationDemo onClose={() => setShowDemo(false)} />}
    </div>
  );
}
