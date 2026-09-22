import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import { Lead, AuditLog, DailyCarePromise } from '../src/types.js';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;
let dbName = 'rental_crm';

export interface MongoStatus {
  connected: boolean;
  dbName: string;
  uriConfigured: boolean;
  maskedUri: string | null;
  error: string | null;
  leadCount: number;
  auditCount: number;
}

export function getMongoStatus(): MongoStatus {
  const uri = process.env.MONGODB_URI;
  const masked = uri
    ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
    : null;

  return {
    connected: isConnected,
    dbName,
    uriConfigured: !!uri,
    maskedUri: masked,
    error: connectionError,
    leadCount: 0,
    auditCount: 0
  };
}

export async function initMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    connectionError = 'MONGODB_URI is not defined in environment';
    console.log('[MongoDB] No MONGODB_URI found, using local storage fallback.');
    return false;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    
    // Extract db name from URI or use default
    try {
      const url = new URL(uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
      const pathDb = url.pathname.replace(/^\//, '').split('?')[0];
      if (pathDb) {
        dbName = pathDb;
      }
    } catch {
      dbName = 'rental_crm';
    }

    db = client.db(dbName);
    isConnected = true;
    connectionError = null;

    // Ping
    await db.command({ ping: 1 });
    console.log(`[MongoDB] Connected successfully to database: "${dbName}"`);
    return true;
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Connection failed';
    console.warn('[MongoDB] Connection attempt warning:', connectionError);
    console.log('[MongoDB] Operating with local disk fallback.');
    return false;
  }
}

export async function fetchAllFromMongo(): Promise<{
  leads?: Lead[];
  auditLogs?: AuditLog[];
  dailyCarePromise?: DailyCarePromise;
} | null> {
  if (!db || !isConnected) return null;

  try {
    const leadsCollection = db.collection<Lead>('leads');
    const auditCollection = db.collection<AuditLog>('audit_logs');
    const careCollection = db.collection<DailyCarePromise>('care_promises');

    const leads = await leadsCollection.find({}, { projection: { _id: 0 } }).toArray();
    const auditLogs = await auditCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    const carePromise = await careCollection.findOne({ id: 'care-today' }, { projection: { _id: 0 } });

    if (leads.length === 0) {
      return null; // Empty in Mongo, trigger initial seed push
    }

    return {
      leads,
      auditLogs,
      dailyCarePromise: carePromise || undefined
    };
  } catch (err: any) {
    console.error('[MongoDB] Error reading collections:', err.message);
    return null;
  }
}

export async function persistAllToMongo(
  leads: Lead[],
  auditLogs: AuditLog[],
  dailyCarePromise: DailyCarePromise
): Promise<void> {
  if (!db || !isConnected) return;

  try {
    const leadsCollection = db.collection('leads');
    const auditCollection = db.collection('audit_logs');
    const careCollection = db.collection('care_promises');

    // Bulk upsert leads
    const leadOps = leads.map((lead) => ({
      updateOne: {
        filter: { id: lead.id },
        update: { $set: lead },
        upsert: true
      }
    }));

    if (leadOps.length > 0) {
      await leadsCollection.bulkWrite(leadOps);
    }

    // Bulk upsert audit logs
    const auditOps = auditLogs.map((log) => ({
      updateOne: {
        filter: { id: log.id },
        update: { $set: log },
        upsert: true
      }
    }));

    if (auditOps.length > 0) {
      await auditCollection.bulkWrite(auditOps);
    }

    // Upsert care promise
    await careCollection.updateOne(
      { id: dailyCarePromise.id },
      { $set: dailyCarePromise },
      { upsert: true }
    );

    console.log(`[MongoDB] Synchronized ${leads.length} leads and ${auditLogs.length} audit logs to Atlas.`);
  } catch (err: any) {
    console.error('[MongoDB] Error writing to collections:', err.message);
  }
}

export async function saveSingleLeadToMongo(lead: Lead): Promise<void> {
  if (!db || !isConnected) return;
  try {
    const leadsCollection = db.collection('leads');
    await leadsCollection.updateOne({ id: lead.id }, { $set: lead }, { upsert: true });
  } catch (err: any) {
    console.error(`[MongoDB] Failed to save lead ${lead.id}:`, err.message);
  }
}

export async function saveSingleAuditLogToMongo(log: AuditLog): Promise<void> {
  if (!db || !isConnected) return;
  try {
    const auditCollection = db.collection('audit_logs');
    await auditCollection.updateOne({ id: log.id }, { $set: log }, { upsert: true });
  } catch (err: any) {
    console.error(`[MongoDB] Failed to save audit log ${log.id}:`, err.message);
  }
}

export async function saveCarePromiseToMongo(care: DailyCarePromise): Promise<void> {
  if (!db || !isConnected) return;
  try {
    const careCollection = db.collection('care_promises');
    await careCollection.updateOne({ id: care.id }, { $set: care }, { upsert: true });
  } catch (err: any) {
    console.error(`[MongoDB] Failed to save care promise:`, err.message);
  }
}
