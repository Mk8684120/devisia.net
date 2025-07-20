import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, Plus, Mic, TrendingUp, FileText, Euro, Zap, Shield } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VoiceControl from './VoiceControl';

const Dashboard: React.FC = () => {
  const { appointments, getTodayAppointments, getUpcomingAppointments } = useAppointments();
  const { quotes } = useData();
  const { user, hasPermission, isAdmin } = useAuth();
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  const stats = {
    appointments: {
      total: appointments.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: appointments.filter(apt => apt.status === 'completed').length
    },
    quotes: {
      total: quotes.length,
      pending: quotes.filter(q => q.status === 'sent').length,
      accepted: quotes.filter(q => q.status === 'accepted').length,
      totalValue: quotes.reduce((sum, q) => sum + q.totalAmount, 0)
    }
  };

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

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, bgColor, trend }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-xl shadow-lg`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <div className="flex items-center space-x-3 mt-2">
            <p className="text-gray-300">Gestion complète de vos rendez-vous et devis vocaux</p>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className={`h-4 w-4 ${user?.role === 'admin' ? 'text-green-400' : 'text-blue-400'}`} />
              <span className={user?.role === 'admin' ? 'text-green-400' : 'text-blue-400'}>
                {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {hasPermission('canUseVoiceControl') && (
            <button
              onClick={() => setShowVoiceControl(!showVoiceControl)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Mic className="h-5 w-5" />
              <span>Contrôle vocal</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Control Panel */}
      {showVoiceControl && hasPermission('canUseVoiceControl') && (
        <VoiceControl onCommandProcessed={(command, success) => {
          console.log(`Command: ${command}, Success: ${success}`);
        }} />
      )}

      {/* User Permissions Notice */}
      {!isAdmin() && (
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Compte utilisateur</h3>
              <p className="text-blue-300 text-sm">
                Vous avez un accès limité aux fonctionnalités. Contactez l'administrateur pour plus de droits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Rendez-vous total"
          value={stats.appointments.total}
          icon={CalendarIcon}
          color="text-blue-400"
          bgColor="bg-blue-900/50"
          trend="+12% ce mois"
        />
        <StatCard
          title="Aujourd'hui"
          value={stats.appointments.today}
          icon={Clock}
          color="text-orange-400"
          bgColor="bg-orange-900/50"
        />
        <StatCard
          title="Devis créés"
          value={stats.quotes.total}
          icon={FileText}
          color="text-purple-400"
          bgColor="bg-purple-900/50"
          trend="+5 cette semaine"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.quotes.totalValue.toLocaleString('fr-FR')} €`}
          icon={Euro}
          color="text-green-400"
          bgColor="bg-green-900/50"
          trend="+18% ce mois"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Rendez-vous</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">À venir</span>
              <span className="text-white font-medium">{stats.appointments.upcoming}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Terminés</span>
              <span className="text-white font-medium">{stats.appointments.completed}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Devis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">En attente</span>
              <span className="text-white font-medium">{stats.quotes.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Acceptés</span>
              <span className="text-white font-medium">{stats.quotes.accepted}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Taux conversion</span>
              <span className="text-green-400 font-medium">
                {stats.quotes.total > 0 ? Math.round((stats.quotes.accepted / stats.quotes.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Panier moyen</span>
              <span className="text-white font-medium">
                {stats.quotes.total > 0 ? Math.round(stats.quotes.totalValue / stats.quotes.total).toLocaleString('fr-FR') : 0} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      {hasPermission('canViewAppointments') && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-600">
          <div className="p-6 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Rendez-vous d'aujourd'hui</h2>
                  <p className="text-sm text-gray-300">Votre planning du jour</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CalendarIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Aucun rendez-vous aujourd'hui</p>
                <p className="text-sm text-gray-500 mt-2">Profitez de cette journée libre ! 🌟</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getTypeIcon(appointment.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white">{appointment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{appointment.clientName}</p>
                        {appointment.location && (
                          <p className="text-sm text-gray-400">{appointment.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-lg">{appointment.startTime} - {appointment.endTime}</p>
                      <p className="text-sm text-gray-400">{appointment.clientPhone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendez-vous vocaux Section */}
      {hasPermission('canUseVoiceControl') && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-600">
          <div className="p-6 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Rendez-vous vocaux</h2>
                  <p className="text-sm text-gray-300">Créez et gérez vos rendez-vous par la voix</p>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceControl(!showVoiceControl)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Mic className="h-5 w-5" />
                <span>{showVoiceControl ? 'Masquer' : 'Activer'} le contrôle vocal</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-blue-300 mb-3">Commandes disponibles</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>"Créer un rendez-vous avec [nom] [date] à [heure]"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>"Modifier le rendez-vous de [nom]"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>"Supprimer le rendez-vous de [nom]"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>"Voir la liste des rendez-vous"</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                <h3 className="font-semibold text-purple-300 mb-3">Avantages du vocal</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Création rapide de rendez-vous</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span>Interface naturelle et intuitive</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Gain de temps considérable</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-400" />
                    <span>Génération automatique de devis</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {!showVoiceControl && (
              <div className="mt-6 text-center">
                <p className="text-gray-400 mb-4">Activez le contrôle vocal pour commencer à créer des rendez-vous par la voix</p>
                <button
                  onClick={() => setShowVoiceControl(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg transform hover:scale-105"
                >
                  <Mic className="h-5 w-5" />
                  <span>Commencer l'enregistrement vocal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      {hasPermission('canViewQuotes') && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-600">
          <div className="p-6 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Devis récents</h2>
                  <p className="text-sm text-gray-300">Vos derniers devis créés</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Aucun devis créé</p>
                <p className="text-sm text-gray-500 mt-2">
                  {hasPermission('canCreateQuotes') 
                    ? 'Créez votre premier devis'
                    : 'Vous n\'avez pas les droits pour créer des devis'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">📋</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white">#{quote.number}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'draft' ? 'text-gray-300 bg-gray-700' :
                            quote.status === 'sent' ? 'text-blue-300 bg-blue-900/50' :
                            quote.status === 'accepted' ? 'text-green-300 bg-green-900/50' :
                            'text-red-300 bg-red-900/50'
                          }`}>
                            {quote.status === 'draft' ? 'Brouillon' :
                             quote.status === 'sent' ? 'Envoyé' :
                             quote.status === 'accepted' ? 'Accepté' : 'Refusé'}
                          </span>
                          {quote.transcription && (
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                              🎤 Vocal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{quote.clientName}</p>
                        <p className="text-sm text-gray-400">{new Date(quote.createdDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-lg">{quote.totalAmount.toFixed(2)} € HT</p>
                      <p className="text-sm text-gray-300">{(quote.totalAmount * (1 + (quote.vatRate || 20) / 100)).toFixed(2)} € TTC</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;