import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import About from './pages/About';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PlotDetail from './pages/PlotDetail';
import Plots from './pages/Plots';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import PlotForm from './pages/admin/PlotForm';
import ProfileForm from './pages/admin/ProfileForm';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="plots" element={<Plots />} />
                <Route path="plots/:id" element={<PlotDetail />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="admin/login" element={<Login />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="plots/new" element={<PlotForm />} />
                <Route path="plots/:id/edit" element={<PlotForm key="edit" />} />
                <Route path="profile" element={<ProfileForm />} />
              </Route>
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
