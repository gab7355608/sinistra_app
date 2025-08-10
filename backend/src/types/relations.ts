import { Post, User } from '@/config/client';

export interface UserWithRelations extends User {
    posts?: Post[];
}

export interface PostWithRelations extends Post {
    author?: User;
}
