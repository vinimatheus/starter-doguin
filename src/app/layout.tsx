import { auth } from '@/auth';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const metadata: Metadata = {
  title: 'Starter Doguin - Solução SaaS para o seu Negócio',
  description:
    'Starter Doguin é um template completo para criar seu SaaS rapidamente. Comece seu negócio online com uma base sólida e escalável.',
  keywords: [
    'starter doguin',
    'template saas',
    'starter saas',
    'solução saas',
    'aplicação web',
    'software as a service',
    'plataforma online'
  ],
  authors: [{ name: 'Starter Doguin', url: 'https://starterdoguin.com.br' }],
  creator: 'Starter Doguin',
  metadataBase: new URL('https://starterdoguin.com.br'),
  openGraph: {
    title: 'Starter Doguin - Solução SaaS',
    description:
      'Comece seu SaaS rapidamente com Starter Doguin. Template completo para desenvolver sua aplicação web.',
    url: 'https://starterdoguin.com.br',
    siteName: 'Starter Doguin',
    images: [
      {
        url: 'https://starterdoguin.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Starter Doguin - Template SaaS'
      }
    ],
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starter Doguin - Template SaaS',
    description:
      'Template completo para criar seu SaaS rapidamente. Comece seu negócio online hoje.',
    images: ['https://starterdoguin.com.br/og-image.jpg']
  }
}


const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <NuqsAdapter>
      <SessionProvider session={session}>
        <html
          lang="pt-BR"
          className={`${lato.className}`}
          suppressHydrationWarning
        >
          <body className={'overflow-hidden'}>
            <NextTopLoader showSpinner={false} />
            <Toaster />
            {children}
          </body>
        </html>
      </SessionProvider>
    </NuqsAdapter>
  );
}
