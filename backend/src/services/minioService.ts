import { logger } from '@/utils/logger';

import { FileSchema } from '@shared/dto';
import dotenv from 'dotenv';
import * as Minio from 'minio';

interface ExtendedFile extends FileSchema {
    toBuffer?: () => Promise<Buffer>;
}

// Loading environment variables
dotenv.config();

class MinioService {
    private minioClient: Minio.Client;
    private bucketName: string;
    private logger = logger.child({
        module: '[Nexelis][MinioService]',
    });

    constructor() {
        // Get the bucket name from the environment variable
        this.bucketName = process.env.MINIO_BUCKET || 'files';

        // Configure the MinIO client with debug options
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
            region: '',
            pathStyle: true,
        });

        this.logger;
    }

    /**
     * Initialize the MinIO client
     */
    public async initializeMinio(): Promise<void> {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);

            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName);
            }
        } catch (err) {
            this.logger.error(`Error details: ${JSON.stringify(err)}`);
        }
    }

    /**
     * Check if a bucket exists, otherwise create it
     * @param bucketName - The bucket name
     */
    public async checkBucket(bucketName: string): Promise<void> {
        const bucketExists = await this.minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName);
        }
    }

    /**
     * Upload files
     * @param file - The file to upload
     * @returns The file name
     */
    public async uploadFile(bucketName: string, file: ExtendedFile): Promise<any> {
        try {
            await this.checkBucket(bucketName);
            const fileName = `${Date.now()}-${file.fieldname}.${file.mimetype?.split('/')[1]}`;
            const fileSize = await file.file.bytesRead;

            await this.minioClient.putObject(
                bucketName,
                fileName,
                await file.toBuffer!(),
                fileSize,
                {
                    'Content-Type': file.mimetype,
                }
            );

            console.log('CREATED');

            return {
                name: fileName,
                mimetype: file.mimetype,
                size: fileSize,
            };
        } catch (err) {
            this.logger.error(`Error uploading file: ${JSON.stringify(err)}`);
            console.log('err', err);
            throw err;
        }
    }

    /**
     * Get a file
     * @param fileName - The file name
     * @returns The file URL
     */
    public async getFile(fileName: string): Promise<string> {
        try {
            let url = await this.minioClient.presignedUrl(
                'GET',
                this.bucketName,
                fileName,
                60 * 60 * 24
            );
            return url;
        } catch (err) {
            this.logger.error(`Error getting file: ${JSON.stringify(err)}`);
            throw err;
        }
    }

    /**
     * Get a file info
     * @param fileName - The file name
     * @returns The file info
     */
    public async getFileInfo(fileName: string): Promise<any> {
        try {
            let fileInfo = await this.minioClient.statObject(this.bucketName, fileName);
            return fileInfo;
        } catch (err) {
            this.logger.error(`Error getting file info: ${JSON.stringify(err)}`);
            throw err;
        }
    }
    /**
     * Delete a file
     * @param bucketName - The bucket name
     * @param fileName - The file name
     */
    public async deleteFile(bucketName: string, fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(bucketName, fileName);
        } catch (err) {
            this.logger.error(`Error deleting file: ${JSON.stringify(err)}`);
            throw err;
        }
    }
}

export const minioService = new MinioService();
