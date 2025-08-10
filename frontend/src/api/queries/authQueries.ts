import { authService } from "@/api/authService";
import queryClient from "@/configs/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { ApiResponse, AuthResponse } from "@/types";
import { LoginDto, ResetPasswordDto, UpdatePasswordDto } from "@shared/dto";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from 'js-cookie';

export const useRegister = () => {
    const { login, setUser } = useAuthStore();

    return useMutation({
        mutationFn: async (userData: any) => {
            const response = await authService.registerUser(userData);
            if (response.accessToken && response.refreshToken) {

                login(response.accessToken, response.refreshToken);

                // Récupérer les informations de l'utilisateur
                const user = await authService.getUserByToken(response.accessToken);
                if (user) {
                    setUser(user.data);
                    // Add user to cache
                    queryClient.setQueryData(['user'], user.data);
                }

                return { accessToken: response.accessToken, refreshToken: response.refreshToken };

            } else {
                throw new Error('Registration failed');
            }
        },

        onSuccess: async (response: AuthResponse) => {
            login(response.accessToken, response.refreshToken);
            console.log('Registration successful');
        },
    });
};

export const useLogin = () => {
    const { login, setUser } = useAuthStore();


    return useMutation<
        { accessToken: string; refreshToken: string },
        Error,                                         
        { email: string; password: string; rememberMe: boolean }
    >({
        mutationFn: async ({ email, password, rememberMe }: LoginDto) => {
            const response = await authService.loginUser({ email, password, rememberMe });
            if (response.accessToken && response.refreshToken) {

                // Mettre à jour le store avec les tokens
                login(response.accessToken, response.refreshToken);

                // Récupérer les informations de l'utilisateur
                const user = await authService.getUserByToken(response.accessToken);
                if (user) {
                    setUser(user.data);
                    // Add user to cache
                    queryClient.setQueryData(['user'], user.data);
                }

                return { accessToken: response.accessToken, refreshToken: response.refreshToken };
            } else {
                throw new Error('Login failed');
            }
        },

        onSuccess: async (response: AuthResponse) => {
            login(response.accessToken, response.refreshToken);
            console.log('Login successful');
        },

    });
};


export const useAutoLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['autoLogin'],
        queryFn: async () => {
            const accessToken = Cookies.get('accessToken');
            const refreshToken = Cookies.get('refreshToken');


            if (accessToken && refreshToken) {
                try {
                    const response = await authService.getUserByToken(accessToken);
                    login(accessToken, refreshToken);
                    setUser(response?.data || null);
                    setIsAuthenticated(true);
                    return true;

                } catch (error) {
                    console.error('Failed to fetch user by token:', error);
                    if (refreshToken) {
                        try {
                            const newTokens = await authService.refreshToken(refreshToken);
                            if (!newTokens) throw new Error('Failed to refresh tokens');

                            const userData = await authService.getUserByToken(newTokens.accessToken);
                            login(newTokens.accessToken, newTokens.refreshToken);
                            setUser(userData?.data || null);
                            setIsAuthenticated(true);
                            console.log('Auto login successful with refreshed token');
                            return true;
                        } catch (refreshError) {
                            console.error('Failed to refresh token, user needs to log in again.');
                            handleLogout();
                        }
                    }
                }
            } else {
                handleLogout();
                console.log('No token available in localStorage');
            }
            return false;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            return authService.getUserByToken(Cookies.get('accessToken') || '');
        },
    });
};

export const useLogout = () => {
    const refreshToken = Cookies.get('refreshToken');
    return useMutation({
        
        mutationFn: async () => {
            handleLogout();

            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        },
    });
};


export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (password: UpdatePasswordDto) => {
            return authService.updatePassword(password);
        },
        onSuccess: async (response: ApiResponse<void>) => {
            console.log('Password updated successfully');
        },
    });
};


export const useGetSessions = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            return authService.getSessions(user?.id || '').then((response) => {
                return response.data;
            });
        },
    });
};

export const useRequestPasswordReset = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return authService.requestPasswordReset({ email });
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordDto) => {
            return authService.resetPassword(data);
        },
    });
};

const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    useAuthStore.getState().logout();
};
