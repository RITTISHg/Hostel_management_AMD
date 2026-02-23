import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role } from '../types';

interface RoleContextType {
    role: Role;
    setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
    role: 'facilityManager',
    setRole: () => { },
});

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>('facilityManager');

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
