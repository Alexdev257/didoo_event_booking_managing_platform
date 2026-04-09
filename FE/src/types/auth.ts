
import { BasePaginationQuery } from "./base";


export type JWTUserType = {
    jti: string;
    UserId: string;
    FullName: string;
    Email: string;
    Role: string;
    IsOrganizer: string;
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
};

export interface Role {
    id: string;
    name: string;
    description: string;
}


/** Match BE UserGetListQuery */
export interface UserGetListQuery extends BasePaginationQuery {
    fullName?: string;
    email?: string;
    phone?: string;
    isVerified?: boolean;
    gender?: number;
    status?: number;
    role?: string;
    organizerId?: string;
    hasLocation?: boolean;
}


/** Match BE UserDTO */
export interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    isVerified: boolean;
    avatarUrl?: string;
    gender: number;
    dateOfBirth?: string;
    address?: string;
    status: number;
    role: Role;
    organizerId?: string | null;
    locations: any[];
    isDeleted?: boolean;
}
