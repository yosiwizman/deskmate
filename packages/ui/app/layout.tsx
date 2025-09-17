import type { Metadata } from 'next';
import './globals.css';
import AdminStatus from './(components)/AdminStatus';

export const metadata: Metadata = {
  title: 'DeskMate AI',
  description: 'Your Office Assistant',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: {
    icon: '/deskmate/logo.svg',
  },
  openGraph: {
    title: 'DeskMate AI',
    description: 'Your Office Assistant',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AdminStatus />
      </body>
    </html>
  );
}