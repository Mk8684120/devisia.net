export interface Appointment {
  id: string;
  title: string;
  description?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'consultation' | 'work' | 'estimate' | 'follow-up' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceCommand {
  action: 'create' | 'modify' | 'delete' | 'list';
  appointmentId?: string;
  data?: Partial<Appointment>;
  transcription: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
}

export interface UserPermissions {
  canCreateAppointments: boolean;
  canEditAppointments: boolean;
  canDeleteAppointments: boolean;
  canViewAppointments: boolean;
  canCreateQuotes: boolean;
  canEditQuotes: boolean;
  canDeleteQuotes: boolean;
  canViewQuotes: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canUseVoiceControl: boolean;
  canExportData: boolean;
}

export interface PricingSetting {
  id: string;
  label: string;
  pricePerSquareMeter: number;
  category: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  number: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: QuoteItem[];
  totalAmount: number;
  vatRate: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdDate: string;
  validUntil: string;
  transcription?: string;
  notes?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  siret: string;
}