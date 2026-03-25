import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
export const metadata: Metadata = { title: 'Tonhunters', description: 'SpyTON-owned TON discovery board with reviewed and fast-track listings.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>; }
