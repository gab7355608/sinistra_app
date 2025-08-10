import { useRegister } from '@/api/queries/authQueries';

import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDto, Register as RegisterSchema } from '@shared/dto';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterDto>({
        resolver: zodResolver(RegisterSchema),
    });

    const { mutate: registerUser, isPending } = useRegister();

    const onSubmit = async (data: RegisterDto) => {
        console.log(data);
        try {
            const formattedData = {
                ...data,
            };
            registerUser(formattedData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div 
                        className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"
                        style={{animationDelay: '2s'}}
                    ></div>
                    <div 
                        className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
                        style={{animationDelay: '4s'}}
                    ></div>
                </div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Main register card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                >
                    {/* Header avec logo Sinistra */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-lg">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent"
                            >
                                Sinistra
                            </motion.h1>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Inscription
                            </h2>
                            <p className="text-gray-600">
                                Créez votre compte pour gérer vos sinistres
                            </p>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="space-y-4"
                        >
                            {/* Nom et Prénom */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute left-3 top-9 z-10">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        label="Nom"
                                        {...register('lastName')}
                                        error={errors.lastName?.message}
                                        placeholder="Dupont"
                                        required
                                        className="pl-11 h-12 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-9 z-10">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        label="Prénom"
                                        {...register('firstName')}
                                        error={errors.firstName?.message}
                                        placeholder="Jean"
                                        required
                                        className="pl-11 h-12 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <div className="absolute left-3 top-9 z-10">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    label="Email"
                                    type="email"
                                    {...register('email')}
                                    error={errors.email?.message}
                                    placeholder="votre@email.com"
                                    className="pl-11 h-12 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                                />
                            </div>

                            {/* Mot de passe */}
                            <div className="relative">
                                <div className="absolute left-3 top-9 z-10">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
   
                                <Input
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    error={errors.password?.message}
                                    placeholder="••••••••"
                                    required
                                    className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                                />
                            </div>

                            {/* Confirmer mot de passe */}
                            <div className="relative">
                                <div className="absolute left-3 top-9 z-10">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    label="Confirmer le mot de passe"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    error={errors.confirmPassword?.message}
                                    placeholder="••••••••"
                                    required
                                    className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                                />
                            </div>
                        </motion.div>

                        {/* Conditions d'utilisation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    {...register('acceptTerms')} 
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label className="text-sm text-gray-700">
                                    J'accepte les{' '}
                                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                                        conditions d'utilisation
                                    </a>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    {...register('acceptPrivacy')} 
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label className="text-sm text-gray-700">
                                    J'accepte la{' '}
                                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                                        politique de confidentialité
                                    </a>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <Button
                                type="submit"
                                isLoading={isSubmitting || isPending}
                                disabled={isSubmitting || isPending}
                                loadingText="Inscription en cours..."
                                className="w-full h-12 bg-gradient-accent hover:opacity-90 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Créer mon compte
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-center"
                        >
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 inline-flex items-center gap-1"
                            >
                                Déjà un compte ? Se connecter
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </form>

                
                </motion.div>
            </div>
        </div>
    );
}
