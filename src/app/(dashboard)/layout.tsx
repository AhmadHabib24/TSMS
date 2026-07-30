import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import PlanAlerts from "@/components/PlanAlerts";
import ExpiryPopup from "@/components/ExpiryPopup";
import BottomNavigation from "@/components/BottomNavigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Sidebar />
      <PlanAlerts />
      <ExpiryPopup />
      <div className="flex-1 md:ml-72 print:ml-0 rtl:md:mr-72 rtl:md:ml-0 flex flex-col min-h-screen transition-all relative pb-16 md:pb-0">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="mt-auto py-4 px-6 text-center text-sm text-gray-400 border-t border-[var(--color-border)] no-print">
          &copy; {new Date().getFullYear()} Designed and Developed by <a href="https://tecveq.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:underline font-bold transition-colors">Tecveq</a>
        </footer>
        
        <BottomNavigation />
      </div>
    </AuthProvider>
  );
}
