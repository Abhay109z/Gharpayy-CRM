export type LeadStage =
  | 'new_lead'
  | 'contacted'
  | 'tour_scheduled'
  | 'tour_completed'
  | 'quote_sent'
  | 'decision_pending'
  | 'booking_confirmed'
  | 'money_pending'
  | 'check_in_done'
  | 'lost';

export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'operator' | 'system';
  senderName: string;
  timestamp: string;
  text: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface RecommendedProperty {
  id: string;
  title: string;
  locality: string;
  monthlyRent: number;
  deposit: number;
  roomType: 'Private Room' | 'Shared Room' | '1 BHK' | '2 BHK';
  furnishing: 'Fully Furnished' | 'Semi Furnished';
  availableFrom: string;
  walkingToMetro: string;
  photos: string[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  locality: string;
  budget: number;
  occupancyType: 'Single' | 'Double' | 'Family';
  propertyType: 'Coliving PG' | 'Private Room' | '1 BHK' | '2 BHK';
  moveInDate: string;
  stage: LeadStage;
  owner: string;
  deadline: string; // ISO string
  isOverdue?: boolean;
  overdueMinutes?: number;
  urgency: 'high' | 'medium' | 'low';
  
  // M-Power Call Dossier
  whyWeAreCalling: string;
  whatIsAlreadyKnown: {
    budget: string;
    targetLocation: string;
    workplace: string;
    foodPreference: string;
    stayDuration: string;
  };
  whatToConfirm: string[];
  callScriptPoints: string[];
  
  // Call Output / State
  lastCallNotes?: string;
  lastCallOutcome?: 'tour_scheduled' | 'follow_up_needed' | 'quote_requested' | 'not_interested' | 'unreachable';
  lastCallTimestamp?: string;
  
  // Matched property
  recommendedProperty?: RecommendedProperty;
  
  // Scheduling & Closing details
  tourDate?: string;
  tourTime?: string;
  tourType?: 'In-Person Physical' | 'Live Video Tour';
  
  // Auto-generated communications
  autoCustomerMessage?: string;
  autoNextStep?: string;
  autoFollowUpDeadline?: string;
  
  // Closing Desk fields
  quoteAmount?: number;
  depositRequired?: number;
  tokenPaid?: number;
  moneyPending?: number;
  promisedClosingTime?: string; // ISO string
  checkInDate?: string;
  kycStatus?: 'pending' | 'verified' | 'uploaded';
  
  // WhatsApp history
  whatsappMessages: WhatsAppMessage[];
  
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operatorName: string;
  leadId: string;
  leadName: string;
  module: 'M-POWER CALL' | 'Booking Flow Split' | 'Movement CARE' | 'Movement OS' | 'Closing Desk' | 'Admin';
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface DailyCarePromise {
  id: string;
  date: string;
  operatorName: string;
  targetCalls: number;
  targetTours: number;
  targetClosings: number;
  promisedClosingNotes: string;
  leadIds: string[];
  completedLeadIds: string[];
  status: 'active' | 'completed';
  whatsappSummaryText: string;
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  role: 'Lead Operator' | 'Tour Specialist' | 'Closing Manager' | 'Team Lead / Founder';
  avatarBg: string;
  initials: string;
}

export interface MongoDbStatus {
  connected: boolean;
  dbName: string;
  uriConfigured: boolean;
  maskedUri: string | null;
  error: string | null;
  leadCount: number;
  auditCount: number;
}

