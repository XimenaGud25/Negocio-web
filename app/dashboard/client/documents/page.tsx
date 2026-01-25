import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ClientDocumentsContent } from "@/components/ClientDocumentsContent";

export default async function ClientDocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Acceso denegado</div>;
  }

  return <ClientDocumentsContent userId={session.user.id} />;
}