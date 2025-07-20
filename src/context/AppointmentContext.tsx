import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appointment } from '../types';
import { format, parseISO, isToday, isSameDay } from 'date-fns';

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: () => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Devis peinture salon',
    description: 'Estimation pour peinture salon et cuisine',
    clientName: 'Marie Dupont',
    clientPhone: '06 12 34 56 78',
    clientEmail: 'marie.dupont@email.com',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '14:00',
    endTime: '15:30',
    location: '123 Rue de la Paix, Paris',
    status: 'scheduled',
    type: 'estimate',
    notes: 'Appartement 3 pièces, prévoir échantillons de couleur',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Travaux carrelage',
    description: 'Pose carrelage salle de bain',
    clientName: 'Jean Martin',
    clientPhone: '06 98 76 54 32',
    date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
    startTime: '09:00',
    endTime: '17:00',
    location: '456 Avenue des Fleurs, Lyon',
    status: 'confirmed',
    type: 'work',
    notes: 'Matériaux fournis par le client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    } else {
      setAppointments(SAMPLE_APPOINTMENTS);
      localStorage.setItem('appointments', JSON.stringify(SAMPLE_APPOINTMENTS));
    }
  }, []);

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...appointments, newAppointment];
    saveAppointments(updated);
  };

  const updateAppointment = (id: string, appointmentUpdate: Partial<Appointment>) => {
    const updated = appointments.map(apt => 
      apt.id === id 
        ? { ...apt, ...appointmentUpdate, updatedAt: new Date().toISOString() }
        : apt
    );
    saveAppointments(updated);
  };

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter(apt => apt.id !== id);
    saveAppointments(updated);
  };

  const getAppointmentsByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getTodayAppointments = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === today);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptDate = parseISO(apt.date);
        return aptDate >= now;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        if (dateA.getTime() === dateB.getTime()) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByDate,
      getTodayAppointments,
      getUpcomingAppointments
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};