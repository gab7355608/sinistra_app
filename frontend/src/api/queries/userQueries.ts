import { userService } from '@/api/userService';

import { BasicUserDto, QueryUserSchema, updateUserDto } from '@shared/dto';
import { Specialization } from '@shared/enums';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetAllUsers = (searchParams: QueryUserSchema) => {
    return useQuery<BasicUserDto[]>({
        queryKey: ['users', searchParams],
        queryFn: async () => {
            const response = await userService.getAllUsers(searchParams);
            return response.data;
        },
    });
};

export const useGetUserById = (userId: string) => {
    return useQuery<BasicUserDto>({
        queryKey: ['users', userId],
        queryFn: async () => {
            const response = await userService.getUserById(userId);
            return response.data;
        },
    });
};

export const useUpdateUser = () => {
    return useMutation<BasicUserDto, Error, { userId: string; user: updateUserDto }>({
        mutationFn: async ({ userId, user }: { userId: string; user: updateUserDto }) => {
            const response = await userService.updateUser(userId, user);
            return response.data;
        },
    });
};

export const useDeleteUser = () => {
    return useMutation<BasicUserDto, Error, string>({
        mutationFn: async (id: string) => {
            const response = await userService.deleteUser(id);
            return response.data;
        },
    });
};

export const useGetProfile = () => {
    return useQuery<BasicUserDto>({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const response = await userService.getProfile();
            return response.data;
        },
    });
};

export const useUpdateProfile = () => {
    return useMutation<BasicUserDto, Error, Partial<updateUserDto>>({
        mutationFn: async (profileData: Partial<updateUserDto>) => {
            const response = await userService.updateProfile(profileData);
            return response.data;
        },
    });
};

export const useUpdateSpecialization = () => {
    return useMutation<BasicUserDto, Error, Specialization>({
        mutationFn: async (specialization: Specialization) => {
            const response = await userService.updateSpecialization(specialization);
            return response.data;
        },
    });
};
