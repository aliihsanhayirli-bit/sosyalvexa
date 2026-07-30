import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import AdminLayout from '@/components/layout/AdminLayout';

const Home = lazy(() => import('@/pages/site/Home'));
const About = lazy(() => import('@/pages/site/About'));
const Services = lazy(() => import('@/pages/site/Services'));
const ServiceDetail = lazy(() => import('@/pages/site/ServiceDetail'));
const Packages = lazy(() => import('@/pages/site/Packages'));
const References = lazy(() => import('@/pages/site/References'));
const Contact = lazy(() => import('@/pages/site/Contact'));
const KVKK = lazy(() => import('@/pages/site/KVKK'));

const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminContacts = lazy(() => import('@/pages/admin/Contacts'));
const AdminContactDetail = lazy(() => import('@/pages/admin/ContactDetail'));
const AdminConversations = lazy(() => import('@/pages/admin/Conversations'));
const AdminAppointments = lazy(() => import('@/pages/admin/Appointments'));
const AdminBot = lazy(() => import('@/pages/admin/Bot'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/hizmetler" element={<Services />} />
          <Route path="/hizmetler/:slug" element={<ServiceDetail />} />
          <Route path="/paketler" element={<Packages />} />
          <Route path="/referanslar" element={<References />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/kvkk" element={<KVKK />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="kisiler" element={<AdminContacts />} />
          <Route path="kisiler/:id" element={<AdminContactDetail />} />
          <Route path="konusmalar" element={<AdminConversations />} />
          <Route path="randevular" element={<AdminAppointments />} />
          <Route path="bot" element={<AdminBot />} />
          <Route path="kullanici" element={<AdminUsers />} />
          <Route path="ayarlar" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
