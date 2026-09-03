import React, { useState, useEffect, useCallback } from 'react';
import {
  ViewMode,
  Reservation,
  ServiceItem,
  Professional,
  ClientItem,
  ActivityItem,
  DaySchedule,
  BusinessConfig,
  ReservationStatus,
  AuthUser,
  UserRole,
} from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ReservasView } from './components/ReservasView';
import { CalendarioView } from './components/CalendarioView';
import { ClientesView } from './components/ClientesView';
import { ServiciosView } from './components/ServiciosView';
import { ProfesionalesView } from './components/ProfesionalesView';
import { HorariosView } from './components/HorariosView';
import { ReportesView } from './components/ReportesView';
import { ConfiguracionView } from './components/ConfiguracionView';
import { EmpleadoDashboardView } from './components/EmpleadoDashboardView';
import { EmpleadoAgendaView } from './components/EmpleadoAgendaView';
import { ClientePortalView } from './components/ClientePortalView';
import { LoginView } from './components/LoginView';
import { NewReservationModal } from './components/NewReservationModal';
import { ReservationDetailsModal } from './components/ReservationDetailsModal';
import { NewServiceModal } from './components/NewServiceModal';
import { NewProfessionalModal } from './components/NewProfessionalModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { Toast } from './components/Toast';
import { wsService } from './services/websocket';

