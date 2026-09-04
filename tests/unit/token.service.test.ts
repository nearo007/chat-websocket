import { TokenService } from "@src/shared/services/token.service.js";
import { describe, expect, it } from "vitest";

describe("TokenService", () => {
    it("separates access and refresh token purposes", () => {
        const tokens = TokenService.generate({ userId: "42" });

        expect(TokenService.verifyAccess(tokens.accessToken).sub).toBe("42");
        expect(TokenService.verifyRefresh(tokens.refreshToken).sub).toBe("42");
        expect(() => TokenService.verifyAccess(tokens.refreshToken)).toThrow();
        expect(() => TokenService.verifyRefresh(tokens.accessToken)).toThrow();
    });
});
