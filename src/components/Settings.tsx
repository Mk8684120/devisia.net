import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Building2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PricingSetting, CompanyInfo } from '../types';

const Settings: React.FC = () => {
  const { pricingSettings, companyInfo, addPricingSetting, updatePricingSetting, deletePricingSetting, updateCompanyInfo } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    pricePerSquareMeter: 0,
    category: ''
  });
  const [companyFormData, setCompanyFormData] = useState<CompanyInfo>(companyInfo);

  const handleSave = () => {
    if (editingId) {
      updatePricingSetting(editingId, formData);
      setEditingId(null);
    } else {
      addPricingSetting(formData);
      setIsAdding(false);
    }
    setFormData({ label: '', pricePerSquareMeter: 0, category: '' });
  };

  const handleEdit = (setting: PricingSetting) => {
    setEditingId(setting.id);
    setFormData({
      label: setting.label,
      pricePerSquareMeter: setting.pricePerSquareMeter,
      category: setting.category
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ label: '', pricePerSquareMeter: 0, category: '' });
  };

  const handleCompanyEdit = () => {
    setIsEditingCompany(true);
    setCompanyFormData(companyInfo);
  };

  const handleCompanySave = () => {
    updateCompanyInfo(companyFormData);
    setIsEditingCompany(false);
  };

  const handleCompanyCancel = () => {
    setIsEditingCompany(false);
    setCompanyFormData(companyInfo);
  };

  const categories = [...new Set(pricingSettings.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-300 mt-1">Gérez vos informations d'entreprise et tarifs</p>
        </div>
      </div>

      {/* Company Information Section */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-600">
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">Informations de l'entreprise</h2>
                <p className="text-sm text-gray-300 mt-1">Ces informations apparaîtront sur vos devis</p>
              </div>
            </div>
            {!isEditingCompany && (
              <button
                onClick={handleCompanyEdit}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {isEditingCompany ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={companyFormData.phone}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Numéro de téléphone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={companyFormData.address}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Adresse de l'entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ville</label>
                  <input
                    type="text"
                    value={companyFormData.city}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Code postal et ville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={companyFormData.email}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Adresse email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SIRET</label>
                  <input
                    type="text"
                    value={companyFormData.siret}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, siret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Numéro SIRET"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleCompanySave}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>Enregistrer</span>
                </button>
                <button
                  onClick={handleCompanyCancel}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-400">Nom de l'entreprise</p>
                  <p className="text-white font-medium">{companyInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Adresse</p>
                  <p className="text-white">{companyInfo.address}</p>
                  <p className="text-white">{companyInfo.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">SIRET</p>
                  <p className="text-white">{companyInfo.siret}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-400">Téléphone</p>
                  <p className="text-white">{companyInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Email</p>
                  <p className="text-white">{companyInfo.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Settings Section */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-600">
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Tarifs au m²</h2>
              <p className="text-sm text-gray-300 mt-1">Configurez vos prix par type d'intervention</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un tarif</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Add New Form */}
          {isAdding && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h3 className="font-medium text-white mb-4">Nouveau tarif</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Libellé</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                    placeholder="Ex: Peinture intérieure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prix au m²</label>
                  <input
                    type="number"
                    value={formData.pricePerSquareMeter}
                    onChange={(e) => setFormData({ ...formData, pricePerSquareMeter: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                    placeholder="25.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                    placeholder="Ex: Peinture"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>Enregistrer</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          )}

          {/* Settings List */}
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="font-medium text-white mb-3">{category}</h3>
                <div className="space-y-2">
                  {pricingSettings
                    .filter(setting => setting.category === category)
                    .map((setting) => (
                      <div key={setting.id} className="bg-gray-700 rounded-lg p-4">
                        {editingId === setting.id ? (
                          <div className="grid grid-cols-1 gap-4">
                            <input
                              type="text"
                              value={formData.label}
                              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                              className="px-3 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                              placeholder="Libellé"
                            />
                            <input
                              type="number"
                              value={formData.pricePerSquareMeter}
                              onChange={(e) => setFormData({ ...formData, pricePerSquareMeter: parseFloat(e.target.value) || 0 })}
                              className="px-3 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                              step="0.01"
                              placeholder="Prix au m²"
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={handleSave}
                                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                              >
                                <Save className="h-4 w-4" />
                                <span className="sm:hidden">Enregistrer</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 w-full sm:w-auto"
                              >
                                <X className="h-4 w-4" />
                                <span className="sm:hidden">Annuler</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white">{setting.label}</h4>
                              <p className="text-sm text-gray-300">{setting.pricePerSquareMeter.toFixed(2)} € / m²</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(setting)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-900/20 rounded-lg"
                                title="Modifier"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deletePricingSetting(setting.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded-lg"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;