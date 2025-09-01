import { User, Circle } from "lucide-react";

interface ActiveUsersProps {
  users: string[];
  currentUser: string;
}

export function ActiveUsers({ users, currentUser }: ActiveUsersProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4" />
          Active Users ({users.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                user === currentUser
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.charAt(0).toUpperCase()}
                </div>
                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user}
                  {user === currentUser && (
                    <span className="text-xs text-blue-600 ml-2">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No active users</p>
          </div>
        )}
      </div>
    </div>
  );
}
