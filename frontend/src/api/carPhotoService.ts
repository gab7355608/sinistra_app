import { api } from '@/api/interceptor';
import { ApiResponse, ImageUploadResponse } from '@/types';

class CarPhotoService {
    private apiUrl = '/api/car-photos';

    public async uploadImage(image: File): Promise<ApiResponse<ImageUploadResponse>> {
        const formData = new FormData();
        formData.append('image', image);
        console.log('formData :', formData);
        return api.fetchRequest(`${this.apiUrl}`, 'POST', formData, true);
    }
}

export const carPhotoService = new CarPhotoService(); 