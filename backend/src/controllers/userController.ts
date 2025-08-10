import { userRepository } from '@/repositories';
import { userTransformer } from '@/transformers';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse, notFoundResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import { BasicUserDto, IdParams, idSchema, QueryUserSchema, queryUserSchema, updateUserDto, updateUserSchema } from '@shared/dto';

class UserController {
    private logger = logger.child({
        module: '[App][Auth]',
    });

    public getAll = asyncHandler<unknown, QueryUserSchema, unknown, BasicUserDto[]>({
        querySchema: queryUserSchema,
        logger: this.logger,
            handler: async (request, reply): Promise<ApiResponse<BasicUserDto[] | void> | void> => {
            // Handle pagination with default values
            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filters = {
                search: request.query.search,
                role: request.query.role,
            };

            const result = await userRepository.findAll(filters, skip, limit);

            const users = result.data.map((user) => userTransformer.toUserDto(user));

            return jsonResponse(reply, 'Users fetched successfully', users, 200, result.pagination);
        },
    });

    public getById = asyncHandler<unknown, unknown, IdParams, BasicUserDto>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<BasicUserDto | void> | void> => {
            const { id } = request.params;
            const user = await userRepository.findById(id);

            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const userDto = userTransformer.toUserDto(user);

            return jsonResponse(reply, 'User fetched successfully', userDto, 200);
        },
    });

    public update = asyncHandler<updateUserDto, unknown, IdParams>({
        bodySchema: updateUserSchema,
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<BasicUserDto | void> | void> => {
            const { id } = request.params;
            const userExists = await userRepository.findById(id);

            if (!userExists) {
                return notFoundResponse(reply, 'User not found');
            }

            const user = await userRepository.update(id, request.body);

            const userDto = userTransformer.toUserDto(user);

            return jsonResponse(reply, 'User updated successfully', userDto, 200);
        },
    });

    public delete = asyncHandler<unknown, unknown, IdParams>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { id } = request.params;
            const userExists = await userRepository.findById(id);

            if (!userExists) {
                return notFoundResponse(reply, 'User not found');
            }

            await userRepository.delete(id);

            return jsonResponse(reply, 'User deleted successfully', undefined, 204);
        },
    });
}

export const userController = new UserController();
