'use client';
import { useEffect, useState } from 'react';
import { FileMeta } from '@/lib/contracts';
import { withRetry } from '@/lib/retry';

export default function FilesPage() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: string) => {
    setDeleting(id);
    try {
      await withRetry(async () => {
        const response = await fetch(`/api/files?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete file: ${response.statusText}`);
        }
      });
      
      // Remove from local state
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Files</h1>
          <button 
            onClick={fetchFiles}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          📁 Your uploads are persistent and private. Files are stored securely per-user.
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No files uploaded yet.</p>
            <p className="text-sm mt-2">Files you upload will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} total
            </div>
            
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="border rounded p-3 hover:bg-gray-50 stack-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Size: {formatFileSize(file.size)}</div>
                        <div>Type: {file.mime || 'Unknown'}</div>
                        <div>Uploaded: {formatDate(file.created_at)}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteFile(file.id)}
                      disabled={deleting === file.id}
                      className="px-3 py-1 text-sm border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      {deleting === file.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}