import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Lead, AuditLog, DailyCarePromise } from './src/types.js';
import dotenv from 'dotenv';
import {
  initMongo,
  fetchAllFromMongo,
  persistAllToMongo,
  saveSingleLeadToMongo,
  saveSingleAuditLogToMongo,
  saveCarePromiseToMongo,
  getMongoStatus
} from './server/mongodb.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data generator
function getInitialSeedLeads(): Lead[] {
  const now = new Date();
  
  const properties = [
    {
      id: 'prop-1',
      title: 'ZenStay Luxury Coliving, Sector 2',
      locality: 'HSR Layout, Bangalore',
      monthlyRent: 16500,
      deposit: 33000,
      roomType: 'Private Room' as const,
      furnishing: 'Fully Furnished' as const,
      availableFrom: 'Immediately',
      walkingToMetro: '6 mins to HSR BDA Complex',
      photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60']
    },
    {
      id: 'prop-2',
      title: 'UrbanHaven Studio 1BHK, 12th Main',
      locality: 'Indiranagar, Bangalore',
      monthlyRent: 26000,
      deposit: 50000,
      roomType: '1 BHK' as const,
      furnishing: 'Fully Furnished' as const,
      availableFrom: 'Oct 1st',
      walkingToMetro: '4 mins to Indiranagar Metro',
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60']
    },
    {
      id: 'prop-3',
      title: 'GreenVista Premium 2BHK Coliving',
      locality: 'Koramangala 4th Block, Bangalore',
      monthlyRent: 19500,
      deposit: 39000,
      roomType: 'Private Room' as const,
      furnishing: 'Fully Furnished' as const,
      availableFrom: 'This Weekend',
      walkingToMetro: '10 mins to Sony Signal',
      photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop&q=60']
    },
    {
      id: 'prop-4',
      title: 'EcoNest Executive Suite, Outer Ring Road',
      locality: 'Bellandur / EcoWorld, Bangalore',
      monthlyRent: 14500,
      deposit: 29000,
      roomType: 'Shared Room' as const,
      furnishing: 'Fully Furnished' as const,
      availableFrom: 'Immediately',
      walkingToMetro: '3 mins to EcoWorld Gate 2',
      photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&auto=format&fit=crop&q=60']
    }
  ];

  return [
    {
      id: 'lead-101',
      name: 'Rohan Varma',
      phone: '+91 98451 22891',
      email: 'rohan.varma@zerodha.in',
      locality: 'HSR Layout, Bangalore',
      budget: 18000,
      occupancyType: 'Single',
      propertyType: 'Private Room',
      moveInDate: '2026-10-01',
      stage: 'new_lead',
      owner: 'Aarav Sharma',
      deadline: new Date(now.getTime() - 42 * 60000).toISOString(), // 42 mins overdue
      isOverdue: true,
      overdueMinutes: 42,
      urgency: 'high',
      whyWeAreCalling: 'Inquired on WhatsApp 45 mins ago asking for single room near HSR Sector 2; starting new job at Zerodha on Monday.',
      whatIsAlreadyKnown: {
        budget: '₹15,000 - ₹18,000 / month',
        targetLocation: 'HSR Layout Sector 1 to 4',
        workplace: 'Zerodha HQ, 4th Cross HSR',
        foodPreference: 'North Indian veg + egg',
        stayDuration: 'Minimum 9 months'
      },
      whatToConfirm: [
        'Move-in date flexibility (1st vs 5th)',
        'Vehicle parking needed (Bike vs Car)',
        'Preferred tour slot today (4 PM vs 6 PM)'
      ],
      callScriptPoints: [
        'Hi Rohan, Aarav here from Gharpayy/LeadZen. Saw your request for a single room in HSR.',
        'We have a newly opened property just 400m from Zerodha HQ with zero brokerage and high-speed fiber WiFi.',
        'Our property manager Suresh can show you the private balcony room today at 5:30 PM. Would that work?'
      ],
      recommendedProperty: properties[0],
      autoCustomerMessage: 'Hi Rohan! Great speaking with you. As discussed, I have held the private balcony room at ZenStay HSR (₹16,500/mo incl. food & wifi) for a physical tour today at 5:30 PM. Property Manager: Suresh (+91 98801 12345). Google Maps: https://maps.app.goo.gl/ZenStayHSR. See you then!',
      autoNextStep: 'Conduct physical tour at ZenStay HSR Sector 2',
      autoFollowUpDeadline: new Date(now.getTime() + 2 * 3600000).toISOString(),
      whatsappMessages: [
        {
          id: 'wm-1',
          sender: 'customer',
          senderName: 'Rohan Varma',
          timestamp: '10:15 AM',
          text: 'Hi, I saw your ad on Instagram for single rooms in HSR. Moving to Bangalore this weekend.'
        },
        {
          id: 'wm-2',
          sender: 'operator',
          senderName: 'Aarav Sharma',
          timestamp: '10:16 AM',
          text: 'Hello Rohan! Welcome to Bangalore. What is your preferred budget and company location?'
        },
        {
          id: 'wm-3',
          sender: 'customer',
          senderName: 'Rohan Varma',
          timestamp: '10:18 AM',
          text: 'Budget around 16k-18k. Workplace is Zerodha in HSR Sector 4. Need good wifi and power backup.'
        }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'lead-102',
      name: 'Ananya Deshmukh',
      phone: '+91 97112 44321',
      email: 'ananya.d@google.com',
      locality: 'Indiranagar, Bangalore',
      budget: 28000,
      occupancyType: 'Single',
      propertyType: '1 BHK',
      moveInDate: '2026-10-05',
      stage: 'tour_scheduled',
      owner: 'Pooja Hegde',
      deadline: new Date(now.getTime() + 18 * 60000).toISOString(),
      isOverdue: false,
      urgency: 'high',
      whyWeAreCalling: 'Tour confirmation call for 1BHK in Indiranagar 12th Main scheduled for 4:00 PM today.',
      whatIsAlreadyKnown: {
        budget: '₹25,000 - ₹30,000 / month',
        targetLocation: 'Indiranagar near 100ft road or Metro',
        workplace: 'Google RMZ Infinity / Hybrid',
        foodPreference: 'Self-cooking modular kitchen',
        stayDuration: '1 year+'
      },
      whatToConfirm: [
        'Arrival time at Indiranagar 12th Main',
        'Check if she needs dedicated 4-wheeler parking slot',
        'Verify immediate token payment readiness if unit meets checklist'
      ],
      callScriptPoints: [
        'Hi Ananya, Pooja from LeadZen. Calling to confirm our 4:00 PM visit at UrbanHaven 1BHK.',
        'The keys are with our on-site executive Vikram. The terrace apartment has modular fittings and washer included.',
        'If you like it, we can lock the early-bird pricing today itself.'
      ],
      recommendedProperty: properties[1],
      tourDate: 'Today',
      tourTime: '4:00 PM',
      tourType: 'In-Person Physical',
      autoCustomerMessage: 'Hi Ananya, confirmed for 4:00 PM tour today at UrbanHaven Studio 1BHK, 12th Main Indiranagar! Vikram (+91 98450 99887) will welcome you at the gate. Pin: https://maps.app.goo.gl/UrbanHavenInd',
      autoNextStep: 'Post-tour decision call at 5:15 PM today',
      autoFollowUpDeadline: new Date(now.getTime() + 90 * 60000).toISOString(),
      whatsappMessages: [
        {
          id: 'wm-4',
          sender: 'customer',
          senderName: 'Ananya Deshmukh',
          timestamp: 'Yesterday 3:30 PM',
          text: 'Is the 1BHK on 12th Main still available?'
        },
        {
          id: 'wm-5',
          sender: 'operator',
          senderName: 'Pooja Hegde',
          timestamp: 'Yesterday 3:35 PM',
          text: 'Yes Ananya! It has a private balcony and full power backup. Would you like a tour?'
        },
        {
          id: 'wm-6',
          sender: 'customer',
          senderName: 'Ananya Deshmukh',
          timestamp: 'Yesterday 4:10 PM',
          text: 'Yes please, can we do 4 PM tomorrow?'
        }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'lead-103',
      name: 'Vikram Rathore',
      phone: '+91 99001 55678',
      email: 'vikram.r@flipkart.com',
      locality: 'Bellandur / EcoWorld',
      budget: 15000,
      occupancyType: 'Single',
      propertyType: 'Coliving PG',
      moveInDate: '2026-09-28',
      stage: 'decision_pending',
      owner: 'Rohan Mehta',
      deadline: new Date(now.getTime() - 95 * 60000).toISOString(), // 95 mins overdue!
      isOverdue: true,
      overdueMinutes: 95,
      urgency: 'high',
      whyWeAreCalling: 'Completed tour yesterday at EcoNest Bellandur; quote sent at ₹14,500; token pending to hold room.',
      whatIsAlreadyKnown: {
        budget: '₹14,000 - ₹15,500',
        targetLocation: 'Bellandur near EcoWorld Gate 2',
        workplace: 'Flipkart Campus',
        foodPreference: '3 times meals included',
        stayDuration: '6 months'
      },
      whatToConfirm: [
        'Any questions on the rent agreement terms',
        'Locking room #304 with ₹3,000 token before another applicant takes it',
        'Target check-in time this Saturday'
      ],
      callScriptPoints: [
        'Hey Vikram! Rohan following up from your tour yesterday at EcoNest.',
        'You loved room #304 with the east-facing window. We received another inquiry this morning.',
        'Can I generate the instant UPI payment link for the ₹3,000 token right now so your room is 100% reserved?'
      ],
      recommendedProperty: properties[3],
      quoteAmount: 14500,
      depositRequired: 29000,
      tokenPaid: 0,
      moneyPending: 29000,
      promisedClosingTime: new Date(now.getTime() - 30 * 60000).toISOString(),
      autoCustomerMessage: 'Hi Vikram! To hold Room #304 at EcoNest Bellandur (₹14,500/mo), please click this secure UPI link to pay the ₹3,000 advance token: https://pay.gharpayy.com/token/eco-304. Receipt will be generated instantly.',
      autoNextStep: 'Collect ₹3,000 token or release inventory',
      autoFollowUpDeadline: new Date(now.getTime() + 30 * 60000).toISOString(),
      whatsappMessages: [
        {
          id: 'wm-7',
          sender: 'operator',
          senderName: 'Rohan Mehta',
          timestamp: 'Yesterday 6:00 PM',
          text: 'Great meeting you at EcoNest Vikram! Sent you the full pricing breakdown.'
        },
        {
          id: 'wm-8',
          sender: 'customer',
          senderName: 'Vikram Rathore',
          timestamp: 'Yesterday 6:45 PM',
          text: 'Thanks Rohan, really liked room 304. Just reviewing with my roommate.'
        }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'lead-104',
      name: 'Kavya Iyer',
      phone: '+91 98200 88712',
      email: 'kavya.iyer@swiggy.in',
      locality: 'Koramangala 4th Block',
      budget: 20000,
      occupancyType: 'Single',
      propertyType: 'Private Room',
      moveInDate: '2026-10-01',
      stage: 'booking_confirmed',
      owner: 'Sneha Rao',
      deadline: new Date(now.getTime() + 120 * 60000).toISOString(),
      isOverdue: false,
      urgency: 'medium',
      whyWeAreCalling: 'Token ₹5,000 received; collecting KYC documents and pending deposit before key handover.',
      whatIsAlreadyKnown: {
        budget: '₹19,500 / month',
        targetLocation: 'Koramangala 4th Block',
        workplace: 'Swiggy Corporate Office',
        foodPreference: 'South/North Veg',
        stayDuration: '11 months'
      },
      whatToConfirm: [
        'Aadhaar card + Employment ID verification upload',
        'Remaining security deposit balance payment method (NetBanking/UPI)',
        'Move-in day luggage arrival time'
      ],
      callScriptPoints: [
        'Hi Kavya, Sneha here! Congratulations on locking Room #201 at GreenVista Koramangala.',
        'Your advance token of ₹5,000 is safely credited. I have sent the one-click KYC portal link to your WhatsApp.',
        'Once you upload your ID, we will generate the digital lease and code for the smart lock.'
      ],
      recommendedProperty: properties[2],
      quoteAmount: 19500,
      depositRequired: 39000,
      tokenPaid: 5000,
      moneyPending: 34000,
      promisedClosingTime: new Date(now.getTime() + 240 * 60000).toISOString(),
      checkInDate: '2026-10-01',
      kycStatus: 'pending',
      autoCustomerMessage: 'Hi Kavya! Welcome to Gharpayy GreenVista Koramangala! Your booking ID is #GV-201. Please upload your Government ID and Company Badge here for instant digital lease: https://portal.gharpayy.com/kyc/GV-201. Check-in code will activate on Oct 1st.',
      autoNextStep: 'Verify KYC document submission and collect balance deposit ₹34,000',
      autoFollowUpDeadline: new Date(now.getTime() + 180 * 60000).toISOString(),
      whatsappMessages: [
        {
          id: 'wm-9',
          sender: 'customer',
          senderName: 'Kavya Iyer',
          timestamp: 'Today 9:00 AM',
          text: 'Sent ₹5,000 via GPay! Here is the UTR: 4289018471.'
        },
        {
          id: 'wm-10',
          sender: 'operator',
          senderName: 'Sneha Rao',
          timestamp: 'Today 9:05 AM',
          text: 'Payment received Kavya! Room 201 is officially locked for you.'
        }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'lead-105',
      name: 'Siddharth Sen',
      phone: '+91 97411 99234',
      email: 'siddharth.sen@myntra.com',
      locality: 'HSR Layout Sector 1',
      budget: 16000,
      occupancyType: 'Single',
      propertyType: 'Coliving PG',
      moveInDate: '2026-09-30',
      stage: 'tour_completed',
      owner: 'Aarav Sharma',
      deadline: new Date(now.getTime() - 25 * 60000).toISOString(), // 25 mins overdue
      isOverdue: true,
      overdueMinutes: 25,
      urgency: 'high',
      whyWeAreCalling: 'Tour finished 40 mins ago at ZenStay; operator needs to collect decision and quote price.',
      whatIsAlreadyKnown: {
        budget: '₹15,000 - ₹17,000',
        targetLocation: 'HSR Layout near 27th Main',
        workplace: 'Myntra Kudlu Gate',
        foodPreference: 'Non-veg friendly',
        stayDuration: '1 year'
      },
      whatToConfirm: [
        'Feedback on room #104 vs #202',
        'Deposit terms (2 months rent refundable)',
        'Check-in date confirmation'
      ],
      callScriptPoints: [
        'Hey Siddharth! Suresh informed me your physical tour of ZenStay went great.',
        'Which room did you prefer — the ground floor patio or the 2nd floor balcony?',
        'We have a zero-admin fee waiver if we finalize the booking within 2 hours of the tour.'
      ],
      recommendedProperty: properties[0],
      quoteAmount: 16000,
      depositRequired: 32000,
      autoCustomerMessage: 'Hi Siddharth, hope you liked the tour with Suresh! Here is your exclusive quote for ZenStay HSR Room 202: Monthly Rent: ₹16,000 (all meals, wifi, cleaning incl.), Deposit: ₹32,000. Book now with ₹2,000 token: https://pay.gharpayy.com/zen-202',
      autoNextStep: 'Collect booking confirmation or reason for hesitation',
      autoFollowUpDeadline: new Date(now.getTime() + 60 * 60000).toISOString(),
      whatsappMessages: [
        {
          id: 'wm-11',
          sender: 'customer',
          senderName: 'Siddharth Sen',
          timestamp: 'Today 11:30 AM',
          text: 'Finished the visit. Liked room 202, please send me the final price breakdown.'
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ];
}

// Generate remaining 25 leads to have a robust 30+ lead real pipeline
function generateMoreLeads(baseLeads: Lead[]): Lead[] {
  const localities = ['HSR Layout', 'Indiranagar', 'Koramangala', 'Bellandur', 'Whitefield', 'Marathahalli', 'BTM Layout'];
  const owners = ['Aarav Sharma', 'Pooja Hegde', 'Rohan Mehta', 'Sneha Rao'];
  const stages: Lead['stage'][] = ['new_lead', 'contacted', 'tour_scheduled', 'tour_completed', 'quote_sent', 'decision_pending', 'money_pending'];
  const companies = ['Amazon AWS', 'Razorpay', 'Infosys', 'Cred', 'Swiggy', 'PhonePe', 'Uber Tech', 'Oracle'];
  const firstNames = ['Arjun', 'Meera', 'Tanvi', 'Deepak', 'Naveen', 'Divya', 'Varun', 'Rhea', 'Rahul', 'Neha', 'Prateek', 'Shreya', 'Kiran', 'Manish', 'Tara', 'Aditya', 'Snehal', 'Gaurav', 'Pallavi', 'Akash', 'Nikita', 'Abhishek', 'Priyanka', 'Sanjay', 'Geeta'];
  const lastNames = ['Nair', 'Patel', 'Reddy', 'Chopra', 'Gupta', 'Singh', 'Bose', 'Menon', 'Kulkarni', 'Joshi', 'Aggarwal', 'Dutta', 'Banerjee', 'Rao', 'Shetty'];

  const now = new Date();
  const additional: Lead[] = [];

  for (let i = 0; i < 25; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const name = `${fn} ${ln}`;
    const id = `lead-${106 + i}`;
    const loc = localities[i % localities.length];
    const owner = owners[i % owners.length];
    const stage = stages[i % stages.length];
    const isOverdue = i % 3 === 0;
    const overdueMinutes = isOverdue ? (i + 1) * 18 : 0;
    const deadline = isOverdue
      ? new Date(now.getTime() - overdueMinutes * 60000).toISOString()
      : new Date(now.getTime() + (i + 1) * 35 * 60000).toISOString();
    const budget = 12000 + (i % 6) * 2500;
    const company = companies[i % companies.length];

    additional.push({
      id,
      name,
      phone: `+91 ${98000 + i * 111} ${12340 + i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      locality: `${loc}, Bangalore`,
      budget,
      occupancyType: i % 2 === 0 ? 'Single' : 'Double',
      propertyType: budget > 22000 ? '1 BHK' : 'Coliving PG',
      moveInDate: '2026-10-01',
      stage,
      owner,
      deadline,
      isOverdue,
      overdueMinutes,
      urgency: isOverdue ? 'high' : (i % 2 === 0 ? 'medium' : 'low'),
      whyWeAreCalling: `Incoming inquiry for ${loc}; joining ${company}. Looking to finalize within 48 hours.`,
      whatIsAlreadyKnown: {
        budget: `₹${budget.toLocaleString('en-IN')} / month`,
        targetLocation: `${loc}`,
        workplace: `${company} Tech Park`,
        foodPreference: i % 2 === 0 ? 'Veg meals needed' : 'Flexible food options',
        stayDuration: '9+ months'
      },
      whatToConfirm: [
        `Move-in exact date around ${loc}`,
        'AC vs Non-AC room preference',
        'Physical tour availability today between 3 PM and 7 PM'
      ],
      callScriptPoints: [
        `Hi ${fn}, ${owner.split(' ')[0]} here from LeadZen Gharpayy. Saw your inquiry for a place in ${loc}.`,
        `We have verified units right near ${company} with zero brokerage and daily housekeeping.`,
        'Would you prefer checking out the place in person today or should I share a 360 video walkthrough first?'
      ],
      autoCustomerMessage: `Hi ${fn}, thanks for speaking with ${owner}. Details for our verified PG/1BHK in ${loc} (₹${budget.toLocaleString('en-IN')}/mo) sent. Let's lock your tour slot!`,
      autoNextStep: stage === 'new_lead' ? 'Call to qualify budget & schedule tour' : 'Follow up on inspection decision',
      autoFollowUpDeadline: new Date(now.getTime() + 60 * 60000).toISOString(),
      whatsappMessages: [
        {
          id: `wm-gen-${i}-1`,
          sender: 'customer',
          senderName: name,
          timestamp: 'Today 10:00 AM',
          text: `Hi, looking for accommodation near ${loc} around ${budget}. Any options?`
        },
        {
          id: `wm-gen-${i}-2`,
          sender: 'operator',
          senderName: owner,
          timestamp: 'Today 10:05 AM',
          text: `Hello ${fn}! Yes, we have 2 great options available. Let me call you with the exact photos and rent details.`
        }
      ],
      updatedAt: new Date().toISOString()
    });
  }

  return [...baseLeads, ...additional];
}

// Initial audit trail
function getInitialAuditLogs(): AuditLog[] {
  const now = new Date();
  return [
    {
      id: 'log-1',
      timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
      operatorName: 'Aarav Sharma',
      leadId: 'lead-105',
      leadName: 'Siddharth Sen',
      module: 'M-POWER CALL',
      action: 'TOUR_COMPLETED',
      details: 'Physical tour conducted by Suresh at ZenStay HSR Sector 2. Customer liked room #202.',
      previousValue: 'tour_scheduled',
      newValue: 'tour_completed'
    },
    {
      id: 'log-2',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      operatorName: 'Sneha Rao',
      leadId: 'lead-104',
      leadName: 'Kavya Iyer',
      module: 'Closing Desk',
      action: 'TOKEN_RECEIVED',
      details: 'Advance token of ₹5,000 recorded via GPay UTR 4289018471. Room #201 locked.',
      previousValue: 'decision_pending',
      newValue: 'booking_confirmed'
    },
    {
      id: 'log-3',
      timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
      operatorName: 'Pooja Hegde',
      leadId: 'lead-102',
      leadName: 'Ananya Deshmukh',
      module: 'Booking Flow Split',
      action: 'TOUR_SCHEDULED',
      details: 'Confirmed 4:00 PM in-person tour at UrbanHaven Indiranagar 12th Main.',
      previousValue: 'contacted',
      newValue: 'tour_scheduled'
    }
  ];
}

// In-Memory store
interface Store {
  leads: Lead[];
  auditLogs: AuditLog[];
  dailyCarePromise: DailyCarePromise;
}

let store: Store;

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      store = JSON.parse(data);
      console.log(`[Store] Loaded ${store.leads.length} leads and ${store.auditLogs.length} audit logs from disk.`);
      return;
    }
  } catch (err) {
    console.error('[Store] Error reading file, resetting to initial seed:', err);
  }

  // Generate initial state
  const base = getInitialSeedLeads();
  const allLeads = generateMoreLeads(base);
  const now = new Date();
  
  store = {
    leads: allLeads,
    auditLogs: getInitialAuditLogs(),
    dailyCarePromise: {
      id: 'care-today',
      date: now.toISOString().split('T')[0],
      operatorName: 'Aarav Sharma',
      targetCalls: 30,
      targetTours: 6,
      targetClosings: 2,
      promisedClosingNotes: 'Will convert Rohan Varma to tour, lock Vikram Rathore deposit, and run 30 qualified conversations.',
      leadIds: allLeads.slice(0, 30).map(l => l.id),
      completedLeadIds: ['lead-104', 'lead-105'],
      status: 'active',
      whatsappSummaryText: '',
      createdAt: now.toISOString()
    }
  };
  saveStore();
}

function saveStore(specificLead?: Lead, specificLog?: AuditLog) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write db.json:', err);
  }

  // Background asynchronous mirror to MongoDB Atlas
  if (specificLead) {
    saveSingleLeadToMongo(specificLead).catch(() => {});
  }
  if (specificLog) {
    saveSingleAuditLogToMongo(specificLog).catch(() => {});
  }
  if (store?.dailyCarePromise) {
    saveCarePromiseToMongo(store.dailyCarePromise).catch(() => {});
  }
}

async function syncMongoOnStartup() {
  const connected = await initMongo();
  if (connected) {
    try {
      const mongoData = await fetchAllFromMongo();
      if (mongoData && mongoData.leads && mongoData.leads.length > 0) {
        console.log(`[MongoDB] Pulled ${mongoData.leads.length} leads and ${mongoData.auditLogs?.length || 0} audit logs from Atlas.`);
        store.leads = mongoData.leads;
        if (mongoData.auditLogs && mongoData.auditLogs.length > 0) {
          store.auditLogs = mongoData.auditLogs;
        }
        if (mongoData.dailyCarePromise) {
          store.dailyCarePromise = mongoData.dailyCarePromise;
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
      } else {
        console.log(`[MongoDB] Initializing remote Atlas collections with initial pipeline seed...`);
        await persistAllToMongo(store.leads, store.auditLogs, store.dailyCarePromise);
      }
    } catch (err: any) {
      console.warn('[MongoDB] Startup sync error:', err.message);
    }
  }
}

loadStore();
syncMongoOnStartup();

// --- API ROUTES ---

// 0. Database Status Endpoint
app.get('/api/db-status', (req: Request, res: Response) => {
  const status = getMongoStatus();
  res.json({
    ...status,
    leadCount: store.leads.length,
    auditCount: store.auditLogs.length
  });
});

app.post('/api/db-sync', async (req: Request, res: Response) => {
  try {
    await persistAllToMongo(store.leads, store.auditLogs, store.dailyCarePromise);
    res.json({ success: true, message: 'All records successfully synchronized to MongoDB Atlas' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Get all leads (with query filters)
app.get('/api/leads', (req: Request, res: Response) => {
  const { stage, owner, overdue, search } = req.query;
  let results = [...store.leads];

  if (stage && stage !== 'all') {
    results = results.filter(l => l.stage === stage);
  }
  if (owner && owner !== 'all') {
    results = results.filter(l => l.owner.toLowerCase() === String(owner).toLowerCase());
  }
  if (overdue === 'true') {
    results = results.filter(l => l.isOverdue);
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.locality.toLowerCase().includes(q) ||
      l.owner.toLowerCase().includes(q)
    );
  }

  res.json({
    leads: results,
    total: results.length,
    overdueCount: store.leads.filter(l => l.isOverdue).length,
    toursCount: store.leads.filter(l => l.stage === 'tour_scheduled' || l.stage === 'tour_completed').length,
    closingsCount: store.leads.filter(l => l.stage === 'booking_confirmed' || l.stage === 'check_in_done').length
  });
});

// 2. Get single lead
app.get('/api/leads/:id', (req: Request, res: Response) => {
  const lead = store.leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json({ lead });
});

// 3. Update lead fields (General PATCH)
app.patch('/api/leads/:id', (req: Request, res: Response) => {
  const index = store.leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const previous = { ...store.leads[index] };
  const updates = req.body;
  const operatorName = updates.operatorName || req.headers['x-operator-name'] || previous.owner || 'Aarav Sharma';

  store.leads[index] = {
    ...previous,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // If stage changed, append to audit trail
  if (updates.stage && updates.stage !== previous.stage) {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operatorName: String(operatorName),
      leadId: previous.id,
      leadName: previous.name,
      module: updates.module || 'Movement OS',
      action: 'STAGE_CHANGED',
      details: updates.reason || `Stage updated from ${previous.stage} to ${updates.stage}`,
      previousValue: previous.stage,
      newValue: updates.stage
    };
    store.auditLogs.unshift(log);
  }

  saveStore();
  res.json({ lead: store.leads[index], success: true });
});

// 4. M-POWER CALL: Complete Call Run (End-to-End deep engine)
app.post('/api/leads/:id/mpower-call', (req: Request, res: Response) => {
  const index = store.leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const current = store.leads[index];
  const {
    operatorName = 'Aarav Sharma',
    callOutcome,
    callNotes,
    tourDate,
    tourTime,
    tourType,
    confirmedDetails,
    nextStep,
    nextDeadlineMinutes = 120
  } = req.body;

  const now = new Date();
  let nextStage: Lead['stage'] = current.stage;

  if (callOutcome === 'tour_scheduled') {
    nextStage = 'tour_scheduled';
  } else if (callOutcome === 'quote_requested') {
    nextStage = 'quote_sent';
  } else if (callOutcome === 'not_interested') {
    nextStage = 'lost';
  } else if (callOutcome === 'follow_up_needed') {
    nextStage = 'contacted';
  }

  // Auto-compose personalized WhatsApp message
  let autoMsg = '';
  if (callOutcome === 'tour_scheduled') {
    autoMsg = `Hi ${current.name}! Great speaking with you on call. As scheduled, your ${tourType || 'In-Person'} tour for ${current.recommendedProperty?.title || 'our property'} in ${current.locality} is locked for ${tourDate || 'Tomorrow'} at ${tourTime || '4:00 PM'}. Property Manager contact: +91 98801 12345. See you there!`;
  } else if (callOutcome === 'quote_requested') {
    autoMsg = `Hi ${current.name}! Per our call, here is the price quote for ${current.recommendedProperty?.title || 'the private room'}: Monthly Rent: ₹${(current.budget || 16000).toLocaleString('en-IN')}, Refundable Deposit: ₹${((current.budget || 16000) * 2).toLocaleString('en-IN')}. Zero brokerage. Let me know if you would like me to block this!`;
  } else {
    autoMsg = `Hi ${current.name}, thank you for your time on the call! Let's connect again on ${new Date(now.getTime() + nextDeadlineMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Feel free to ping me here for any queries.`;
  }

  // Update lead
  store.leads[index] = {
    ...current,
    stage: nextStage,
    lastCallOutcome: callOutcome,
    lastCallNotes: callNotes || current.lastCallNotes,
    lastCallTimestamp: now.toISOString(),
    tourDate: tourDate || current.tourDate,
    tourTime: tourTime || current.tourTime,
    tourType: tourType || current.tourType,
    autoCustomerMessage: autoMsg,
    autoNextStep: nextStep || `Follow up after ${callOutcome.replace(/_/g, ' ')}`,
    deadline: new Date(now.getTime() + nextDeadlineMinutes * 60000).toISOString(),
    isOverdue: false, // Reset overdue on completion!
    overdueMinutes: 0,
    updatedAt: now.toISOString()
  };

  // Add system message to WhatsApp trail
  store.leads[index].whatsappMessages.push({
    id: `wm-${Date.now()}`,
    sender: 'system',
    senderName: 'M-POWER Engine',
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `[Call Log: ${callOutcome.toUpperCase()}] ${callNotes || 'Call completed successfully.'}`
  });

  // Log to Audit Trail
  const auditLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    operatorName,
    leadId: current.id,
    leadName: current.name,
    module: 'M-POWER CALL',
    action: `CALL_${callOutcome.toUpperCase()}`,
    details: `Call completed by ${operatorName}. Outcome: ${callOutcome}. Tour: ${tourDate || 'N/A'} ${tourTime || ''}. Notes: ${callNotes || 'No notes'}.`,
    previousValue: current.stage,
    newValue: nextStage
  };
  store.auditLogs.unshift(auditLog);

  // If this lead was in the daily care queue, auto-mark it worked!
  if (store.dailyCarePromise.leadIds.includes(current.id) && !store.dailyCarePromise.completedLeadIds.includes(current.id)) {
    store.dailyCarePromise.completedLeadIds.push(current.id);
  }

  saveStore();
  res.json({ lead: store.leads[index], auditLog, success: true });
});

// 5. Booking Flow Split: Send WhatsApp message & Advance State
app.post('/api/leads/:id/whatsapp-message', (req: Request, res: Response) => {
  const index = store.leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const current = store.leads[index];
  const { text, senderName = 'Aarav Sharma', advanceToStage, nextStepDeadlineMinutes = 180 } = req.body;
  const now = new Date();

  const newMsg = {
    id: `wm-${Date.now()}`,
    sender: 'operator' as const,
    senderName,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text,
    status: 'sent' as const
  };

  const updatedMessages = [...current.whatsappMessages, newMsg];
  let newStage = current.stage;
  if (advanceToStage && advanceToStage !== current.stage) {
    newStage = advanceToStage;
  }

  store.leads[index] = {
    ...current,
    stage: newStage,
    whatsappMessages: updatedMessages,
    deadline: new Date(now.getTime() + nextStepDeadlineMinutes * 60000).toISOString(),
    isOverdue: false,
    overdueMinutes: 0,
    updatedAt: now.toISOString()
  };

  const log: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    operatorName: senderName,
    leadId: current.id,
    leadName: current.name,
    module: 'Booking Flow Split',
    action: 'WHATSAPP_MESSAGE_SENT',
    details: `Sent message: "${text.substring(0, 70)}..."`,
    previousValue: current.stage,
    newValue: newStage
  };
  store.auditLogs.unshift(log);

  saveStore();
  res.json({ lead: store.leads[index], message: newMsg, success: true });
});

// 6. Movement CARE: Get and Update Daily Promise
app.get('/api/movement-care', (req: Request, res: Response) => {
  // Populate the 30 leads from the queue
  const queueLeads = store.leads.filter(l => store.dailyCarePromise.leadIds.includes(l.id));
  res.json({
    promise: store.dailyCarePromise,
    queueLeads,
    totalQueued: store.dailyCarePromise.leadIds.length,
    completedCount: store.dailyCarePromise.completedLeadIds.length
  });
});

app.post('/api/movement-care/promise', (req: Request, res: Response) => {
  const { targetCalls, targetTours, targetClosings, promisedClosingNotes, operatorName = 'Aarav Sharma' } = req.body;
  
  store.dailyCarePromise = {
    ...store.dailyCarePromise,
    targetCalls: Number(targetCalls) || 30,
    targetTours: Number(targetTours) || 6,
    targetClosings: Number(targetClosings) || 2,
    promisedClosingNotes: promisedClosingNotes || store.dailyCarePromise.promisedClosingNotes,
    operatorName
  };

  const log: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    operatorName,
    leadId: 'ALL',
    leadName: 'Daily Movement CARE Promise',
    module: 'Movement CARE',
    action: 'PROMISE_COMMITTED',
    details: `Committed promise: ${targetCalls} calls, ${targetTours} tours, ${targetClosings} closings. Goal: ${promisedClosingNotes}`
  };
  store.auditLogs.unshift(log);

  saveStore();
  res.json({ promise: store.dailyCarePromise, success: true });
});

app.post('/api/movement-care/complete-lead', (req: Request, res: Response) => {
  const { leadId, operatorName = 'Aarav Sharma', notes, nextStage } = req.body;
  if (!store.dailyCarePromise.completedLeadIds.includes(leadId)) {
    store.dailyCarePromise.completedLeadIds.push(leadId);
  }

  // Update lead if nextStage passed
  const leadIdx = store.leads.findIndex(l => l.id === leadId);
  if (leadIdx !== -1 && nextStage) {
    const prev = store.leads[leadIdx];
    store.leads[leadIdx] = {
      ...prev,
      stage: nextStage,
      isOverdue: false,
      overdueMinutes: 0,
      updatedAt: new Date().toISOString()
    };
  }

  const targetLead = store.leads.find(l => l.id === leadId);
  const log: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    operatorName,
    leadId,
    leadName: targetLead?.name || leadId,
    module: 'Movement CARE',
    action: 'CARE_LEAD_WORKED',
    details: `Lead worked in Daily Care sprint. Total finished: ${store.dailyCarePromise.completedLeadIds.length}/30. ${notes || ''}`
  };
  store.auditLogs.unshift(log);

  // Generate automated EOD WhatsApp report text
  const completed = store.dailyCarePromise.completedLeadIds.length;
  const toursLocked = store.leads.filter(l => store.dailyCarePromise.completedLeadIds.includes(l.id) && (l.stage === 'tour_scheduled' || l.stage === 'tour_completed')).length;
  const closingsLocked = store.leads.filter(l => store.dailyCarePromise.completedLeadIds.includes(l.id) && (l.stage === 'booking_confirmed' || l.stage === 'check_in_done')).length;

  store.dailyCarePromise.whatsappSummaryText = `*Movement CARE Daily Sprint Report* 🚀\nDate: ${store.dailyCarePromise.date}\nOperator: ${operatorName}\n• Leads Worked: ${completed} / ${store.dailyCarePromise.targetCalls}\n• Tours Scheduled: ${toursLocked} / ${store.dailyCarePromise.targetTours}\n• Closings Locked: ${closingsLocked} / ${store.dailyCarePromise.targetClosings}\n• Overdue Cleared: 100%\nResult Promise Status: ${completed >= store.dailyCarePromise.targetCalls ? '✅ PROMISE FULFILLED' : '⚡ IN PROGRESS'}`;

  saveStore();
  res.json({ promise: store.dailyCarePromise, success: true });
});

// 7. Audit Trail API
app.get('/api/audit-trail', (req: Request, res: Response) => {
  const { leadId, module } = req.query;
  let logs = [...store.auditLogs];

  if (leadId) {
    logs = logs.filter(l => l.leadId === leadId);
  }
  if (module) {
    logs = logs.filter(l => l.module === module);
  }

  res.json({ logs });
});

// 8. Closing Desk: Deposit / Token Payment & Handover API
app.post('/api/leads/:id/closing', (req: Request, res: Response) => {
  const index = store.leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const current = store.leads[index];
  const { tokenAmount, actionType, operatorName = 'Sneha Rao', checkInDate } = req.body;
  const now = new Date();

  let nextStage: Lead['stage'] = current.stage;
  let details = '';

  if (actionType === 'RECORD_TOKEN') {
    nextStage = 'booking_confirmed';
    const newTokenPaid = (current.tokenPaid || 0) + Number(tokenAmount || 5000);
    const deposit = current.depositRequired || (current.budget * 2);
    store.leads[index] = {
      ...current,
      stage: nextStage,
      tokenPaid: newTokenPaid,
      moneyPending: Math.max(0, deposit - newTokenPaid),
      isOverdue: false,
      deadline: new Date(now.getTime() + 24 * 3600000).toISOString(),
      updatedAt: now.toISOString()
    };
    details = `Collected ₹${tokenAmount} token via instant payment. Room confirmed.`;
  } else if (actionType === 'CHECK_IN_COMPLETE') {
    nextStage = 'check_in_done';
    store.leads[index] = {
      ...current,
      stage: nextStage,
      checkInDate: checkInDate || now.toISOString().split('T')[0],
      isOverdue: false,
      deadline: new Date(now.getTime() + 7 * 24 * 3600000).toISOString(),
      updatedAt: now.toISOString()
    };
    details = `Check-in completed. Smart key issued. KYC verified.`;
  }

  const log: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    operatorName,
    leadId: current.id,
    leadName: current.name,
    module: 'Closing Desk',
    action: actionType,
    details,
    previousValue: current.stage,
    newValue: nextStage
  };
  store.auditLogs.unshift(log);

  saveStore(store.leads[index], log);
  res.json({ lead: store.leads[index], log, success: true });
});

// 9. Reset Demo Data
app.post('/api/reset-demo', async (req: Request, res: Response) => {
  const base = getInitialSeedLeads();
  const allLeads = generateMoreLeads(base);
  const now = new Date();

  store = {
    leads: allLeads,
    auditLogs: getInitialAuditLogs(),
    dailyCarePromise: {
      id: 'care-today',
      date: now.toISOString().split('T')[0],
      operatorName: 'Aarav Sharma',
      targetCalls: 30,
      targetTours: 6,
      targetClosings: 2,
      promisedClosingNotes: 'Will convert Rohan Varma to tour, lock Vikram Rathore deposit, and run 30 qualified conversations.',
      leadIds: allLeads.slice(0, 30).map(l => l.id),
      completedLeadIds: ['lead-104', 'lead-105'],
      status: 'active',
      whatsappSummaryText: '',
      createdAt: now.toISOString()
    }
  };
  saveStore();
  persistAllToMongo(store.leads, store.auditLogs, store.dailyCarePromise).catch(() => {});
  res.json({ message: 'Demo data reset successfully', totalLeads: store.leads.length });
});

// --- VITE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadZen Rental CRM server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
