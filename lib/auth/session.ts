// Simple session management for custom auth system
// In production, consider using JWT tokens or a more robust session management system

export interface UserSession {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  scope: string;
  kyb_verification_status: 'not_started' | 'pending' | 'verified' | 'rejected';
}

export const SessionManager = {
  // Get current user session
  getUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Set user session
  setUser(user: UserSession): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear user session
  clearUser(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getUser() !== null;
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.scope === 'admin';
  },

  // Check if user is verified
  isVerified(): boolean {
    const user = this.getUser();
    return user?.kyb_verification_status === 'verified';
  },

  // Get user display name
  getDisplayName(): string {
    const user = this.getUser();
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`.trim();
  }
};

// Hook for React components
export const useAuth = () => {
  return {
    user: SessionManager.getUser(),
    isAuthenticated: SessionManager.isAuthenticated(),
    isAdmin: SessionManager.isAdmin(),
    isVerified: SessionManager.isVerified(),
    displayName: SessionManager.getDisplayName(),
    logout: () => SessionManager.clearUser()
  };
};
