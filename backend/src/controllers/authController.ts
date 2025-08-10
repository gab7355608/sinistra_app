import { Token, User } from '@/config/client';
import { FailedLoginAttempt } from '@/email-templates/emails/security/failedLoginAttempt';
import { NewDeviceLogin } from '@/email-templates/emails/security/newDeviceLogin';
import { tokenRepository, userRepository } from '@/repositories';
import { authService, mailerService, tokenService } from '@/services';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import {
    authResponse,
    badRequestResponse,
    internalServerError,
    jsonResponse,
    notFoundResponse,
    unauthorizedResponse
} from '@/utils/jsonResponse';
import { getLocationFromIp } from '@/utils/locationFromIp';
import { logger } from '@/utils/logger';
import { parseUserAgent } from '@/utils/userAgentParser';
import { render } from '@react-email/components';
import {
    AuthResponse,
    Login,
    QuerySessionsSchema,
    Register,
    RequestPasswordResetSchema,
    ResetPasswordSchema,
    TokenDto,
    TokenSchema,
    UpdatePasswordSchema,
    updateUserDto,
} from '@shared/dto';
import bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';

class AuthController {
    private logger = logger.child({
        module: '[App][Auth]',
    });

    public createUser = asyncHandler<Register>({
        bodySchema: Register,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponse | void> | void> => {
            const existingUser = await userRepository.findByEmail(request.body.email);

            if (existingUser) {
                return badRequestResponse(reply, 'User already exists');
            }

            const hashedPassword = await bcrypt.hash(request.body.password, 10);

            const { confirmPassword, ...userData } = request.body;
            const createdUser = await userRepository.create({
                ...userData,
                password: hashedPassword,
            });


            const tokens = await authService.generateTokens(createdUser, request);


            if (!tokens) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, tokens.accessToken.token, tokens.refreshToken.token);
        },
    });

    public login = asyncHandler<Login>({
        bodySchema: Login,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponse | void> | void> => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user) {
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(request.body.password, user.password);

            const isNewDevice = await authService.isNewDevice(user, request);
            
            const parsedUserAgent = parseUserAgent(request.headers['user-agent'] as string);
            const location = await getLocationFromIp(request.ip);

            if (!isPasswordValid) {
                if(isNewDevice) {
                    mailerService.sendEmail(
                        user.email, 
                        'Failed Login Attempt', 
                        await render(FailedLoginAttempt({
                            name: user.firstName,
                            attemptDate: new Date().toLocaleString(),
                            ipAddress: request.ip,
                            location: (location?.city || location?.country) ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}` : 'Non disponible',
                            deviceInfo: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}, ${request.ip}`
                        }))
                    );
                }
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            await userRepository.update(user.id, { lastLoginAt: new Date() } as updateUserDto & { lastLoginAt?: Date });

            const tokens = await authService.generateTokens(user, request);


            //check if is a new device
            if(isNewDevice) {
                try {
                    mailerService.sendEmail(
                        user.email, 
                        'New Device Login', 
                        await render(NewDeviceLogin({
                            name: user.firstName,
                            deviceName: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}`,
                            loginDate: new Date().toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            }),
                            location: (location?.city || location?.country) ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}` : 'Non disponible',
                            deviceId: parsedUserAgent.raw.slice(0, 20)
                        }))
                    );
                } catch (error) {
                    console.log('\n\n error', error)
                    this.logger.error({
                        msg: 'Erreur lors de l\'envoi de l\'email de nouveau appareil',
                        error: error
                    });
                }
            }

            if (!tokens ) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, tokens.accessToken.token, tokens.refreshToken.token);
        },
    });

    public updatePassword = asyncHandler<UpdatePasswordSchema>({
        bodySchema: UpdatePasswordSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { currentPassword, newPassword } = request.body;

            const existingUser = await userRepository.findById(request.user.id);


            if (!existingUser || !existingUser.id) {
                return notFoundResponse(reply, 'User not found');
            }

            if(existingUser.id !== request.user.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);

            console.log('\n\n isPasswordValid', isPasswordValid)

            if (!isPasswordValid) {
                return unauthorizedResponse(reply, 'Invalid password');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userRepository.update(existingUser.id, { password: hashedPassword } as updateUserDto);

            return jsonResponse(reply, 'Password updated successfully', undefined, 200);
        },
    });

    public refreshToken = asyncHandler<TokenDto>({
        bodySchema: TokenSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponse | void> | void> => {
            const body = request.body as { token: string };
            const token = body.token;
            const decoded = verify(token, process.env.JWT_SECRET as string) as User;

            const foundToken = await tokenRepository.findByToken(token);

            if (!foundToken || foundToken.unvailableAt) {
                return unauthorizedResponse(reply, 'Invalid token');
            }

            const user = await userRepository.findById(decoded.id);

            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const newTokens = await authService.generateTokens(user, request);

            if (!newTokens) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, newTokens.accessToken.token, newTokens.refreshToken.token);
        }
    });

    public requestPasswordReset = asyncHandler<RequestPasswordResetSchema>({
        bodySchema: RequestPasswordResetSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<TokenDto | void> | void> => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user || !user.id) {
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            const token = await tokenService.generatePasswordResetToken(user.id, request.ip);

            if (!token) {
                return internalServerError(reply, 'Error generating token');
            }

            return jsonResponse(reply, 'Password reset requested', { token }, 200);
        },
    });

    public resetPassword = asyncHandler<ResetPasswordSchema>({
        bodySchema: ResetPasswordSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { token, currentPassword, newPassword } = request.body;
            console.log('\n\n token', token)

            const resetToken = await authService.findByToken(token);
            
            if (
                !resetToken ||
                resetToken.type !== 'reset_password' ||
                new Date() > resetToken.expiresAt
            ) {
                return badRequestResponse(reply, 'Invalid or expired token');
            }

            const user = await userRepository.findById(resetToken.ownedById as string);
            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return badRequestResponse(reply, 'Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userRepository.updatePassword(resetToken.ownedById as string, hashedPassword);

            await authService.deleteToken(resetToken.id);


            return jsonResponse(reply, 'Password reset successfully', undefined, 200);
        },
    });

    public getCurrentUser = asyncHandler<User>({
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<User | void> | void> => {
            
            if (!request.user?.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const user = await userRepository.findById(request.user.id);
            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const token = request.headers.authorization?.split(' ')[1];
            const foundedToken = await tokenRepository.findByToken(token as string);

            if (!token || foundedToken?.unvailableAt) {
                return unauthorizedResponse(reply, 'Invalid token');
            }

            await userRepository.update(user.id, { lastLoginAt: new Date() } as updateUserDto & { lastLoginAt?: Date });
            
            // Transform roles from string to array
            const userWithParsedRoles = {
                ...user,
                roles: (() => {
                    try {
                        if (typeof user.roles === 'string') {
                            // Handle the format "['ROLE_USER']" by converting it to valid JSON
                            const cleanedRoles = user.roles
                                .replace(/'/g, '"') // Replace single quotes with double quotes
                                .replace(/\[/g, '[') // Ensure proper bracket format
                                .replace(/\]/g, ']');
                            return JSON.parse(cleanedRoles);
                        } else if (Array.isArray(user.roles)) {
                            return user.roles;
                        }
                        return [];
                    } catch (error) {
                        console.error('Error parsing user roles:', error);
                        // Fallback: try to extract roles using regex
                        if (typeof user.roles === 'string') {
                            const matches = user.roles.match(/'([^']+)'/g);
                            if (matches) {
                                return matches.map(match => match.replace(/'/g, ''));
                            }
                        }
                        return [];
                    }
                })()
            };

            return jsonResponse(reply, 'User retrieved successfully', userWithParsedRoles, 200);
        },
    });

    public getMySessions = asyncHandler<unknown, QuerySessionsSchema, unknown, Token[]>({
        querySchema: QuerySessionsSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<Token[] | void> | void> => {
            if (!request.user?.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            if (request.query.userId !== request.user.id && request.user.roles !== 'ROLE_ADMIN') {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const tokens = await tokenRepository.findAllByUserIdAndBrowser(request.query.userId);
            return jsonResponse(reply, 'Sessions retrieved successfully', tokens, 200);
        },
    });


    
}

export const authController = new AuthController();
