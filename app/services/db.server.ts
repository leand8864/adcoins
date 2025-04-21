import { Database } from 'sqlite3';
import { promisify } from 'util';

// Initialize SQLite database
const db = new Database('./escrow.db');

// Promisify db methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Create tables if they don't exist
async function initDB() {
  await dbRun(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'freelancer', 'admin')),
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS escrows (
    id TEXT PRIMARY KEY,
    contractId TEXT NOT NULL,
    title TEXT NOT NULL,
    clientId TEXT NOT NULL,
    freelancerId TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'funded', 'released', 'disputed')),
    paymentIntentId TEXT,
    fundedAt TEXT,
    releasedAt TEXT,
    disputedAt TEXT,
    FOREIGN KEY (clientId) REFERENCES users(id),
    FOREIGN KEY (freelancerId) REFERENCES users(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    escrowId TEXT NOT NULL,
    raisedBy TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('open', 'resolved')),
    resolution TEXT,
    resolvedBy TEXT,
    resolvedAt TEXT,
    FOREIGN KEY (escrowId) REFERENCES escrows(id),
    FOREIGN KEY (raisedBy) REFERENCES users(id),
    FOREIGN KEY (resolvedBy) REFERENCES users(id)
  )`);
}

initDB().catch(console.error);

// User functions
export async function getUserById(id: string) {
  return dbGet('SELECT * FROM users WHERE id = ?', [id]);
}

export async function getUserByEmail(email: string) {
  return dbGet('SELECT * FROM users WHERE email = ?', [email]);
}

// Escrow functions
export async function getEscrowById(id: string) {
  return dbGet('SELECT * FROM escrows WHERE id = ?', [id]);
}

export async function getEscrowsByUser(userId: string) {
  return dbAll(
    `SELECT * FROM escrows 
     WHERE clientId = ? OR freelancerId = ? 
     ORDER BY fundedAt DESC`,
    [userId, userId]
  );
}

export async function createEscrow(escrowData: {
  contractId: string;
  title: string;
  clientId: string;
  freelancerId: string;
  amount: number;
}) {
  const id = `esc_${Date.now()}`;
  await dbRun(
    `INSERT INTO escrows (id, contractId, title, clientId, freelancerId, amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [id, escrowData.contractId, escrowData.title, escrowData.clientId, 
     escrowData.freelancerId, escrowData.amount]
  );
  return id;
}

export async function updateEscrowStatus(id: string, status: string) {
  const timestampCol = status === 'funded' ? 'fundedAt' : 
                      status === 'released' ? 'releasedAt' : 
                      status === 'disputed' ? 'disputedAt' : null;
  
  const query = timestampCol 
    ? `UPDATE escrows SET status = ?, ${timestampCol} = datetime('now') WHERE id = ?`
    : `UPDATE escrows SET status = ? WHERE id = ?`;
  
  await dbRun(query, [status, id]);
}

// Dispute functions
export async function createDispute(disputeData: {
  escrowId: string;
  raisedBy: string;
  reason: string;
}) {
  const id = `dis_${Date.now()}`;
  await dbRun(
    `INSERT INTO disputes (id, escrowId, raisedBy, reason, status)
     VALUES (?, ?, ?, ?, 'open')`,
    [id, disputeData.escrowId, disputeData.raisedBy, disputeData.reason]
  );
  return id;
}

export async function resolveDispute(id: string, resolution: string, resolvedBy: string) {
  await dbRun(
    `UPDATE disputes 
     SET status = 'resolved', resolution = ?, resolvedBy = ?, resolvedAt = datetime('now')
     WHERE id = ?`,
    [resolution, resolvedBy, id]
  );
}

export default db;
