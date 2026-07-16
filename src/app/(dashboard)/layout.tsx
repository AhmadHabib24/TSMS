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
      <div className="flex-1 md:ml-64 print:ml-0 flex flex-col min-h-screen transition-all">
        <Header />
        <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
