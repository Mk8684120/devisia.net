import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppointmentForm from './AppointmentForm';

const AppointmentList: React.FC = () => {
  const { appointments, deleteAppointment } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-300 bg-blue-900/50';
      case 'confirmed': return 'text-green-300 bg-green-900/50';
      case 'completed': return 'text-gray-300 bg-gray-700';
      case 'cancelled': return 'text-red-300 bg-red-900/50';
      default: return 'text-gray-300 bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Planifié';
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '👥';
      case 'work': return '🔨';
      case 'estimate': return '📋';
      case 'follow-up': return '📞';
      default: return '📅';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'work': return 'Travaux';
      case 'estimate': return 'Devis';
      case 'follow-up': return 'Suivi';
      default: return 'Autre';
    }
  };

  const handleDelete = (appointmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      deleteAppointment(appointmentId);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  // Si on affiche le formulaire
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </h1>
            <p className="text-gray-300 mt-1">
              {editingAppointment ? 'Modifiez les informations du rendez-vous' : 'Créez un nouveau rendez-vous'}
            </p>
          </div>
        </div>
        
        <AppointmentForm
          appointment={editingAppointment || undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  // Si on affiche les détails d'un rendez-vous
  if (selectedAppointment) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Détails du rendez-vous</h2>
          <button
            onClick={() => setSelectedAppointment(null)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{getTypeIcon(selectedAppointment.type)}</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedAppointment.title}</h3>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300 font-medium">{getTypeLabel(selectedAppointment.type)}</span>
              </div>
            </div>
          </div>

          {selectedAppointment.description && (
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-2">Description</h4>
              <p className="text-gray-300">{selectedAppointment.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">Informations client</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <span className="font-medium">Nom:</span>
                  <span>{selectedAppointment.clientName}</span>
                </div>
                {selectedAppointment.clientPhone && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span>{selectedAppointment.clientPhone}</span>
                  </div>
                )}
                {selectedAppointment.clientEmail && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>📧</span>
                    <span>{selectedAppointment.clientEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">Date et heure</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{format(parseISO(selectedAppointment.date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{selectedAppointment.startTime} - {selectedAppointment.endTime}</span>
                </div>
                {selectedAppointment.location && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedAppointment.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedAppointment.notes && (
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-2">Notes</h4>
              <p className="text-gray-300">{selectedAppointment.notes}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4 border-t border-gray-600">
            <button 
              onClick={() => handleEdit(selectedAppointment)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
            >
              <Edit2 className="h-4 w-4" />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => handleDelete(selectedAppointment.id)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Rendez-vous</h1>
          <p className="text-gray-300 mt-1">Gérez tous vos rendez-vous</p>
        </div>
        <button 
          onClick={handleNewAppointment}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau rendez-vous</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="h-4 w-4 inline mr-2" />
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 transition-all duration-300"
              placeholder="Nom du client ou titre..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifié</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-300"
            >
              <option value="all">Tous les types</option>
              <option value="consultation">Consultation</option>
              <option value="work">Travaux</option>
              <option value="estimate">Devis</option>
              <option value="follow-up">Suivi</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 shadow-xl">
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">
            {filteredAppointments.length} rendez-vous trouvé{filteredAppointments.length > 1 ? 's' : ''}
          </h2>
        </div>

        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">Aucun rendez-vous trouvé</p>
              <p className="text-sm text-gray-500 mt-2">Modifiez vos filtres ou créez un nouveau rendez-vous</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-600 rounded-xl p-4 bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-3xl">{getTypeIcon(appointment.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white">{appointment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Client:</span>
                            <span>{appointment.clientName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(appointment.date), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.startTime} - {appointment.endTime}</span>
                          </div>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-400 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-green-400 hover:text-green-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;