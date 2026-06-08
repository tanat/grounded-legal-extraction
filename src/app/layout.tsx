import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Grounded Legal Extraction',
  description: 'Upload a legal document and see extracted case data highlighted in the source.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
