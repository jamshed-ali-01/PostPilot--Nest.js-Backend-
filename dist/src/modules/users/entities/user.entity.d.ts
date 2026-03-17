import { Role } from '../../roles/entities/role.entity';
import { Business } from '../../businesses/entities/business.entity';
export declare class User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    businessId: string;
    business?: Business;
    roles: Role[];
    aiTone?: string;
    aiHashtags: string[];
    aiCaptionLength?: string;
    aiIncludeEmojis?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
