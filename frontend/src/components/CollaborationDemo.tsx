import React, { useState } from "react";
import { Users, MessageSquare, MousePointer, Zap } from "lucide-react";

interface CollaborationDemoProps {
  onClose: () => void;
}

export function CollaborationDemo({ onClose }: CollaborationDemoProps) {
  const [activeTab, setActiveTab] = useState<"features" | "demo">("features");

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Live Collaborators",
      description:
        "See who's online with real-time presence indicators and user avatars",
    },
    {
      icon: <MousePointer className="h-5 w-5" />,
      title: "Cursor Tracking",
      description:
        "Watch live cursor movements and text selections from other users",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Real-time Chat",
      description:
        "Communicate instantly with typing indicators and quick reactions",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Auto-save",
      description:
        "Changes are automatically saved and synchronized across all users",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              🚀 Collaborative Features
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("features")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "features"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "demo"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              How to Use
            </button>
          </div>

          {activeTab === "features" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Real-time Collaboration
                </h3>
                <p className="text-gray-600">
                  Work together seamlessly with advanced collaborative features
                </p>
              </div>

              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "demo" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How to Collaborate
                </h3>
                <p className="text-gray-600">
                  Follow these steps to start collaborating with others
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Share the Document
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Share the document URL with your collaborators. They can
                      join by opening the same document.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      See Live Activity
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Watch the collaborators panel to see who's online and
                      typing. Cursor movements appear in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Use the Chat
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Click the "Chat" button to open the chat panel. Send
                      messages, reactions, and see typing indicators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Edit Together
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Start typing! Your changes are automatically saved and
                      synchronized with all collaborators.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>
                    • Use different colors to distinguish between collaborators
                  </li>
                  <li>
                    • Chat messages are persistent and saved with the document
                  </li>
                  <li>
                    • Cursor positions update in real-time as users move their
                    mouse
                  </li>
                  <li>
                    • Typing indicators show when someone is actively editing
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
