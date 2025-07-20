import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Download, Search, Filter, Calculator, FileText, Euro, Calendar, User, Phone, Mail, MapPin, Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Quote, QuoteItem } from '../types';
import QuotePreview from './QuotePreview';

const Quotes: React.FC = () => {
  const { quotes, pricingSettings, addQuote, updateQuote, deleteQuote } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [processedTranscripts, setProcessedTranscripts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    items: [] as QuoteItem[],
    totalAmount: 0,
    vatRate: 20,
    status: 'draft' as const,
    notes: ''
  });

  // Initialisation de la reconnaissance vocale avec contrôle manuel
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configuration optimisée
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
        
        // Afficher la transcription en temps réel
        const fullTranscript = finalTranscript || interimTranscript;
        if (fullTranscript) {
          setVoiceTranscription(fullTranscript);
        }
        
        // Traiter seulement les résultats finaux uniques
        if (finalTranscript && !processedTranscripts.has(finalTranscript.trim())) {
          console.log('🎤 Nouveau transcript final:', finalTranscript);
          setProcessedTranscripts(prev => new Set(prev).add(finalTranscript.trim()));
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Erreur reconnaissance vocale:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🔚 Reconnaissance vocale terminée');
        // Ne pas arrêter automatiquement - seulement si l'utilisateur le demande
      };

      recognition.onstart = () => {
        console.log('🎤 Reconnaissance vocale démarrée');
      };

      setRecognition(recognition);
    }
  }, [processedTranscripts]);

  const startVoiceCommand = () => {
    if (recognition) {
      setVoiceTranscription('');
      setProcessedTranscripts(new Set());
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

  const stopVoiceCommand = () => {
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

  const processVoiceCommand = (transcript: string) => {
    const normalizedText = transcript.toLowerCase();
    console.log('🎤 Traitement de la commande vocale:', transcript);

    extractClientInfo(normalizedText);
    extractServices(normalizedText);
  };

  const extractClientInfo = (text: string) => {
    const patterns = {
      name: [
        /(?:client|pour|monsieur|madame|m\.|mme)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s+(?:téléphone|tel|phone|numéro|email|mail|adresse|habite|demeure))/i,
        /(?:nom|appelle|s'appelle)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s+(?:téléphone|tel|phone|numéro|email|mail|adresse))/i
      ],
      phone: [
        /(?:téléphone|tel|phone|numéro|portable|mobile)\s*:?\s*([0-9\s\.\-]{10,})/i,
        /([0-9]{2}[\s\.\-]?[0-9]{2}[\s\.\-]?[0-9]{2}[\s\.\-]?[0-9]{2}[\s\.\-]?[0-9]{2})/
      ],
      email: [
        /(?:email|mail|e-mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      ],
      address: [
        /(?:adresse|habite|demeure|situé|rue|avenue|boulevard)\s+(.+?)(?:\s+(?:téléphone|tel|email|mail|pour|travaux))/i,
        /(?:à|au|sur)\s+([0-9]+.*?(?:rue|avenue|boulevard|place|chemin|impasse).*?)(?:\s+(?:téléphone|tel|email))/i
      ]
    };

    for (const pattern of patterns.name) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim().replace(/\s+/g, ' ');
        if (name.length > 2 && name.length < 50) {
          setFormData(prev => ({ ...prev, clientName: name }));
          console.log('✅ Nom client extrait:', name);
          break;
        }
      }
    }

    for (const pattern of patterns.phone) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const phone = match[1].replace(/[\s\.\-]/g, ' ').trim();
        if (phone.length >= 10) {
          setFormData(prev => ({ ...prev, clientPhone: phone }));
          console.log('✅ Téléphone extrait:', phone);
          break;
        }
      }
    }

    for (const pattern of patterns.email) {
      const match = text.match(pattern);
      if (match && match[1]) {
        setFormData(prev => ({ ...prev, clientEmail: match[1] }));
        console.log('✅ Email extrait:', match[1]);
        break;
      }
    }

    for (const pattern of patterns.address) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const address = match[1].trim();
        if (address.length > 5 && address.length < 200) {
          setFormData(prev => ({ ...prev, clientAddress: address }));
          console.log('✅ Adresse extraite:', address);
          break;
        }
      }
    }
  };

  const extractServices = (text: string) => {
    const addedServices = new Set<string>();
    
    // Fonction pour convertir les nombres en toutes lettres en chiffres
    const convertWordsToNumbers = (text: string): string => {
      const numberWords: { [key: string]: string } = {
        'un': '1', 'une': '1', 'deux': '2', 'trois': '3', 'quatre': '4', 'cinq': '5',
        'six': '6', 'sept': '7', 'huit': '8', 'neuf': '9', 'dix': '10',
        'onze': '11', 'douze': '12', 'treize': '13', 'quatorze': '14', 'quinze': '15',
        'seize': '16', 'dix-sept': '17', 'dix-huit': '18', 'dix-neuf': '19', 'vingt': '20',
        'vingt-et-un': '21', 'vingt-deux': '22', 'vingt-trois': '23', 'vingt-quatre': '24', 'vingt-cinq': '25',
        'vingt-six': '26', 'vingt-sept': '27', 'vingt-huit': '28', 'vingt-neuf': '29', 'trente': '30',
        'quarante': '40', 'cinquante': '50', 'soixante': '60', 'soixante-dix': '70', 'quatre-vingts': '80', 'quatre-vingt-dix': '90', 'cent': '100'
      };
      
      let result = text;
      Object.entries(numberWords).forEach(([word, number]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, number);
      });
      return result;
    };

    // Convertir les nombres en toutes lettres
    const processedText = convertWordsToNumbers(text);
    
    pricingSettings.forEach(setting => {
      const settingWords = setting.label.toLowerCase().split(' ');
      const categoryWords = setting.category.toLowerCase().split(' ');
      
      // Vérifier si la prestation est mentionnée (plus flexible)
      const hasMatch = settingWords.some(word => 
        word.length > 2 && processedText.toLowerCase().includes(word)
      ) || categoryWords.some(word => 
        word.length > 2 && processedText.toLowerCase().includes(word)
      );
      
      if (hasMatch && !addedServices.has(setting.id)) {
        // Échapper les caractères spéciaux dans le libellé pour les regex
        const escapedLabel = setting.label.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedWords = settingWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        
        // Patterns plus flexibles pour extraire les quantités
        const quantityPatterns = [
          // Quantité avant la prestation : "25 m² peinture intérieure"
          new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)\\s+(?:de\\s+)?(?:.*?\\b(?:${escapedWords.join('|')})\\b)`, 'i'),
          // Quantité après la prestation : "peinture intérieure 25 m²"
          new RegExp(`(?:${escapedWords.join('|')})\\b.*?(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)`, 'i'),
          // Quantité avec "pour" : "peinture pour 25 m²"
          new RegExp(`(?:${escapedWords.join('|')})\\b.*?(?:pour|sur)\\s+(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)`, 'i'),
          // Quantité isolée proche de la prestation (dans un rayon de mots)
          new RegExp(`(?:(?:${escapedWords.join('|')})\\b.{0,50}(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?))|(?:(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?).{0,50}(?:${escapedWords.join('|')})\\b)`, 'i'),
          // Pattern pour les catégories
          new RegExp(`(?:${setting.category.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b.*?(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)`, 'i'),
          new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)\\s+(?:de\\s+)?(?:.*?\\b${setting.category.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'i')
        ];
        
        let quantity = 1;
        for (const pattern of quantityPatterns) {
          const match = processedText.match(pattern);
          if (match) {
            // Chercher le premier groupe de capture qui contient un nombre
            const foundQuantity = match[1] || match[2];
            if (foundQuantity) {
              const extractedQuantity = parseFloat(foundQuantity.replace(',', '.'));
              if (!isNaN(extractedQuantity) && extractedQuantity > 0) {
                quantity = extractedQuantity;
                console.log('✅ Quantité extraite:', extractedQuantity, 'pour', setting.label);
                break;
              }
            }
          }
        }
        
        // Si aucune quantité spécifique n'est trouvée, chercher des quantités générales dans le texte
        if (quantity === 1) {
          const generalQuantityPattern = /(\\d+(?:[,.]\\d+)?)\\s*(?:m²|mètres?\\s*carrés?|mètres?)/gi;
          const generalMatches = [...processedText.matchAll(generalQuantityPattern)];
          if (generalMatches.length === 1) {
            // S'il n'y a qu'une seule quantité dans tout le texte, l'utiliser
            const extractedQuantity = parseFloat(generalMatches[0][1].replace(',', '.'));
            if (!isNaN(extractedQuantity) && extractedQuantity > 0) {
              quantity = extractedQuantity;
              console.log('✅ Quantité générale utilisée:', extractedQuantity, 'pour', setting.label);
            }
          }
        }
        
        // Vérifications supplémentaires pour des mots-clés de quantité
        if (quantity === 1) {
          const quantityKeywords = [
            { pattern: /(?:tout|toute|entier|entière|complet|complète)/i, value: 1 },
            { pattern: /(?:double|deux fois)/i, value: 2 },
            { pattern: /(?:triple|trois fois)/i, value: 3 },
            { pattern: /(?:petit|petite)/i, value: 5 },
            { pattern: /(?:moyen|moyenne)/i, value: 15 },
            { pattern: /(?:grand|grande|gros|grosse)/i, value: 25 }
          ];
          
          for (const keyword of quantityKeywords) {
            if (keyword.pattern.test(processedText)) {
              quantity = keyword.value;
              console.log('✅ Quantité par mot-clé:', quantity, 'pour', setting.label);
              break;
            }
          }
        }
        
        addPredefinedService(setting, quantity);
        addedServices.add(setting.id);
        console.log('✅ Service final ajouté:', setting.label, 'Quantité:', quantity);
      }
    });
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-300 bg-gray-700';
      case 'sent': return 'text-blue-300 bg-blue-900/50';
      case 'accepted': return 'text-green-300 bg-green-900/50';
      case 'rejected': return 'text-red-300 bg-red-900/50';
      default: return 'text-gray-300 bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit: 'm²',
      unitPrice: 0,
      totalPrice: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateQuoteItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeQuoteItem = (itemId: string) => {
    const itemToDelete = formData.items.find(item => item.id === itemId);
    const description = itemToDelete?.description || 'cette ligne';
    const confirmMessage = description.trim() 
      ? `🗑️ Êtes-vous sûr de vouloir supprimer "${description}" ?`
      : '🗑️ Êtes-vous sûr de vouloir supprimer cette ligne ?';
    
    if (confirm(confirmMessage)) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  React.useEffect(() => {
    calculateTotal();
  }, [formData.items]);

  const handleSave = () => {
    // Validation améliorée
    const clientNameValid = formData.clientName && formData.clientName.trim().length > 0;
    const hasItems = formData.items && formData.items.length > 0;
    
    console.log('Validation:', { 
      clientName: formData.clientName, 
      clientNameValid, 
      itemsCount: formData.items.length, 
      hasItems 
    });
    
    if (!clientNameValid) {
      alert('⚠️ Veuillez remplir le nom du client');
      return;
    }
    
    if (!hasItems) {
      alert('⚠️ Veuillez ajouter au moins un élément au devis');
      return;
    }

    const quoteNumber = editingQuote ? editingQuote.number : `DEV-${Date.now()}`;
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    const quote: Omit<Quote, 'id'> = {
      ...formData,
      number: quoteNumber,
      createdDate: editingQuote ? editingQuote.createdDate : new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      transcription: voiceTranscription || undefined
    };

    try {
      if (editingQuote) {
        updateQuote(editingQuote.id, quote);
      } else {
        addQuote(quote);
      }
      resetForm();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde du devis');
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      items: [],
      totalAmount: 0,
      vatRate: 20,
      status: 'draft',
      notes: ''
    });
    setVoiceTranscription('');
    setProcessedTranscripts(new Set());
    setShowForm(false);
    setEditingQuote(null);
    if (isListening) {
      stopVoiceCommand();
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      clientName: quote.clientName,
      clientAddress: quote.clientAddress,
      clientPhone: quote.clientPhone,
      clientEmail: quote.clientEmail,
      items: quote.items,
      totalAmount: quote.totalAmount,
      vatRate: quote.vatRate || 20,
      status: quote.status,
      notes: quote.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (quoteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      deleteQuote(quoteId);
    }
  };

  const addPredefinedService = (setting: any, quantity: number = 1) => {
    const existingItem = formData.items.find(item => 
      item.description === setting.label
    );
    
    if (existingItem) {
      updateQuoteItem(existingItem.id, 'quantity', existingItem.quantity + quantity);
    } else {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        description: setting.label,
        quantity: quantity,
        unit: 'm²',
        unitPrice: setting.pricePerSquareMeter,
        totalPrice: quantity * setting.pricePerSquareMeter
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingQuote ? 'Modifier le devis' : 'Nouveau devis'}
            </h1>
            <p className="text-gray-300 mt-1">Créez et gérez vos devis avec reconnaissance vocale continue</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={isListening ? stopVoiceCommand : startVoiceCommand}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span>{isListening ? 'Arrêter l\'écoute' : 'Commande vocale'}</span>
            </button>
            
            <button
              onClick={resetForm}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Panneau de commande vocale amélioré */}
        {isListening && (
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-center space-x-3 text-purple-300 mb-4">
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
            
            <div className="bg-blue-800/30 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                💡 Contrôle vocal manuel
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
                    <li>"Client Marie Dupont téléphone 06 12 34 56 78"</li>
                    <li>"Peinture intérieure 25 m²"</li>
                    <li>"Email client@email.com adresse 123 rue de la Paix"</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {voiceTranscription && (
              <div className="bg-blue-700/30 rounded-xl p-4 border border-blue-400/30">
                <h4 className="font-medium text-blue-200 mb-2">📝 Transcription en temps réel :</h4>
                <p className="text-white italic">{voiceTranscription}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6 shadow-xl">
          {/* Client Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations client
              {isListening && (
                <span className="ml-3 px-3 py-1 bg-purple-600 text-white text-xs rounded-full animate-pulse">
                  🎤 En cours
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom du client</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Nom complet du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </div>

          {/* Predefined Services */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Services prédéfinis
              {isListening && (
                <span className="ml-3 px-3 py-1 bg-purple-600 text-white text-xs rounded-full animate-pulse">
                  🎤 En cours
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pricingSettings.map((setting) => (
                <button
                  key={setting.id}
                  type="button"
                  onClick={() => addPredefinedService(setting, 1)}
                  className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl p-3 text-left transition-all duration-300 hover:scale-105 hover:border-blue-500/50 group hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="font-medium text-white">{setting.label}</div>
                  <div className="text-sm text-gray-300">{setting.pricePerSquareMeter}€/m²</div>
                  <div className="text-xs text-gray-400">{setting.category}</div>
                  <div className="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    ➕ Cliquer pour ajouter
                  </div>
                </button>
              ))}
            </div>
            
          </div>

          {/* Quote Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Éléments du devis
              </h2>
              <button
                type="button"
                onClick={addQuoteItem}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-600">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">Aucun élément dans le devis</p>
                <p className="text-sm text-gray-500 mb-4">
                  Ajoutez des services prédéfinis ou créez une ligne manuelle
                </p>
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter votre première ligne</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item) => (
                  <div key={item.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                          placeholder="Description du service"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quantité</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Prix unitaire (€)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-300 mb-2">Total (€)</div>
                          <div className="px-3 py-2 bg-blue-600 rounded-lg text-white font-bold text-center">
                            {item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuoteItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded-lg"
                          title="Supprimer cette ligne"
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

          {/* VAT and Total */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">TVA</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatRate"
                      value={10}
                      checked={formData.vatRate === 10}
                      onChange={(e) => setFormData(prev => ({ ...prev, vatRate: parseInt(e.target.value) }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">TVA 10% (travaux de rénovation)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatRate"
                      value={20}
                      checked={formData.vatRate === 20}
                      onChange={(e) => setFormData(prev => ({ ...prev, vatRate: parseInt(e.target.value) }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">TVA 20% (travaux neufs)</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Totaux</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total HT :</span>
                    <span className="text-white font-medium">{formData.totalAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">TVA ({formData.vatRate}%) :</span>
                    <span className="text-white font-medium">{(formData.totalAmount * formData.vatRate / 100).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-white font-bold">Total TTC :</span>
                    <span className="text-white font-bold">{(formData.totalAmount * (1 + formData.vatRate / 100)).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Notes additionnelles"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <FileText className="h-5 w-5" />
              <span>{editingQuote ? 'Mettre à jour' : 'Créer le devis'}</span>
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300"
            >
              Annuler
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
          <h1 className="text-3xl font-bold text-white">Devis</h1>
          <p className="text-gray-300 mt-1">Créez et gérez vos devis avec reconnaissance vocale ultra-robuste</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau devis</span>
        </button>
      </div>

      {/* Voice Control Info Panel */}
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-2xl p-6 border border-blue-500/30 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Volume2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Devis vocaux avec contrôle manuel</h2>
            <p className="text-sm text-blue-200">Système de reconnaissance vocale avec démarrage et arrêt manuel</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-800/30 rounded-xl p-4">
            <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              🎯 Contrôle manuel
            </h3>
            <ul className="text-sm text-blue-100 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Démarrage manuel uniquement</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Arrêt manuel quand vous voulez</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Pas de redémarrage automatique</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Contrôle total de l'enregistrement</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-800/30 rounded-xl p-4">
            <h3 className="font-semibold text-indigo-200 mb-3">Exemples de commandes</h3>
            <ul className="text-sm text-indigo-100 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-lg">👤</span>
                <span>"Client Marie Dupont téléphone 06 12 34 56 78"</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🎨</span>
                <span>"Peinture intérieure 25 m²"</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🏠</span>
                <span>"Carrelage sol 15 mètres carrés"</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">📧</span>
                <span>"Email client@example.com adresse 123 rue de la Paix"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="h-4 w-4 inline mr-2" />
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Nom du client ou numéro..."
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
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 shadow-xl">
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">
            {filteredQuotes.length} devis trouvé{filteredQuotes.length > 1 ? 's' : ''}
          </h2>
        </div>
        
        <div className="p-6">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">Aucun devis trouvé</p>
              <p className="text-sm text-gray-500 mt-2">Créez votre premier devis avec reconnaissance vocale ultra-robuste</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Créer mon premier devis</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-white">#{quote.number}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                          TVA {quote.vatRate || 20}%
                        </span>
                        {quote.transcription && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                            🎤 Vocal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{quote.clientName}</p>
                      <p className="text-sm text-gray-400">{quote.clientAddress}</p>
                      <p className="text-xs text-gray-500">{new Date(quote.createdDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold text-white text-lg">{quote.totalAmount.toFixed(2)} € HT</p>
                      <p className="text-sm text-gray-300">{(quote.totalAmount * (1 + (quote.vatRate || 20) / 100)).toFixed(2)} € TTC</p>
                      <p className="text-xs text-gray-400">{quote.items.length} ligne{quote.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewQuote(quote)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Voir le devis"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(quote)}
                        className="text-green-400 hover:text-green-300 transition-colors p-2 hover:bg-gray-600 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quote.id)}
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

      {/* Quote Preview Modal */}
      {previewQuote && (
        <QuotePreview
          quote={previewQuote}
          onClose={() => setPreviewQuote(null)}
        />
      )}
    </div>
  );
};

export default Quotes;