export default function App() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isConnectedWS, setIsConnectedWS] = useState<boolean>(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Main Data States (All from MySQL Backend DB)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    name: 'Turnia Negocio & Reservas',
    category: 'Estética & Bienestar',
    description: 'Gestión inteligente de reservas',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    acceptNewBookings: true,
    showPricesPublicly: true,
    timeZone: 'UTC-5 (Bogotá, Lima, Quito)',
  });

  // Modal States
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<Partial<Reservation> | undefined>();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewProfessionalOpen, setIsNewProfessionalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load all data from real backend database
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        resReservations,
        resServices,
        resProfessionals,
        resClients,
        resActivities,
        resSchedules,
        resBusiness,
      ] = await Promise.all([
        api.reservations.getAll(),
        api.services.getAll(),
        api.professionals.getAll(),
        api.clients.getAll(),
        api.activities.getAll(),
        api.schedules.getAll(),
        api.business.get(),
      ]);

      if (Array.isArray(resReservations)) setReservations(resReservations);
      if (Array.isArray(resServices)) setServices(resServices);
      if (Array.isArray(resProfessionals)) setProfessionals(resProfessionals);
      if (Array.isArray(resClients)) setClients(resClients);
      if (Array.isArray(resActivities)) setActivities(resActivities);
      if (Array.isArray(resSchedules)) setSchedule(resSchedules);
      if (resBusiness && typeof resBusiness === 'object') setBusinessConfig(resBusiness);
    } catch (err: any) {
      console.warn('API sync warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate session on initial load
  useEffect(() => {
    const checkAuthSession = async () => {
      const token = localStorage.getItem('turnia_auth_token') || sessionStorage.getItem('turnia_auth_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setAuthUser(res.user);
          setIsAuthenticated(true);
          if (res.user.role === 'empleado') setCurrentView('empleado_dashboard');
          else if (res.user.role === 'cliente') setCurrentView('cliente_portal');
          else setCurrentView('dashboard');
          await fetchAllData();
        } catch (err) {
          console.warn('Token expired or invalid:', err);
          api.auth.logout();
          setIsAuthenticated(false);
          setAuthUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setAuthUser(null);
      }
      setIsAuthChecking(false);
    };

    checkAuthSession();
  }, [fetchAllData]);

  // Real-time WebSocket connection and event subscriptions
  useEffect(() => {
    if (!isAuthenticated) {
      wsService.disconnect();
      setIsConnectedWS(false);
      return;
    }

    wsService.connect();
    setIsConnectedWS(true);

    // Real-time Notification listener
    const unsubNotif = wsService.onNotification((activity) => {
      setActivities((prev) => [activity, ...prev.filter((a) => a.id !== activity.id)]);
      showToast(`🔔 ${activity.title}`, 'info');
    });

    // Real-time Data Sync listener
    const unsubData = wsService.onDataUpdate(async (entity) => {
      try {
        if (entity === 'reservations') {
          const res = await api.reservations.getAll();
          setReservations(res);
        } else if (entity === 'clients') {
          const cli = await api.clients.getAll();
          setClients(cli);
        } else if (entity === 'activities') {
          const act = await api.activities.getAll();
          setActivities(act);
        }
      } catch (err) {
        console.warn('WebSocket data sync failed:', err);
      }
    });

    return () => {
      unsubNotif();
      unsubData();
      wsService.disconnect();
    };
  }, [isAuthenticated]);

  // Handle Role Switcher for instant testing
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'empleado') {
      const empProf = professionals.find((p) => p.name.includes('Carlos') || p.id === 'prof-1') || professionals[0];
      setAuthUser({
        id: 'usr-emp-1',
        name: empProf ? empProf.name : 'Carlos Mendoza',
        email: empProf?.email || 'carlos@turnia.com',
        role: 'empleado',
        professionalId: empProf ? empProf.id : 'prof-1',
      });
      setCurrentView('empleado_dashboard');
      showToast(`Cambiado al rol Empleado (${empProf ? empProf.name : 'Carlos Mendoza'})`, 'info');
    } else if (newRole === 'cliente') {
      setAuthUser({
        id: 'usr-cli-1',
        name: 'Andrés Felipe Castro',
        email: 'cliente@turnia.com',
        role: 'cliente',
        clientId: 'cli-1',
      });
      setCurrentView('cliente_portal');
      showToast('Cambiado al rol Cliente (Andrés Felipe)', 'info');
    } else {
      setAuthUser({
        id: 'usr-admin',
        name: 'Administrador Turnia',
        email: 'admin@turnia.com',
        role: 'admin',
      });
      setCurrentView('dashboard');
      showToast('Cambiado al rol Administrador General', 'info');
    }
  };

  // Find logged in professional object if employee
  const loggedProfessional = professionals.find(
    (p) =>
      (authUser?.professionalId && p.id === authUser.professionalId) ||
      p.name.trim().toLowerCase() === authUser?.name.trim().toLowerCase() ||
      (authUser?.email && p.email && p.email.trim().toLowerCase() === authUser.email.trim().toLowerCase())
  );

  // Handlers for Reservations
  const handleCreateReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      const created = await api.reservations.create(reservationData);
      setReservations((prev) => [created, ...prev]);
      const [updatedActivities, updatedClients] = await Promise.all([
        api.activities.getAll(),
        api.clients.getAll(),
      ]);
      setActivities(updatedActivities);
      setClients(updatedClients);
      showToast('¡Cita agendada exitosamente!');
    } catch (err: any) {
      showToast(err.message || 'Error al agendar reserva', 'error');
    }
  };

  const handleUpdateReservationStatus = async (id: string, newStatus: ReservationStatus) => {
    try {
      const updated = await api.reservations.updateStatus(id, newStatus);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReservation?.id === id) {
        setSelectedReservation(updated);
      }
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast(`Cita marcada como "${newStatus.replace('_', ' ')}".`);
    } catch (err: any) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const handleCancelReservation = async (res: Reservation) => {
    try {
      const updated = await api.reservations.updateStatus(res.id, 'cancelada');
      setReservations((prev) => prev.map((r) => (r.id === res.id ? updated : r)));
      if (selectedReservation?.id === res.id) {
        setSelectedReservation(updated);
      }
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast('Cita cancelada correctamente.', 'info');
    } catch (err: any) {
      showToast('Error al cancelar reserva', 'error');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await api.reservations.delete(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      if (selectedReservation?.id === id) {
        setSelectedReservation(null);
      }
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast('Cita eliminada.', 'info');
    } catch (err: any) {
      showToast('Error al eliminar reserva', 'error');
    }
  };

  // Handlers for Services
  const handleCreateService = async (serviceData: Omit<ServiceItem, 'id'>) => {
    try {
      const created = await api.services.create(serviceData);
      setServices((prev) => [...prev, created]);
      showToast(`Servicio "${created.name}" creado con éxito.`);
    } catch (err: any) {
      showToast('Error al crear servicio', 'error');
    }
  };

  const handleUpdateService = async (id: string, serviceData: Partial<ServiceItem>) => {
    try {
      const updated = await api.services.update(id, serviceData);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast(`Servicio "${updated.name}" actualizado.`);
    } catch (err: any) {
      showToast('Error al actualizar servicio', 'error');
    }
  };

  const handleToggleServiceActive = async (id: string) => {
    const s = services.find((srv) => srv.id === id);
    if (!s) return;
    try {
      const updated = await api.services.update(id, { active: !s.active });
      setServices((prev) => prev.map((srv) => (srv.id === id ? updated : srv)));
      showToast(`Servicio ${updated.active ? 'activado' : 'desactivado'}.`);
    } catch (err: any) {
      showToast('Error al cambiar estado del servicio', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await api.services.delete(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Servicio eliminado del catálogo.', 'info');
    } catch (err: any) {
      showToast('Error al eliminar servicio', 'error');
    }
  };

  // Handlers for Professionals
  const handleCreateProfessional = async (profData: Omit<Professional, 'id' | 'monthlyBookings'>) => {
    try {
      const created = await api.professionals.create(profData);
      setProfessionals((prev) => [...prev, created]);
      showToast(`Profesional "${created.name}" registrado.`);
    } catch (err: any) {
      showToast('Error al registrar profesional', 'error');
    }
  };

  const handleUpdateProfessional = async (id: string, profData: Partial<Professional>) => {
    try {
      const updated = await api.professionals.update(id, profData);
      setProfessionals((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(`Profesional "${updated.name}" actualizado.`);
    } catch (err: any) {
      showToast('Error al actualizar profesional', 'error');
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    try {
      await api.professionals.delete(id);
      setProfessionals((prev) => prev.filter((p) => p.id !== id));
      showToast('Profesional eliminado.', 'info');
    } catch (err: any) {
      showToast('Error al eliminar profesional', 'error');
    }
  };

  // Handlers for Clients
  const handleAddClient = async (clientData: Omit<ClientItem, 'id' | 'totalVisits' | 'lastVisit'>) => {
    try {
      const created = await api.clients.create(clientData);
      setClients((prev) => [created, ...prev]);
      showToast(`Cliente "${clientData.name}" registrado.`);
    } catch (err: any) {
      showToast('Error al registrar cliente', 'error');
    }
  };

  const handleUpdateClient = async (id: string, clientData: Partial<ClientItem>) => {
    try {
      const updated = await api.clients.update(id, clientData);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast(`Cliente "${updated.name}" actualizado.`);
    } catch (err: any) {
      showToast('Error al actualizar cliente', 'error');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await api.clients.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast('Cliente y cuenta eliminados correctamente.', 'info');
    } catch (err: any) {
      showToast('Error al eliminar cliente', 'error');
    }
  };

  // Handlers for Schedule
  const handleSaveSchedule = async (updatedSchedules: DaySchedule[]) => {
    try {
      const saved = await api.schedules.update(updatedSchedules);
      setSchedule(saved);
      showToast('Horarios de atención guardados exitosamente.');
    } catch (err: any) {
      showToast('Error al guardar horarios', 'error');
    }
  };

  // Handlers for Business Config
  const handleSaveConfig = async (updatedConfig: BusinessConfig) => {
    try {
      const saved = await api.business.update(updatedConfig);
      setBusinessConfig(saved);
      showToast('Ajustes del negocio guardados correctamente.');
    } catch (err: any) {
      showToast('Error al guardar configuración', 'error');
    }
  };

  // Open booking with prefill
  const handleOpenBookingModal = (initial?: Partial<Reservation>) => {
    setBookingPrefill(initial);
    setIsNewBookingOpen(true);
  };

  // Initial loading splash
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#e8ecf2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#24389c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#191c1d]">Cargando Turnia...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Login/Register
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={async (user) => {
          setAuthUser(user);
          setIsAuthenticated(true);
          if (user.role === 'empleado') setCurrentView('empleado_dashboard');
          else if (user.role === 'cliente') setCurrentView('cliente_portal');
          else setCurrentView('dashboard');
          await fetchAllData();
          showToast(`¡Bienvenido de nuevo, ${user.name}!`);
        }}
      />
    );
  }

  // Calculate stats
  const monthlyRevenue = reservations
    .filter((r) => r.status === 'completada' || r.status === 'confirmada')
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const pendingCount = reservations.filter((r) => r.status === 'pendiente').length;

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#191c1d] font-sans">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Dynamic Role Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          setSearchQuery('');
        }}
        pendingCount={pendingCount}
        onOpenProfile={() => setIsAdminProfileOpen(true)}
        onLogout={() => {
          api.auth.logout();
          setIsAuthenticated(false);
          setAuthUser(null);
          showToast('Has cerrado sesión correctamente.', 'info');
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        businessConfig={businessConfig}
        user={authUser}
      />

      {/* Main Layout Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        {/* Dynamic Role Header */}
        <Header
          currentView={currentView}
          onOpenNewBooking={() => handleOpenBookingModal()}
          onOpenProfile={() => setIsAdminProfileOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activities={activities}
          onNavigate={(v) => setCurrentView(v)}
          onClearNotifications={async () => {
            try {
              await api.activities.clearAll();
              setActivities([]);
              showToast('Notificaciones borradas.', 'info');
            } catch {
              showToast('Error al limpiar notificaciones', 'error');
            }
          }}
          onDeleteNotification={async (id) => {
            try {
              await api.activities.delete(id);
              setActivities((prev) => prev.filter((a) => a.id !== id));
            } catch {
              showToast('Error al eliminar notificación', 'error');
            }
          }}
          isConnectedWS={isConnectedWS}
          currentUser={authUser}
        />

        {/* Dynamic Views Rendering based on Role & Navigation */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#24389c] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-[#757684]">Sincronizando datos...</span>
              </div>
            </div>
          ) : (
            <>
              {/* EMPLEADO SPECIFIC SCREENS */}
              {(currentView === 'empleado_dashboard' || (authUser?.role === 'empleado' && currentView === 'dashboard')) && (
                <EmpleadoDashboardView
                  currentUser={authUser!}
                  professional={loggedProfessional}
                  reservations={reservations}
                  services={services}
                  onUpdateReservationStatus={handleUpdateReservationStatus}
                  onOpenNewBookingForMe={() =>
                    handleOpenBookingModal({
                      professionalId: loggedProfessional?.id || '',
                      professionalName: authUser?.name || '',
                    })
                  }
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'empleado_agenda' && (
                <EmpleadoAgendaView
                  currentUser={authUser!}
                  professional={loggedProfessional}
                  reservations={reservations}
                  services={services}
                  onSelectReservation={(r) => setSelectedReservation(r)}
                  onOpenNewBooking={handleOpenBookingModal}
                  onUpdateReservationStatus={handleUpdateReservationStatus}
                />
              )}

              {/* CLIENTE SPECIFIC SCREENS */}
              {(currentView === 'cliente_portal' || (authUser?.role === 'cliente' && currentView === 'dashboard')) && (
                <ClientePortalView
                  currentUser={authUser!}
                  reservations={reservations}
                  services={services}
                  businessConfig={businessConfig}
                  onOpenNewBooking={() => handleOpenBookingModal()}
                  onCancelReservation={handleCancelReservation}
                />
              )}

              {/* SHARED / ADMIN SCREENS */}
              {currentView === 'dashboard' && authUser?.role === 'admin' && (
                <DashboardView
                  reservations={reservations}
                  activities={activities}
                  clientCount={clients.length}
                  monthlyRevenue={monthlyRevenue}
                  onNavigate={(v) => {
                    setCurrentView(v);
                    setSearchQuery('');
                  }}
                  onSelectReservation={(r) => setSelectedReservation(r)}
                  onOpenNewBooking={() => handleOpenBookingModal()}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'reservas' && (
                <ReservasView
                  reservations={
                    authUser?.role === 'empleado'
                      ? reservations.filter(
                          (r) =>
                            (loggedProfessional && r.professionalId === loggedProfessional.id) ||
                            r.professionalName.toLowerCase() === authUser.name.toLowerCase()
                        )
                      : reservations
                  }
                  professionals={professionals}
                  services={services}
                  onOpenNewBooking={() =>
                    handleOpenBookingModal(
                      authUser?.role === 'empleado'
                        ? {
                            professionalId: loggedProfessional?.id || '',
                            professionalName: authUser.name,
                          }
                        : undefined
                    )
                  }
                  onSelectReservation={(r) => setSelectedReservation(r)}
                  onEditReservation={(r) => setSelectedReservation(r)}
                  onCancelReservation={handleCancelReservation}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'calendario' && (
                <CalendarioView
                  reservations={reservations}
                  professionals={professionals}
                  onOpenNewBooking={handleOpenBookingModal}
                  onSelectReservation={(r) => setSelectedReservation(r)}
                />
              )}

              {currentView === 'clientes' && (
                <ClientesView
                  clients={clients}
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                  onDeleteClient={handleDeleteClient}
                  onOpenNewBookingWithClient={(client) =>
                    handleOpenBookingModal({
                      clientName: client.name,
                      clientPhone: client.phone,
                      professionalId: authUser?.role === 'empleado' ? loggedProfessional?.id : undefined,
                      professionalName: authUser?.role === 'empleado' ? authUser.name : undefined,
                    })
                  }
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'servicios' && (
                <ServiciosView
                  services={services}
                  onOpenNewService={() => {
                    if (authUser?.role === 'empleado') {
                      showToast('Solo el administrador puede crear nuevos servicios.', 'error');
                      return;
                    }
                    setEditingService(null);
                    setIsNewServiceOpen(true);
                  }}
                  onEditService={(service) => {
                    if (authUser?.role === 'empleado') {
                      showToast('Solo el administrador puede editar servicios del catálogo.', 'error');
                      return;
                    }
                    setEditingService(service);
                    setIsNewServiceOpen(true);
                  }}
                  onToggleActive={(id) => {
                    if (authUser?.role === 'empleado') {
                      showToast('Solo el administrador puede cambiar el estado de servicios.', 'error');
                      return;
                    }
                    handleToggleServiceActive(id);
                  }}
                  onDeleteService={(id) => {
                    if (authUser?.role === 'empleado') {
                      showToast('Solo el administrador puede eliminar servicios.', 'error');
                      return;
                    }
                    handleDeleteService(id);
                  }}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'profesionales' && (
                <ProfesionalesView
                  professionals={professionals}
                  reservations={reservations}
                  onOpenNewProfessional={() => {
                    setEditingProfessional(null);
                    setIsNewProfessionalOpen(true);
                  }}
                  onEditProfessional={(prof) => {
                    setEditingProfessional(prof);
                    setIsNewProfessionalOpen(true);
                  }}
                  onDeleteProfessional={handleDeleteProfessional}
                  onNavigate={setCurrentView}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'horarios' && (
                <HorariosView
                  schedule={schedule}
                  onSaveSchedule={handleSaveSchedule}
                  timeZone={businessConfig.timeZone}
                  onChangeTimeZone={(tz) =>
                    handleSaveConfig({ ...businessConfig, timeZone: tz })
                  }
                />
              )}

              {currentView === 'reportes' && (
                <ReportesView
                  professionals={professionals}
                  services={services}
                  reservations={reservations}
                />
              )}

              {currentView === 'configuracion' && (
                <ConfiguracionView
                  config={businessConfig}
                  onSaveConfig={handleSaveConfig}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewReservationModal
        isOpen={isNewBookingOpen}
        onClose={() => {
          setIsNewBookingOpen(false);
          setBookingPrefill(undefined);
        }}
        onSave={handleCreateReservation}
        professionals={professionals}
        services={services}
        schedules={schedule}
        initialData={bookingPrefill}
        currentUser={authUser}
        clients={clients}
      />

      <ReservationDetailsModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onUpdateStatus={handleUpdateReservationStatus}
        onCancelReservation={handleCancelReservation}
        onDeleteReservation={handleDeleteReservation}
      />

      <NewServiceModal
        isOpen={isNewServiceOpen}
        onClose={() => {
          setIsNewServiceOpen(false);
          setEditingService(null);
        }}
        onSave={handleCreateService}
        onUpdate={handleUpdateService}
        initialData={editingService}
      />

      <NewProfessionalModal
        isOpen={isNewProfessionalOpen}
        onClose={() => {
          setIsNewProfessionalOpen(false);
          setEditingProfessional(null);
        }}
        onSave={handleCreateProfessional}
        onUpdate={handleUpdateProfessional}
        initialData={editingProfessional}
      />

      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
        user={authUser}
        config={businessConfig}
        onNavigateToSettings={() => {
          setIsAdminProfileOpen(false);
          setCurrentView('configuracion');
        }}
        onLogout={() => {
          setIsAdminProfileOpen(false);
          api.auth.logout();
          setIsAuthenticated(false);
          setAuthUser(null);
          showToast('Has cerrado sesión correctamente.', 'info');
        }}
      />
    </div>
  );
}
