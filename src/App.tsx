import React, { useState } from 'react';
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
import {
  INITIAL_SERVICES,
  INITIAL_PROFESSIONALS,
  INITIAL_CLIENTS,
  INITIAL_RESERVATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_WEEKLY_SCHEDULE,
  INITIAL_BUSINESS_CONFIG,
} from './data/mockData';
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

  // Main Data States
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [clients, setClients] = useState<ClientItem[]>(INITIAL_CLIENTS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_WEEKLY_SCHEDULE);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(INITIAL_BUSINESS_CONFIG);

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

  // Handlers for Reservations
  const handleCreateReservation = (newResData: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newId = `res-${Date.now()}`;
    const newReservation: Reservation = {
      ...newResData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setReservations([newReservation, ...reservations]);

    // Also add to activities
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Nueva reserva agendada: ${newResData.clientName} (${newResData.serviceName})`,
      clientName: newResData.clientName,
      timeAgo: 'Justo ahora',
      type: 'new_booking',
      timestamp: new Date().toISOString(),
    };
    setActivities([newActivity, ...activities]);

    // Update client visits or register if not existing
    const existingClient = clients.find(
      (c) => c.name.toLowerCase() === newResData.clientName.toLowerCase()
    );
    if (existingClient) {
      setClients(
        clients.map((c) =>
          c.id === existingClient.id
            ? { ...c, totalVisits: c.totalVisits + 1, lastVisit: newResData.date }
            : c
        )
      );
    } else {
      setClients([
        {
          id: `cli-${Date.now()}`,
          name: newResData.clientName,
          phone: newResData.clientPhone || '+34 600 000 000',
          email: `${newResData.clientName.toLowerCase().replace(/\s+/g, '')}@ejemplo.com`,
          totalVisits: 1,
          lastVisit: newResData.date,
        },
        ...clients,
      ]);
    }

    showToast(`Reserva para ${newResData.clientName} creada correctamente.`);
  };

  const handleUpdateReservationStatus = (id: string, newStatus: ReservationStatus) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Estado de la reserva actualizado a "${newStatus}".`);
  };

  const handleCancelReservation = (reservation: Reservation) => {
    setReservations(
      reservations.map((r) => (r.id === reservation.id ? { ...r, status: 'cancelada' } : r))
    );

    const cancelActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Reserva cancelada por ${reservation.clientName}`,
      clientName: reservation.clientName,
      timeAgo: 'Justo ahora',
      type: 'cancellation',
      timestamp: new Date().toISOString(),
    };
    setActivities([cancelActivity, ...activities]);

    showToast(`Reserva de ${reservation.clientName} ha sido cancelada.`, 'info');
  };

  // Handlers for Services
  const handleSaveService = (serviceData: Omit<ServiceItem, 'id'>) => {
    if (editingService) {
      setServices(
        services.map((s) => (s.id === editingService.id ? { ...serviceData, id: s.id } : s))
      );
      showToast(`Servicio "${serviceData.name}" actualizado.`);
      setEditingService(null);
    } else {
      const newService: ServiceItem = {
        ...serviceData,
        id: `serv-${Date.now()}`,
      };
      setServices([...services, newService]);
      showToast(`Servicio "${serviceData.name}" agregado al catálogo.`);
    }
  };

  const handleToggleServiceActive = (serviceId: string) => {
    setServices(
      services.map((s) => {
        if (s.id === serviceId) {
          const nextState = !s.active;
          showToast(
            `Servicio ${nextState ? 'activado' : 'desactivado'} con éxito.`,
            'info'
          );
          return { ...s, active: nextState };
        }
        return s;
      })
    );
  };

  // Handlers for Professionals
  const handleSaveProfessional = (
    profData: Omit<Professional, 'id' | 'monthlyBookings'>
  ) => {
    const newProf: Professional = {
      ...profData,
      id: `prof-${Date.now()}`,
      monthlyBookings: 0,
    };
    setProfessionals([...professionals, newProf]);
    showToast(`Profesional "${profData.name}" agregado al equipo.`);
  };

  // Handlers for Clients
  const handleAddClient = (clientData: Omit<ClientItem, 'id'>) => {
    const newClient: ClientItem = {
      ...clientData,
      id: `cli-${Date.now()}`,
    };
    setClients([newClient, ...clients]);

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Nuevo cliente registrado: ${clientData.name}`,
      clientName: clientData.name,
      timeAgo: 'Justo ahora',
      type: 'new_client',
      timestamp: new Date().toISOString(),
    };
    setActivities([newActivity, ...activities]);
    showToast(`Cliente "${clientData.name}" registrado.`);
  };

  // Open booking with prefill
  const handleOpenBookingModal = (initial?: Partial<Reservation>) => {
    setBookingPrefill(initial);
    setIsNewBookingOpen(true);
  };

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

      {/* Main Content Layout with 260px left margin on md+ */}
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
          {currentView === 'dashboard' && (
            <DashboardView
              reservations={reservations}
              activities={activities}
              clientCount={clients.length + 180}
              monthlyRevenue={4850000}
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
              onSaveSchedule={(updated) => {
                setSchedule(updated);
                showToast('Horarios de atención guardados exitosamente.');
              }}
              timeZone={businessConfig.timeZone}
              onChangeTimeZone={(tz) =>
                setBusinessConfig({ ...businessConfig, timeZone: tz })
              }
            />
          )}

          {currentView === 'reportes' && (
            <ReportesView
              professionals={professionals}
              services={services}
              monthlyRevenue={4850000}
            />
          )}

          {currentView === 'configuracion' && (
            <ConfiguracionView
              config={businessConfig}
              onSaveConfig={(updated) => {
                setBusinessConfig(updated);
                showToast('Ajustes del negocio guardados correctamente.');
              }}
            />
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
