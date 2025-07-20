import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock, User, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment } from '../types';
import { format } from 'date-fns';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave?: () => void;
  onCancel?: () => void;
  initialDate?: Date;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  appointment, 
  onSave, 
  onCancel,
  initialDate 
}) => {
  const { addAppointment, updateAppointment } = useAppointments();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    status: 'scheduled' as const,
    type: 'consultation' as const,
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || '',
        clientEmail: appointment.clientEmail || '',
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location: appointment.location || '',
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes || ''
      });
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (appointment) {
      updateAppointment(appointment.id, formData);
    } else {
      addAppointment(formData);
    }
    
    onSave?.();
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-adjust end time when start time changes
      if (field === 'startTime') {
        const [hours, minutes] = value.split(':').map(Number);
        const endHours = hours + 1;
        updated.endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      return updated;
    });
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', icon: '👥' },
    { value: 'work', label: 'Travaux', icon: '🔨' },
    { value: 'estimate', label: 'Devis', icon: '📋' },
    { value: 'follow-up', label: 'Suivi', icon: '📞' },
    { value: 'other', label: 'Autre', icon: '📅' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Planifié', color: 'bg-blue-500' },
    { value: 'confirmed', label: 'Confirmé', color: 'bg-green-500' },
    { value: 'completed', label: 'Terminé', color: 'bg-gray-500' },
    { value: 'cancelled', label: 'Annulé', color: 'bg-red-500' }
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Titre du rendez-vous
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Ex: Devis peinture salon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Description détaillée du rendez-vous"
            rows={3}
          />
        </div>

        {/* Client Information */}
        <div className="border-t border-gray-600 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Informations client</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nom du client
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="Nom complet"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="client@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Lieu
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="Adresse du rendez-vous"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="border-t border-gray-600 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Date et heure</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Heure de début
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Status and Notes */}
        <div className="border-t border-gray-600 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Notes additionnelles"
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-6 border-t border-gray-600">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{appointment ? 'Mettre à jour' : 'Créer'}</span>
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;