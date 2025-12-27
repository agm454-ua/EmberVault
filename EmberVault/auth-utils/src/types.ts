// with iat and exp the method jwt.verify automatically checks if the token is expired
export interface TokenPayload {
    userId: number;
    systemRole: string;
    iat?: number;   // issued at
    exp?: number;   // expiration
}
