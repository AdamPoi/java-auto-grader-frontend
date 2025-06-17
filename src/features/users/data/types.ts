export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: UserRole[];
    permissions: string[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export type UserForm = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
    confirmPassword: string;
}

export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended';

export type UserRole = 'admin' | 'student' | 'teacher';