import DesktopFrame from '@/app/(components)/DesktopFrame';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DesktopPage() {
  const desktopUrl = process.env.NEXT_PUBLIC_DESKTOP_URL;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ height: 'var(--header-h)' }}>
        <div className="container flex items-center justify-between h-full">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">DeskMate AI</h1>
            <nav className="flex space-x-4 hide-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/files" className="text-gray-600 hover:text-gray-900">Files</Link>
            </nav>
          </div>

          <Link href="/" className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Back</Link>
        </div>
      </header>

      {/* Desktop content */}
      <main className="container py-4">
        {!desktopUrl ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <h2 className="text-lg font-medium mb-2">Desktop not configured</h2>
            <p className="text-gray-600 text-sm">
              Set NEXT_PUBLIC_DESKTOP_URL in your environment to enable the embedded desktop.
            </p>
          </div>
        ) : (
          <DesktopFrame>
            <iframe
              src={desktopUrl}
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write; geolocation; microphone; camera; display-capture"
            />
          </DesktopFrame>
        )}
      </main>
    </div>
  );
}