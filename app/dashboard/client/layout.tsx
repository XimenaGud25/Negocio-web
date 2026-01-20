import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ClientNavbar from "@/components/ClientNavbar";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Si es admin, redirigir al dashboard de admin
  if (session.user?.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ClientNavbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
