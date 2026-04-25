import { describe, it, expect } from "vitest";
import { generateToken, validateToken } from "../src/jwt";
import type { TokenPayload } from "../src/types";

const SECRET = "super-secret-key";

describe("JWT token utils", () => {
    it("should generate a valid token and validate it", () => {
        const payload: TokenPayload = {
            userId: 123,
            systemRole: "admin",
        };

        const token = generateToken(payload, SECRET);

        expect(typeof token).toBe("string");

        const decoded = validateToken(token, SECRET)!;

        expect(decoded.userId).toBe(123);
        expect(decoded.systemRole).toBe("admin");
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
    });

    it("should fail validation with wrong secret", () => {
        const payload: TokenPayload = {
            userId: 123,
            systemRole: "admin",
        };

        const token = generateToken(payload, SECRET);

        expect(() => {
            validateToken(token, "wrong-secret");
        }).toThrow();
    });

    it("should create a token with the correct expiration time", () => {
        const payload: TokenPayload = {
            userId: 123,
            systemRole: "user",
        };

        const expMinutes = 10;
        const token = generateToken(payload, SECRET, expMinutes);
        const decoded = validateToken(token, SECRET)!;

        const lifetime = decoded.exp! - decoded.iat!;

        expect(lifetime).toBe(60 * expMinutes);
    });
});
