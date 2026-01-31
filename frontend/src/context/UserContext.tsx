/**
 * User Context - Tracks the current user's role and authentication state
 * 
 * Stores the user role selected from the landing page (student, staff, professor)
 * and makes it available throughout the application.
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'student' | 'staff' | 'professor' | null;

interface UserContextType {
    userRole: UserRole;
    userName: string;
    setUserRole: (role: UserRole) => void;
    setUserName: (name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Storage keys for persistence
const STORAGE_KEY_ROLE = 'arip_user_role';
const STORAGE_KEY_NAME = 'arip_user_name';

export function UserProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available
    const [userRole, setUserRoleState] = useState<UserRole>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_ROLE);
        return (stored as UserRole) || null;
    });
    
    const [userName, setUserNameState] = useState<string>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_NAME);
        return stored || '';
    });

    // Persist role changes to localStorage
    const setUserRole = (role: UserRole) => {
        setUserRoleState(role);
        if (role) {
            localStorage.setItem(STORAGE_KEY_ROLE, role);
            // Set default name based on role
            const defaultName = role === 'professor' ? 'Prof. Reviewer' : 
                               role === 'staff' ? 'Staff Member' : 'Student';
            setUserName(defaultName);
        } else {
            localStorage.removeItem(STORAGE_KEY_ROLE);
        }
    };

    const setUserName = (name: string) => {
        setUserNameState(name);
        if (name) {
            localStorage.setItem(STORAGE_KEY_NAME, name);
        } else {
            localStorage.removeItem(STORAGE_KEY_NAME);
        }
    };

    const logout = () => {
        setUserRoleState(null);
        setUserNameState('');
        localStorage.removeItem(STORAGE_KEY_ROLE);
        localStorage.removeItem(STORAGE_KEY_NAME);
    };

    const isAuthenticated = userRole !== null;

    return (
        <UserContext.Provider value={{
            userRole,
            userName,
            setUserRole,
            setUserName,
            logout,
            isAuthenticated,
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Helper hook to get display name for roles
export function useRoleDisplayName() {
    const { userRole } = useUser();
    
    const roleLabels: Record<NonNullable<UserRole>, string> = {
        student: 'Student',
        staff: 'Staff Member',
        professor: 'Professor',
    };
    
    return userRole ? roleLabels[userRole] : 'Guest';
}
