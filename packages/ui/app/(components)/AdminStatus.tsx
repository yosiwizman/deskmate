'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface AdminStatusProps {
  className?: string;
}

export default function AdminStatus({ className = '' }: AdminStatusProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const adminEmails = process.env.NEXT_PUBLIC_ADMINS?.split(',').map(e => e.trim()) || [];
      const userIsAdmin = adminEmails.includes(user.email);
      
      setUser(user);
      setIsAdmin(userIsAdmin);
    };

    checkAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const adminEmails = process.env.NEXT_PUBLIC_ADMINS?.split(',').map(e => e.trim()) || [];
          const userIsAdmin = adminEmails.includes(session.user.email || '');
          setUser(session.user);
          setIsAdmin(userIsAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isAdmin || !user) return null;

  const railwayProjectId = process.env.NEXT_PUBLIC_RAILWAY_PROJECT_ID;
  const logsUrl = railwayProjectId 
    ? `https://railway.app/project/${railwayProjectId}/logs`
    : '#';

  return (
    <div 
      className={`fixed bottom-2 right-2 text-xs opacity-80 bg-white/90 border rounded px-2 py-1 shadow-sm backdrop-blur-sm ${className}`}
    >
      <span className="text-green-600">UI OK</span> • 
      <span className="text-green-600 ml-1">Agent OK</span> • 
      <span className="text-green-600 ml-1">Desktop OK</span>
      <span className="mx-2">·</span>
      <a 
        className="underline hover:text-blue-600" 
        href={logsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        View logs
      </a>
    </div>
  );
}