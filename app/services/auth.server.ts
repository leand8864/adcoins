import { json, redirect } from "@remix-run/node";
import type { Session, User } from "@remix-run/node";
import { db } from "./db.server";

// Mock session - replace with your auth system
let mockSession: Session = {
  user: null,
  commit: () => Promise.resolve(''),
  destroy: () => Promise.resolve('')
};

export async function requireUser(request: Request, requiredRole?: 'client' | 'freelancer' | 'admin') {
  // In a real app, get session from cookie
  const user = mockSession.user;
  
  if (!user) {
    throw redirect('/login');
  }

  if (requiredRole && user.role !== requiredRole) {
    throw json({ error: 'Unauthorized' }, { status: 403 });
  }

  return user;
}

export async function login(email: string, password: string) {
  // In a real app, verify password hash
  const user = await db.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  mockSession.user = user;
  return user;
}

export async function logout() {
  mockSession.user = null;
}
