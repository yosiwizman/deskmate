'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import QuickActions from './(components)/QuickActions';
import { TaskKind } from '@/lib/contracts';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const handleTaskStart = (kind: TaskKind) => {
    console.log('Task started:', kind);
    // Here you could add additional logic like showing a notification
    // or redirecting to a task status page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-4 border-gray-200 border-t-blue-600 rounded-full w-8 h-8 mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ height: 'var(--header-h)' }}>
        <div className="container flex items-center justify-between h-full">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">DeskMate AI</h1>
            <nav className="flex space-x-4 hide-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/files" className="text-gray-600 hover:text-gray-900">Files</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hide-sm">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-2">Welcome back!</h2>
            <p className="text-gray-600 text-sm">
              Your office assistant is ready. Choose a quick action below or navigate to Files to manage your uploads.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <QuickActions onTaskStart={handleTaskStart} />
          </div>

          {/* Navigation Cards - Mobile Friendly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/files"
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow block"
            >
              <h3 className="text-lg font-medium mb-2">📁 Files</h3>
              <p className="text-gray-600 text-sm">
                View and manage your uploaded files. All uploads are persistent and private.
              </p>
            </a>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">🖥️ Desktop</h3>
              <p className="text-gray-600 text-sm">
                Connect to your virtual desktop environment for advanced tasks.
              </p>
              <a href="/desktop" className="mt-2 inline-block px-3 py-1 text-sm border rounded hover:bg-gray-50">
                Launch Desktop
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}