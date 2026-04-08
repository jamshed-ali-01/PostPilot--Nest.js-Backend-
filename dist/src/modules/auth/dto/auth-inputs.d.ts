export declare class LoginInput {
    email: string;
    password: string;
}
export declare class RegisterInput {
    email: string;
    password: string;
    businessId?: string;
    businessName?: string;
    firstName?: string;
    lastName?: string;
    planId?: string;
}
export declare class ResetPasswordInput {
    email: string;
    otp: string;
    newPassword: string;
}
