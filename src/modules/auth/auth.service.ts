import type { LoginDTO, TokensDTO } from "@modules/auth/auth.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { LoginValidator } from "@src/modules/auth/input-validation/login.validator.js";
import {
    type AuthRepository,
    PrismaAuthRepository,
} from "@src/modules/auth/repositories/auth.repository.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { TokenService } from "@src/shared/services/token.service.js";
import { Bcrypt } from "@src/shared/utils/bcrypt.js";
import { Crypto } from "@src/shared/utils/crypto.js";

// Keep the same cost as newly generated password hashes so unknown-user logins
// take approximately the same time as wrong-password logins.
const DUMMY_PASSWORD_HASH = "$2b$12$Q26ef2ECkwwE/H4/RD4r1eaU4SC9wk3pGRMUJh2JfNsmWWgJdvkr6";

export class AuthService {
    constructor(private readonly authRepository: AuthRepository = new PrismaAuthRepository()) {}

    async login(data: LoginDTO): Promise<TokensDTO> {
        LoginValidator.validate(data);

        const { email, password } = data;

        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            await Bcrypt.comparePassword(password, DUMMY_PASSWORD_HASH);
            throw new AppError(
                MESSAGES.USER.AUTH.INCORRECT_CREDENTIALS,
                401,
                "INCORRECT_CREDENTIALS",
            );
        }

        const correctPassword = await Bcrypt.comparePassword(password, user.passwordHash);

        if (!correctPassword) {
            throw new AppError(
                MESSAGES.USER.AUTH.INCORRECT_CREDENTIALS,
                401,
                "INCORRECT_CREDENTIALS",
            );
        }

        const tokens = TokenService.generate({
            userId: user.id.toString(),
        });

        const hashedRefreshToken = Crypto.hashToken(tokens.refreshToken);

        await this.authRepository.deleteExpiredRefreshTokens(new Date());
        await this.authRepository.createRefreshToken({
            userId: user.id,
            refreshTokenHash: hashedRefreshToken,
            expiresAt: tokens.refreshExpiresAt,
        });

        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    }

    async refresh(refreshToken: string): Promise<TokensDTO> {
        let payload: ReturnType<typeof TokenService.verifyRefresh>;
        try {
            payload = TokenService.verifyRefresh(refreshToken);
        } catch {
            throw new AppError("Refresh token inválido", 401, "REFRESH_TOKEN_INVALID");
        }

        const hashed = Crypto.hashToken(refreshToken);
        const now = new Date();

        const token = await this.authRepository.findValidRefreshToken(hashed, now);

        if (!token || String(token.userId) !== payload.sub) {
            throw new AppError("Refresh token inválido", 401, "REFRESH_TOKEN_INVALID");
        }

        const newTokens = TokenService.generate({
            userId: token.userId.toString(),
        });

        const rotated = await this.authRepository.rotateRefreshToken(
            token.id,
            {
                userId: token.userId,
                refreshTokenHash: Crypto.hashToken(newTokens.refreshToken),
                expiresAt: newTokens.refreshExpiresAt,
            },
            now,
        );

        if (!rotated) {
            throw new AppError("Refresh token inválido", 401, "REFRESH_TOKEN_INVALID");
        }

        return {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.authRepository.revokeRefreshToken(Crypto.hashToken(refreshToken));
    }

    async logoutAll(userId: number): Promise<void> {
        await this.authRepository.revokeAllRefreshTokens(userId);
    }
}

const authService = new AuthService();

export { authService };
