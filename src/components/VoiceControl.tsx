import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment } from '../types';
import { format, parse, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VoiceControlProps {
  onCommandProcessed?: (command: string, success: boolean) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCommandProcessed }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [feedback, setFeedback] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { addAppointment, updateAppointment, deleteAppointment, appointments } = useAppointments();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configuration pour contrôle manuel
      recognition.continuous = true; // Permet l'enregistrement continu
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
      
      // Configuration spéciale pour éviter l'arrêt automatique
      if ('webkitSpeechRecognition' in window) {
        // Pour Chrome/Safari - empêcher l'arrêt automatique
        recognition.continuous = true;
        recognition.interimResults = true;
      }

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscription(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setFeedback('❌ Erreur de reconnaissance vocale. Veuillez réessayer.');
      };

      recognition.onend = () => {
        console.log('🔚 Reconnaissance vocale terminée');
        setIsListening(false);
        // Ne pas redémarrer automatiquement - seulement si l'utilisateur le demande
      };

      recognition.onstart = () => {
        console.log('🎤 Reconnaissance vocale démarrée');
      };

      setRecognition(recognition);
    } else {
      setFeedback('❌ La reconnaissance vocale n\'est pas supportée par votre navigateur.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscription('');
      setFeedback('');
      setIsListening(true);
      
      try {
        // Configuration spéciale pour Chrome pour éviter l'arrêt automatique
        if (recognition.continuous !== undefined) {
          recognition.continuous = true;
        }
        
        recognition.start();
        console.log('🎤 Démarrage de la reconnaissance vocale...');
      } catch (error) {
        console.log('❌ Impossible de démarrer la reconnaissance vocale');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    console.log('🛑 Arrêt de la reconnaissance vocale demandé');
    setIsListening(false);
    
    if (recognition) {
      try {
        recognition.continuous = false; // Arrêter le mode continu
        recognition.stop();
      } catch (error) {
        console.log('⚠️ Erreur lors de l\'arrêt:', error);
      }
    }
  };

  const processVoiceCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    setLastCommand(command);
    
    try {
      // Commandes de création de rendez-vous
      if (normalizedCommand.includes('créer') || normalizedCommand.includes('nouveau') || normalizedCommand.includes('planifier') || normalizedCommand.includes('ajouter')) {
        handleCreateAppointment(normalizedCommand);
        return;
      }

      // Commandes de modification
      if (normalizedCommand.includes('modifier') || normalizedCommand.includes('changer') || normalizedCommand.includes('déplacer')) {
        handleModifyAppointment(normalizedCommand);
        return;
      }

      // Commandes de suppression
      if (normalizedCommand.includes('supprimer') || normalizedCommand.includes('annuler') || normalizedCommand.includes('effacer')) {
        handleDeleteAppointment(normalizedCommand);
        return;
      }

      // Commandes de consultation
      if (normalizedCommand.includes('liste') || normalizedCommand.includes('voir') || normalizedCommand.includes('afficher') || normalizedCommand.includes('rendez-vous')) {
        handleListAppointments(normalizedCommand);
        return;
      }

      onCommandProcessed?.(command, false);
      setFeedback("Commande non reconnue. Essayez : 'créer un rendez-vous', 'modifier', 'supprimer' ou 'voir la liste'.");
      speak("Je n'ai pas compris cette commande. Essayez 'créer un rendez-vous', 'modifier', 'supprimer' ou 'voir la liste'.");
    } catch (error) {
      console.error('Error processing voice command:', error);
      onCommandProcessed?.(command, false);
      setFeedback("Une erreur s'est produite lors du traitement de votre commande.");
      speak("Une erreur s'est produite lors du traitement de votre commande.");
    }
  };

  const handleCreateAppointment = (command: string) => {
    // Extraction améliorée des informations
    const clientMatch = command.match(/(?:avec|pour|client)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s+(?:le|à|pour|demain|aujourd'hui|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche))/i);
    const dateMatch = command.match(/(aujourd'hui|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i);
    const timeMatch = command.match(/(?:à|vers)\s*(\d{1,2})(?:h|:)(\d{2})?/i);
    const typeMatch = command.match(/(devis|travaux|consultation|suivi|visite|réparation|peinture|carrelage)/i);

    let appointmentDate = new Date();
    if (dateMatch) {
      const dateStr = dateMatch[1].toLowerCase();
      if (dateStr === 'demain') {
        appointmentDate = addDays(new Date(), 1);
      }
      // Ajouter plus de logique pour les jours de la semaine
    }

    let startTime = '09:00';
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2] ? timeMatch[2] : '00';
      startTime = `${hours}:${minutes}`;
    }

    const clientName = clientMatch ? clientMatch[1].trim() : 'Client non spécifié';
    const appointmentType = typeMatch ? typeMatch[1] : 'consultation';

    // Calculer l'heure de fin (1 heure par défaut)
    const startDate = parse(startTime, 'HH:mm', new Date());
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endTime = format(endDate, 'HH:mm');

    const newAppointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${appointmentType} - ${clientName}`,
      description: `Rendez-vous créé par commande vocale`,
      clientName,
      date: format(appointmentDate, 'yyyy-MM-dd'),
      startTime,
      endTime,
      status: 'scheduled',
      type: appointmentType as any || 'consultation',
      notes: `Commande vocale: ${command}`
    };

    addAppointment(newAppointment);
    onCommandProcessed?.(command, true);
    const feedback = `Rendez-vous créé pour ${clientName} le ${format(appointmentDate, 'dd MMMM', { locale: fr })} à ${startTime}.`;
    setFeedback(feedback);
    speak(feedback);
  };

  const handleModifyAppointment = (command: string) => {
    const clientMatch = command.match(/(?:de|pour)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s+(?:à|vers|le))/i);
    
    if (clientMatch) {
      const clientName = clientMatch[1].trim();
      const appointment = appointments.find(apt => 
        apt.clientName.toLowerCase().includes(clientName.toLowerCase())
      );

      if (appointment) {
        const timeMatch = command.match(/(?:à|vers)\s*(\d{1,2})(?:h|:)(\d{2})?/i);
        const dateMatch = command.match(/(aujourd'hui|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i);

        const updates: Partial<Appointment> = {};

        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2] ? timeMatch[2] : '00';
          updates.startTime = `${hours}:${minutes}`;
          const startDate = parse(updates.startTime, 'HH:mm', new Date());
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          updates.endTime = format(endDate, 'HH:mm');
        }

        if (dateMatch) {
          let newDate = new Date();
          if (dateMatch[1].toLowerCase() === 'demain') {
            newDate = addDays(new Date(), 1);
          }
          updates.date = format(newDate, 'yyyy-MM-dd');
        }

        updateAppointment(appointment.id, updates);
        onCommandProcessed?.(command, true);
        const feedback = `Rendez-vous de ${clientName} modifié avec succès.`;
        setFeedback(feedback);
        speak(feedback);
      } else {
        onCommandProcessed?.(command, false);
        const feedback = `Aucun rendez-vous trouvé pour ${clientName}.`;
        setFeedback(feedback);
        speak(feedback);
      }
    } else {
      onCommandProcessed?.(command, false);
      const feedback = "Veuillez préciser le nom du client pour modifier le rendez-vous.";
      setFeedback(feedback);
      speak(feedback);
    }
  };

  const handleDeleteAppointment = (command: string) => {
    const clientMatch = command.match(/(?:de|pour)\s+([a-zA-ZÀ-ÿ\s]+)/i);
    
    if (clientMatch) {
      const clientName = clientMatch[1].trim();
      const appointment = appointments.find(apt => 
        apt.clientName.toLowerCase().includes(clientName.toLowerCase())
      );

      if (appointment) {
        deleteAppointment(appointment.id);
        onCommandProcessed?.(command, true);
        const feedback = `Rendez-vous de ${clientName} supprimé avec succès.`;
        setFeedback(feedback);
        speak(feedback);
      } else {
        onCommandProcessed?.(command, false);
        const feedback = `Aucun rendez-vous trouvé pour ${clientName}.`;
        setFeedback(feedback);
        speak(feedback);
      }
    } else {
      onCommandProcessed?.(command, false);
      const feedback = "Veuillez préciser le nom du client pour supprimer le rendez-vous.";
      setFeedback(feedback);
      speak(feedback);
    }
  };

  const handleListAppointments = (command: string) => {
    const todayAppointments = appointments.filter(apt => apt.date === format(new Date(), 'yyyy-MM-dd'));
    
    if (todayAppointments.length === 0) {
      const feedback = "Aucun rendez-vous prévu pour aujourd'hui.";
      setFeedback(feedback);
      speak(feedback);
    } else {
      const appointmentList = todayAppointments.map(apt => 
        `${apt.clientName} à ${apt.startTime}`
      ).join(', ');
      const feedback = `Rendez-vous d'aujourd'hui: ${appointmentList}.`;
      setFeedback(feedback);
      speak(feedback);
    }
    
    onCommandProcessed?.(command, true);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Volume2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Contrôle Vocal</h2>
            <p className="text-sm text-gray-300">Parlez pour gérer vos rendez-vous</p>
          </div>
        </div>
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span>{isListening ? 'Arrêter' : 'Écouter'}</span>
        </button>
      </div>

      {isListening && (
        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 border border-blue-500/30 shadow-xl mb-6">
          <div className="flex items-center justify-center space-x-3 text-blue-300 mb-4">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
            <span className="text-lg font-medium">
              🎤 ÉCOUTE ACTIVE - CONTRÔLE MANUEL
            </span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
          
          <div className="bg-blue-800/30 rounded-xl p-4">
            <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Contrôle vocal manuel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-100">
              <div>
                <p className="font-medium text-blue-200 mb-1">🎯 Contrôle manuel :</p>
                <ul className="space-y-1 text-xs">
                  <li>• Démarrage et arrêt manuel</li>
                  <li>• Pas de redémarrage automatique</li>
                  <li>• Contrôle total de l'enregistrement</li>
                  <li>• Cliquez pour arrêter quand vous voulez</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-200 mb-1">🎯 Exemples d'utilisation :</p>
                <ul className="space-y-1 text-xs">
                  <li>"Créer un rendez-vous avec Marie Dupont demain à 14h"</li>
                  <li>"Modifier le rendez-vous de Jean Martin à 15h"</li>
                  <li>"Supprimer le rendez-vous de Pierre Durand"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isListening && transcription && (
        <div className="bg-blue-700/30 rounded-xl p-4 border border-blue-400/30 mb-6">
          <h4 className="font-medium text-blue-200 mb-2">📝 Transcription en temps réel :</h4>
          <p className="text-white italic">{transcription}</p>
        </div>
      )}

      {!isListening && (
        <div className="flex items-center justify-center space-x-3 text-gray-400 mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">🎤 Prêt à écouter - Cliquez sur "Écouter" pour commencer</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Exemples de commandes :
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>"Créer un rendez-vous avec Marie Dupont demain à 14h"</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>"Modifier le rendez-vous de Jean Martin à 15h"</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>"Supprimer le rendez-vous de Pierre Durand"</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span>"Voir la liste des rendez-vous"</span>
            </li>
          </ul>
        </div>

        {transcription && (
          <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
            <h3 className="font-medium text-blue-300 mb-2">Transcription en cours :</h3>
            <p className="text-white italic">{transcription}</p>
          </div>
        )}

        {feedback && (
          <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
            <h3 className="font-medium text-green-300 mb-2">Réponse :</h3>
            <p className="text-white">{feedback}</p>
          </div>
        )}

        {lastCommand && (
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="font-medium text-gray-300 mb-2">Dernière commande traitée :</h3>
            <p className="text-gray-200 italic">"{lastCommand}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControl;