import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Phone } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  onAppointmentSelect?: (appointmentId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, onAppointmentSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 7)); // 7 juillet 2025 (mois 6 = juillet car indexé à 0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getAppointmentsByDate } = useAppointments();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-blue-500';
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

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 shadow-xl">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={previousMonth}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayAppointments = getAppointmentsByDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[120px] p-3 border border-gray-700 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105
                  ${isSelected ? 'ring-2 ring-blue-500 bg-gray-700 shadow-lg' : ''}
                  ${!isCurrentMonth ? 'opacity-50' : ''}
                  ${isDayToday ? 'bg-blue-900/30 border-blue-500 shadow-lg' : ''}
                `}
              >
                <div className={`text-sm font-bold mb-2 ${isDayToday ? 'text-blue-400' : 'text-white'}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentSelect?.(appointment.id);
                      }}
                      className={`
                        text-xs p-2 rounded-lg text-white cursor-pointer hover:opacity-80 transition-all duration-300 transform hover:scale-105
                        ${getStatusColor(appointment.status)}
                      `}
                      title={`${appointment.title} - ${appointment.startTime}`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{getTypeIcon(appointment.type)}</span>
                        <span className="truncate font-medium">{appointment.clientName}</span>
                      </div>
                      <div className="text-xs opacity-90 mt-1">{appointment.startTime}</div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-400 text-center py-1 bg-gray-700 rounded-lg">
                      +{dayAppointments.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t border-gray-600 p-6 bg-gray-800/50">
          <h3 className="text-xl font-bold text-white mb-4">
            {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </h3>
          
          {getAppointmentsByDate(selectedDate).length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">Aucun rendez-vous prévu</p>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg">
                <Plus className="h-4 w-4" />
                <span>Ajouter un rendez-vous</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {getAppointmentsByDate(selectedDate).map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-gray-600 hover:border-gray-500"
                  onClick={() => onAppointmentSelect?.(appointment.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getTypeIcon(appointment.type)}</span>
                        <h4 className="font-semibold text-white">{appointment.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
                        </div>
                        
                        {appointment.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                        
                        {appointment.clientPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.clientPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {appointment.description && (
                    <p className="text-sm text-gray-400 mt-3 p-3 bg-gray-800 rounded-lg">{appointment.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;