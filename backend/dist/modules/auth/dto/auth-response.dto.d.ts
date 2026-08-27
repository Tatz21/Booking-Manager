export declare class UserSummaryDto {
    id: string;
    email: string;
    name: string;
    role: string;
}
export declare class BusinessSummaryDto {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserSummaryDto;
    business: BusinessSummaryDto;
}
export declare class TokenRefreshResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
