import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testConnection } from './lib/firebase';
import { seedInitialGymData } from './services/gymService';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';

// Public pages
import { Home } from './components/public/Home';
import { About } from './components/public/About';
import { Facilities } from './components/public/Facilities';
import { Memberships } from './components/public/Memberships';
import { Trainers } from './components/public/Trainers';
import { Gallery } from './components/public/Gallery';
import { TrialBooking } from './components/public/TrialBooking';
import { GymJoiningForm } from './components/public/GymJoiningForm';
import { Contact } from './components/public/Contact';

// Admin experience
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { MemberManagement } from './components/admin/MemberManagement';
import { MembershipManagement } from './components/admin/MembershipManagement';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { EnquiryManagement } from './components/admin/EnquiryManagement';
import { JoiningRequestsManagement } from './components/admin/JoiningRequestsManagement';
import { PaymentManagement } from './components/admin/PaymentManagement';
import { ContentManagement } from './components/admin/ContentManagement';
import { ReportsManagement } from './components/admin/ReportsManagement';

function MainApp() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [initialInitDone, setInitialInitDone] = useState(false);
  const [joiningPlan, setJoiningPlan] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function initApp() {
      try {
        await testConnection();
        await seedInitialGymData();
      } catch (err) {
        console.warn('Initial app initialization note:', err);
      } finally {
        setInitialInitDone(true);
      }
    }
    initApp();
  }, []);

  const handleNavigate = (tab: string, planName?: string) => {
    if (planName) {
      setJoiningPlan(planName);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing admin route
  if (currentTab === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!isAdmin) {
      return <AdminLogin onBackToHome={() => setCurrentTab('home')} />;
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={setAdminTab}
        onNavigateToPublic={() => setCurrentTab('home')}
      >
        {adminTab === 'overview' && <AdminOverview onNavigateTab={setAdminTab} />}
        {adminTab === 'joining-requests' && <JoiningRequestsManagement />}
        {adminTab === 'members' && <MemberManagement />}
        {adminTab === 'memberships' && <MembershipManagement />}
        {adminTab === 'attendance' && <AttendanceManagement />}
        {adminTab === 'enquiries' && <EnquiryManagement />}
        {adminTab === 'payments' && <PaymentManagement />}
        {adminTab === 'content' && <ContentManagement />}
        {adminTab === 'reports' && <ReportsManagement />}
      </AdminLayout>
    );
  }

  // Public Experience
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F2937] selection:bg-[#CCFBF1] selection:text-[#0F766E]">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} isAdmin={isAdmin} />

      <main className="flex-1">
        {currentTab === 'home' && <Home onNavigate={handleNavigate} />}
        {currentTab === 'about' && <About onNavigate={handleNavigate} />}
        {currentTab === 'facilities' && <Facilities onNavigate={handleNavigate} />}
        {currentTab === 'memberships' && <Memberships onNavigate={handleNavigate} />}
        {currentTab === 'trainers' && <Trainers onNavigate={handleNavigate} />}
        {currentTab === 'gallery' && <Gallery onNavigate={handleNavigate} />}
        {(currentTab === 'join' || currentTab === 'trial') && (
          <GymJoiningForm onNavigate={handleNavigate} preselectedPlan={joiningPlan} />
        )}
        {currentTab === 'contact' && <Contact onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
