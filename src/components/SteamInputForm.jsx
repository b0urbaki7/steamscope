import React from 'react';
import { Loader2, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SteamInputForm = ({ 
  steamInput, 
  setSteamInput, 
  loading, 
  error, 
  fetchLibrary 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form onSubmit={fetchLibrary} className="space-y-4">
        <div>
          <label htmlFor="steamInput" className="block text-sm font-medium mb-2 dark:text-gray-200">
            Steam ID or Vanity URL
          </label>
          <div className="space-y-2">
            <input
              id="steamInput"
              type="text"
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              placeholder="Enter Steam64 ID or vanity URL"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Steam64 ID or custom URL name (e.g., 76561198141342345 or b0urbaki7)
            </p>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Reading Your Gaming Fortune...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <User className="mr-2" size={16} />
              Analyze My Library
            </span>
          )}
        </button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SteamInputForm;