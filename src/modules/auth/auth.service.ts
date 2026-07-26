import type { LoginDTO, TokensDTO } from "@modules/auth/auth.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { LoginValidator } from "@src/modules/auth/input-validation/login.validator.js";
import {
    PrismaAuthRepository,
    type AuthRepository,
} from "@src/modules/auth/repositories/auth.repository.js";
import { TokenService } from "@src/shared/services/token.service.js";
import { Bcrypt } from "@src/shared/utils/bcrypt.js";
import { Crypto } from "@src/shared/utils/crypto.js";

class AuthService {
    constructor(
        private readonly authRepository: AuthRepository =
            new PrismaAuthRepository(),
    ) {}

    async login(data: LoginDTO): Promise<TokensDTO> {
        LoginValidator.validate(data);

        const { email, password } = data;

        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new Error(MESSAGES.USER.AUTH.INCORRECT_CREDENTIALS);
        }

        const correctPassword = await Bcrypt.comparePassword(
            password,
            user.passwordHash,
        );

        if (!correctPassword) {
            throw new Error(MESSAGES.USER.AUTH.INCORRECT_CREDENTIALS);
        }

        const tokens = TokenService.generate({
            userId: user.id.toString(),
        });

        const hashedRefreshToken = Crypto.hashToken(tokens.refreshToken);

        await this.authRepository.createRefreshToken({
            userId: user.id,
            refreshTokenHash: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // TODO: move to env
        });

        return tokens;
    }

    async refresh(refreshToken: string): Promise<TokensDTO> {
        const hashed = Crypto.hashToken(refreshToken);
        const now = new Date();

        const token = await this.authRepository.findValidRefreshToken(
            hashed,
            now,
        );

        if (!token) {
            throw new Error("Refresh token inválido");
        }

        const newTokens = TokenService.generate({
            userId: token.userId.toString(),
        });

        const rotated = await this.authRepository.rotateRefreshToken(
            token.id,
            {
                userId: token.userId,
                refreshTokenHash: Crypto.hashToken(newTokens.refreshToken),
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                ), // TODO: move to env
            },
            now,
        );

        if (!rotated) {
            throw new Error("Refresh token inválido");
        }

        return newTokens;
    }
}

const authService = new AuthService();
export { authService };
