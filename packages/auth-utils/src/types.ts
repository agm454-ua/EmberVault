// with iat and exp the method jwt.verify automatically checks if the token is expired
export interface TokenPayload {
    userId: string;
    systemRole: string;
    iat?: number;   // issued at
    exp?: number;   // expiration
}

// for readability
export type Token = string