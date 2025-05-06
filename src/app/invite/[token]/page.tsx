import ClientInvitePage from "./client";

// Componente de página assíncrono que recebe os params e passa o token para o componente cliente
interface AcceptInvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { token } = await params;
  return <ClientInvitePage token={token} />;
}
