import { motion } from 'framer-motion';
import {
    Lock,
    Save,
    Shield,
    User
} from 'lucide-react';
import React, { useState } from 'react';

import { useUpdateProfile, useUpdateSpecialization } from '@/api/queries/userQueries';
import { Input } from '@/components/ui/Input/Input';
import { useAuthStore } from '@/stores/authStore';
import { updateUserDto } from '@shared/dto';
import { Role, Specialization } from '@shared/enums';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    specialization?: Specialization;
}

interface SpecializationOption {
    id: Specialization;
    label: string;
    description: string;
}

const specializationOptions: SpecializationOption[] = [
    { id: Specialization.WATER_DAMAGE, label: 'Dégât des eaux', description: 'Fuites, inondations, infiltrations' },
    { id: Specialization.FIRE, label: 'Incendie', description: 'Incendies domestiques et professionnels' },
    { id: Specialization.THEFT_BURGLARY, label: 'Vol et cambriolage', description: 'Cambriolages et vols' },
    { id: Specialization.CAR_ACCIDENT, label: 'Accident automobile', description: 'Collisions et sinistres auto' },
];

const Profile: React.FC = () => {
    const { user, setUser } = useAuthStore();
    
    // Vérifier si l'utilisateur a le rôle consultant
    const isConsultant = user?.roles?.includes(Role.CONSULTANT) || false;

    // Hooks pour les mutations API
    const updateProfileMutation = useUpdateProfile();
    const updateSpecializationMutation = useUpdateSpecialization();
    const [profile, setProfile] = useState<UserProfile>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        birthDate: user?.birthDate || '',
        specialization: undefined,
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [showPassword] = useState(false);
    const [showNewPassword] = useState(false);
    const [showConfirmPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'specialization'>('profile');

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSpecializationChange = (specialization: Specialization) => {
        setProfile(prev => ({
            ...prev,
            specialization: specialization
        }));
    };

    const validateForm = (): boolean => {
        if (activeTab === 'profile') {
            if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
                return false;
            }
        }
        
        if (activeTab === 'security') {
            if (!currentPassword.trim()) {
                return false;
            }
            if (newPassword && newPassword !== confirmPassword) {
                return false;
            }
            if (newPassword && newPassword.length < 8) {
                return false;
            }
        }
        
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        
        try {
            if (activeTab === 'profile') {
                // Mettre à jour le profil
                const profileData: Partial<updateUserDto> = {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                    birthDate: profile.birthDate,
                };

                const updatedUser = await updateProfileMutation.mutateAsync(profileData);
                setUser(updatedUser); // Mettre à jour le store
                
            } else if (activeTab === 'security') {
                // Mettre à jour le mot de passe
                const passwordData: Partial<updateUserDto> = {
                    password: newPassword,
                };

                await updateProfileMutation.mutateAsync(passwordData);
                
                // Réinitialiser les champs de mot de passe après sauvegarde
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
            } else if (activeTab === 'specialization' && profile.specialization) {
                // Mettre à jour la spécialisation
                const updatedUser = await updateSpecializationMutation.mutateAsync(profile.specialization);
                setUser(updatedUser); // Mettre à jour le store
            }
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 px-8 py-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Profil & Paramètres
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez votre profil et personnalisez votre expérience
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gradient-purple text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sauvegarde...
                                </>
                            ) :  (
                                <>
                                    <Save className="h-4 w-4" />
                                    Sauvegarder les modifications
                                </>
                           )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-64 flex-shrink-0"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Navigation</h3>
                            </div>
                            <nav className="p-4 space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                                        activeTab === 'profile'
                                            ? 'bg-gradient-purple text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">Profil</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                                        activeTab === 'security'
                                            ? 'bg-gradient-purple text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Lock className="h-5 w-5" />
                                    <span className="font-medium">Sécurité</span>
                                </button>
                                {isConsultant && (
                                    <button
                                        onClick={() => setActiveTab('specialization')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                                            activeTab === 'specialization'
                                                ? 'bg-gradient-purple text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Shield className="h-5 w-5" />
                                        <span className="font-medium">Spécialisation</span>
                                    </button>
                                )}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            {activeTab === 'profile' && (
                                <div className="p-8">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-gradient-purple rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                                {getInitials(profile.firstName, profile.lastName)}
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {profile.firstName} {profile.lastName}
                                            </h2>
                                            <p className="text-gray-600 mt-1">{profile.email}</p>
                                            <div className="flex items-center gap-3 mt-3">
                    
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-purple text-white rounded-full text-sm font-medium">
                                                    <Shield className="h-4 w-4" />
                                                    Premium
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Form */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <Input
                                                    label="Prénom"
                                                    name="firstName"
                                                    type="text"
                                                    value={profile.firstName}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                    className="w-full"
                                                />
                                                <Input
                                                    label="Nom"
                                                    name="lastName"
                                                    type="text"
                                                    value={profile.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>

                                            <Input
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full"
                                            />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Téléphone"
                                                    name="phone"
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="w-full"
                                                />
     
                                                <Input
                                                    label="Date de naissance"
                                                    name="birthDate"
                                                    type="date"
                                                    value={profile.birthDate}
                                                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                    className="w-full"
                                                />
                                        </div>

                                            <Input
                                                label="Adresse"
                                                name="address"
                                                type="text"
                                                value={profile.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className="w-full"
                                            />
                                    </div>

                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="p-8">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Sécurité du compte
                                        </h3>
                                        <p className="text-gray-600">
                                            Modifiez votre mot de passe et gérez vos paramètres de sécurité
                                        </p>
                                    </div>

                                    <div className="space-y-6">
     
                                                <Input
                                                    label="Mot de passe actuel"
                                                    name="currentPassword"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Entrez votre mot de passe actuel"
                                                    className="w-full pr-10"
                                                />
                                               

   
                                                <Input
                                                    label="Nouveau mot de passe"
                                                    name="newPassword"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Entrez votre nouveau mot de passe"
                                                    className="w-full pr-10"
                                                />
                                         
                                
                                                <Input
                                                    label="Confirmer le nouveau mot de passe"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirmez votre nouveau mot de passe"
                                                    className="w-full pr-10"
                                                />
                                        

                                        
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specialization' && isConsultant && (
                                <div className="p-8">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Spécialisation
                                        </h3>
                                        <p className="text-gray-600">
                                            Sélectionnez votre domaine d'expertise pour la gestion des sinistres
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {specializationOptions.map((option) => (
                                            <motion.div
                                                key={option.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        id={option.id}
                                                        name="specialization"
                                                        checked={profile.specialization === option.id}
                                                        onChange={() => handleSpecializationChange(option.id)}
                                                        className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                    />
                                                    <div className="flex-1">
                                                        <label
                                                            htmlFor={option.id}
                                                            className="text-sm font-medium text-gray-900 cursor-pointer"
                                                        >
                                                            {option.label}
                                                        </label>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 