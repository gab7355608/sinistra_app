import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { BasicUserDto, QueryUserSchema, updateUserDto } from '@shared/dto';
import { Specialization } from '@shared/enums';

class UserService {
    private apiUrl = '/api/users';

    public async getAllUsers(params: QueryUserSchema): Promise<ApiResponse<BasicUserDto[]>> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.role) queryParams.append('role', params.role);
        return api.fetchRequest(`${this.apiUrl}?${queryParams.toString()}`, 'GET', null, true);
    }

    public async getUserById(userId: string): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'GET', null, true);
    }

    public async updateUser(userId: string, user: updateUserDto): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'PATCH', user, true);
    }

    public async deleteUser(userId: string): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'DELETE', null, true);
    }

    public async updateProfile(profileData: Partial<updateUserDto>): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/profile`, 'PATCH', profileData, true);
    }

    public async updateSpecialization(specialization: Specialization): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/specialization`, 'PATCH', { specialization }, true);
    }

    public async getProfile(): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/profile`, 'GET', null, true);
    }
}

export const userService = new UserService();
