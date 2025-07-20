import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PricingSetting, Quote, CompanyInfo } from '../types';

interface DataContextType {
  pricingSettings: PricingSetting[];
  quotes: Quote[];
  companyInfo: CompanyInfo;
  addPricingSetting: (setting: Omit<PricingSetting, 'id'>) => void;
  updatePricingSetting: (id: string, setting: Partial<PricingSetting>) => void;
  deletePricingSetting: (id: string) => void;
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_PRICING_SETTINGS: PricingSetting[] = [
  {
    id: '1',
    label: 'Peinture intérieure',
    pricePerSquareMeter: 25,
    category: 'Peinture'
  },
  {
    id: '2',
    label: 'Peinture extérieure',
    pricePerSquareMeter: 35,
    category: 'Peinture'
  },
  {
    id: '3',
    label: 'Carrelage sol',
    pricePerSquareMeter: 45,
    category: 'Carrelage'
  },
  {
    id: '4',
    label: 'Carrelage mural',
    pricePerSquareMeter: 40,
    category: 'Carrelage'
  }
];

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Arc en ciel peinture',
  address: '290 AVENUE DE VERDUN',
  city: '84120 PERTUIS',
  phone: '04 86 39 99 59',
  email: 'Peinture.aec@Gmail.com',
  siret: '851 736 975 00018'
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricingSettings, setPricingSettings] = useState<PricingSetting[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);

  useEffect(() => {
    const savedPricing = localStorage.getItem('pricing_settings');
    if (savedPricing) {
      setPricingSettings(JSON.parse(savedPricing));
    } else {
      setPricingSettings(DEFAULT_PRICING_SETTINGS);
      localStorage.setItem('pricing_settings', JSON.stringify(DEFAULT_PRICING_SETTINGS));
    }

    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
      // Migration pour ajouter le champ vatRate aux anciens devis
      const parsedQuotes = JSON.parse(savedQuotes);
      const migratedQuotes = parsedQuotes.map((quote: any) => ({
        ...quote,
        vatRate: quote.vatRate || 20 // Valeur par défaut pour les anciens devis
      }));
      setQuotes(migratedQuotes);
      localStorage.setItem('quotes', JSON.stringify(migratedQuotes));
    }

    const savedCompanyInfo = localStorage.getItem('company_info');
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo));
    } else {
      localStorage.setItem('company_info', JSON.stringify(DEFAULT_COMPANY_INFO));
    }
  }, []);

  const addPricingSetting = (setting: Omit<PricingSetting, 'id'>) => {
    const newSetting = {
      ...setting,
      id: Date.now().toString()
    };
    const updated = [...pricingSettings, newSetting];
    setPricingSettings(updated);
    localStorage.setItem('pricing_settings', JSON.stringify(updated));
  };

  const updatePricingSetting = (id: string, setting: Partial<PricingSetting>) => {
    const updated = pricingSettings.map(p => 
      p.id === id ? { ...p, ...setting } : p
    );
    setPricingSettings(updated);
    localStorage.setItem('pricing_settings', JSON.stringify(updated));
  };

  const deletePricingSetting = (id: string) => {
    const updated = pricingSettings.filter(p => p.id !== id);
    setPricingSettings(updated);
    localStorage.setItem('pricing_settings', JSON.stringify(updated));
  };

  const addQuote = (quote: Omit<Quote, 'id'>) => {
    const newQuote = {
      ...quote,
      id: Date.now().toString(),
      vatRate: quote.vatRate || 20 // S'assurer qu'il y a toujours un taux de TVA
    };
    const updated = [...quotes, newQuote];
    setQuotes(updated);
    localStorage.setItem('quotes', JSON.stringify(updated));
  };

  const updateQuote = (id: string, quote: Partial<Quote>) => {
    const updated = quotes.map(q => 
      q.id === id ? { ...q, ...quote } : q
    );
    setQuotes(updated);
    localStorage.setItem('quotes', JSON.stringify(updated));
  };

  const deleteQuote = (id: string) => {
    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated);
    localStorage.setItem('quotes', JSON.stringify(updated));
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem('company_info', JSON.stringify(info));
  };

  return (
    <DataContext.Provider value={{
      pricingSettings,
      quotes,
      companyInfo,
      addPricingSetting,
      updatePricingSetting,
      deletePricingSetting,
      addQuote,
      updateQuote,
      deleteQuote,
      updateCompanyInfo
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};