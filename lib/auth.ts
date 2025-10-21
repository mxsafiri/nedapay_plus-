// Client-side authentication utilities

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  scope: string;
  kyb_verification_status: string;
  has_early_access: boolean;
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    console.log('getCurrentUser:', user);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
}

// Set current user in localStorage and sessionStorage
export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  
  try {
    const userStr = JSON.stringify(user);
    localStorage.setItem('user', userStr);
    sessionStorage.setItem('user', userStr);
    console.log('✅ User stored in storage:', user.email);
    
    // Verify it was stored
    const stored = localStorage.getItem('user');
    console.log('✅ Verification - localStorage has user:', !!stored);
  } catch (error) {
    console.error('❌ Error storing user in storage:', error);
  }
}

// Remove current user from localStorage
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  console.log('User cleared from localStorage');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.scope === 'admin';
}
