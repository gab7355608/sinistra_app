import { carPhotoService } from '@/api/carPhotoService';
import { ImageUploadResponse } from '@/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUploadCarPhoto = () => {
    const queryClient = useQueryClient();
    
    return useMutation<ImageUploadResponse, Error, File>({
        mutationFn: async (image: File) => {
            const response = await carPhotoService.uploadImage(image);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carPhotos'] });
        },
    });
};