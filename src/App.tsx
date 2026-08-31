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
import { NewReservationModal } from './components/NewReservationModal';
import { ReservationDetailsModal } from './components/ReservationDetailsModal';
import { NewServiceModal } from './components/NewServiceModal';
import { NewProfessionalModal } from './components/NewProfessionalModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { Toast } from './components/Toast';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Main Data States (All from real Backend DB)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    name: 'Turnia SaaS',
    category: 'Estética & Bienestar',
    description: 'Gestión inteligente de reservas',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    acceptNewBookings: true,
    showPricesPublicly: true,
    timeZone: 'America/Bogota',
  });

  // Modals
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<Partial<Reservation> | undefined>(undefined);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewProfessionalOpen, setIsNewProfessionalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(
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

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handlers for Reservations
  const handleCreateReservation = async (newResData: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      const created = await api.reservations.create(newResData);
      setReservations((prev) => [created, ...prev]);

      // Refresh clients and activities
      const [updatedClients, updatedActivities, updatedProfs] = await Promise.all([
        api.clients.getAll(),
        api.activities.getAll(),
        api.professionals.getAll(),
      ]);
      setClients(updatedClients);
      setActivities(updatedActivities);
      setProfessionals(updatedProfs);

      showToast(`Reserva para ${created.clientName} creada correctamente.`);
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      showToast(err.message || 'Error al crear la reserva', 'error');
    }
  };

  const handleUpdateReservationStatus = async (id: string, newStatus: ReservationStatus) => {
    try {
      const updated = await api.reservations.updateStatus(id, newStatus);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast(`Estado de la reserva actualizado a "${newStatus}".`);
    } catch (err: any) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    try {
      const updated = await api.reservations.updateStatus(reservation.id, 'cancelada');
      setReservations((prev) => prev.map((r) => (r.id === reservation.id ? updated : r)));
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast(`Reserva de ${reservation.clientName} ha sido cancelada.`, 'info');
    } catch (err: any) {
      showToast('Error al cancelar la reserva', 'error');
    }
  };

  // Handlers for Services
  const handleSaveService = async (serviceData: Omit<ServiceItem, 'id'>) => {
    try {
      if (editingService) {
        const updated = await api.services.update(editingService.id, serviceData);
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? updated : s)));
        showToast(`Servicio "${serviceData.name}" actualizado.`);
        setEditingService(null);
      } else {
        const created = await api.services.create(serviceData);
        setServices((prev) => [created, ...prev]);
        showToast(`Servicio "${serviceData.name}" agregado al catálogo.`);
      }
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
    } catch (err: any) {
      showToast('Error al guardar el servicio', 'error');
    }
  };

  const handleToggleServiceActive = async (serviceId: string) => {
    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;
      const updated = await api.services.update(serviceId, { active: !service.active });
      setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
      showToast(`Servicio ${updated.active ? 'activado' : 'desactivado'} con éxito.`, 'info');
    } catch (err: any) {
      showToast('Error al actualizar servicio', 'error');
    }
  };

  // Handlers for Professionals
  const handleSaveProfessional = async (
    profData: Omit<Professional, 'id' | 'monthlyBookings'>
  ) => {
    try {
      const created = await api.professionals.create(profData);
      setProfessionals((prev) => [created, ...prev]);
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast(`Profesional "${profData.name}" agregado al equipo.`);
    } catch (err: any) {
      showToast('Error al registrar profesional', 'error');
    }
  };

  // Handlers for Clients
  const handleAddClient = async (clientData: Omit<ClientItem, 'id'>) => {
    try {
      const created = await api.clients.create(clientData);
      setClients((prev) => [created, ...prev]);
      const updatedActivities = await api.activities.getAll();
      setActivities(updatedActivities);
      showToast(`Cliente "${clientData.name}" registrado.`);
    } catch (err: any) {
      showToast('Error al registrar cliente', 'error');
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

  // Real Dynamic Calculations
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRevenue = reservations
    .filter((r) => r.status !== 'cancelada' && r.date.startsWith(currentMonthStr))
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  const pendingCount = reservations.filter((r) => r.status === 'pendiente').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSearchQuery('');
        }}
        pendingCount={pendingCount}
        onOpenProfile={() => setIsProfileOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="md:pl-[260px] flex flex-col min-h-screen flex-1">
        {/* Top Header */}
        <Header
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewBooking={() => handleOpenBookingModal()}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activities={activities}
          onNavigate={(view) => {
            setCurrentView(view);
            setSearchQuery('');
          }}
        />

        {/* View Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-[#757684]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#24389c] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Cargando datos de Turnia...</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
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
                  reservations={reservations}
                  professionals={professionals}
                  services={services}
                  onOpenNewBooking={() => handleOpenBookingModal()}
                  onSelectReservation={(r) => setSelectedReservation(r)}
                  onEditReservation={(r) => {
                    setSelectedReservation(r);
                  }}
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
                  onOpenNewBookingWithClient={(client) =>
                    handleOpenBookingModal({
                      clientName: client.name,
                      clientPhone: client.phone,
                    })
                  }
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'servicios' && (
                <ServiciosView
                  services={services}
                  onOpenNewService={() => {
                    setEditingService(null);
                    setIsNewServiceOpen(true);
                  }}
                  onEditService={(service) => {
                    setEditingService(service);
                    setIsNewServiceOpen(true);
                  }}
                  onToggleActive={handleToggleServiceActive}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === 'profesionales' && (
                <ProfesionalesView
                  professionals={professionals}
                  onOpenNewProfessional={() => setIsNewProfessionalOpen(true)}
                  onSelectProfessional={(_prof) => {
                    showToast(`Perfil de ${_prof.name} abierto.`, 'info');
                  }}
                  onNavigateToSchedule={() => setCurrentView('horarios')}
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
        initialData={bookingPrefill}
      />

      <ReservationDetailsModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onUpdateStatus={handleUpdateReservationStatus}
        onCancelReservation={handleCancelReservation}
      />

      <NewServiceModal
        isOpen={isNewServiceOpen}
        onClose={() => {
          setIsNewServiceOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        editingService={editingService}
      />

      <NewProfessionalModal
        isOpen={isNewProfessionalOpen}
        onClose={() => setIsNewProfessionalOpen(false)}
        onSave={handleSaveProfessional}
      />

      <AdminProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateToSettings={() => setCurrentView('configuracion')}
        config={businessConfig}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
