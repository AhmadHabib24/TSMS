import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Sidebar />
      <div className="flex-1 ml-64 print:ml-0 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
