import type { Metadata } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minice Studio Clip',
  description: 'Mini-séries dramatiques générées par IA, pour informer et transmettre.',
  icons: { icon: '/brand/minice-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
