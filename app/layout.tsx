import './globals.css';import type { Metadata } from 'next';import { Header } from '@/components/header';import { Footer } from '@/components/footer';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'KYRON', description: 'Discover, rank, and promote tokens with KYRON.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>; }