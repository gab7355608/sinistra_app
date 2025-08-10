import { motion } from 'framer-motion';
import {
    Calendar,
    Plus,
    Search,
    Shield,
    User,
    UserCheck
} from 'lucide-react';
import React, { useState } from 'react';

import { useGetAllUsers } from '@/api/queries/userQueries';
import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { BasicUserDto } from '@shared/dto';
import { Role } from '@shared/enums';
import Loader from '@/components/ui/Loader/Loader';

interface ClaimSpecialty {
    id: string;
    label: string;
    description: string;
}

// Spécialités disponibles
const claimSpecialties: ClaimSpecialty[] = [
    { id: 'water_damage', label: 'Dégât des eaux', description: 'Fuites, inondations, infiltrations' },
    { id: 'fire', label: 'Incendie', description: 'Incendies domestiques et professionnels' },
    { id: 'theft', label: 'Vol', description: 'Cambriolages et vols' },
    { id: 'car_accident', label: 'Accident automobile', description: 'Collisions et sinistres auto' },
    { id: 'natural_disaster', label: 'Catastrophe naturelle', description: 'Tempêtes, grêle, inondations' },
    { id: 'glass_breakage', label: 'Bris de glace', description: 'Vitres, miroirs, verrerie' },
    { id: 'civil_liability', label: 'Responsabilité civile', description: 'Dommages causés à autrui' },
    { id: 'health', label: 'Santé', description: 'Sinistres médicaux et hospitaliers' }
];

const Users: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<BasicUserDto | null>(null);
    const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);

    const { data: users = [], isLoading, error } = useGetAllUsers({
        search: searchQuery,
    });



    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };



    const handleEditSpecialities = (user: BasicUserDto) => {
        if (user.roles.includes(Role.CONSULTANT)) {
            setSelectedUser(user);
            setTempSpecialties([]); // For now, empty since specialties aren't in the DTO
            setIsSpecialtiesModalOpen(true);
        }
    };

    const handleSpecialtyToggle = (specialtyId: string) => {
        setTempSpecialties(prev => 
            prev.includes(specialtyId)
                ? prev.filter(id => id !== specialtyId)
                : [...prev, specialtyId]
        );
    };

    const handleSaveSpecialities = () => {
        // TODO: Implement API call to save specialties
        // For now, just close the modal
        setIsSpecialtiesModalOpen(false);
        setSelectedUser(null);
        setTempSpecialties([]);
    };

    const toggleUserStatus = (userId: string) => {
        // TODO: Implement API call to toggle user status
        console.log('Toggle user status:', userId);
    };

    const getRoleConfig = (roles: Role[]) => {
        // Get the highest priority role
        if (roles.includes(Role.ADMIN)) {
            return { label: 'Admin', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: <Shield className="h-3 w-3" /> };
        } else if (roles.includes(Role.CONSULTANT)) {
            return { label: 'Consultant', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <UserCheck className="h-3 w-3" /> };
        } else {
            return { label: 'Client', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: <User className="h-3 w-3" /> };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };


    if (isLoading) return <Loader />

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-600">Impossible de charger les utilisateurs.</p>
                </div>
            </div>
        );
    }

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
                                Gestion des Utilisateurs
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez les utilisateurs et leurs rôles
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {users.length} utilisateur{users.length > 1 ? 's' : ''}
                            </div>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nouvel utilisateur
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Recherche et filtres */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <SearchBar
                                placeholder="Rechercher par nom, prénom ou email..."
                                onSearch={handleSearch}
                            />
                        </div>
    
                    </div>
                </motion.div>

                {/* Tableau des utilisateurs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {users.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Aucun utilisateur trouvé
                            </h3>
                            <p className="text-gray-600">
                                Essayez de modifier vos critères de recherche ou vos filtres
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead>Date création</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: BasicUserDto) => {
                                    const roleConfig = getRoleConfig(user.roles);
                                    
                                    return (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                                                    {roleConfig.icon}
                                                    {roleConfig.label}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.roles.includes(Role.CONSULTANT) && (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleEditSpecialities(user)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <UserCheck className="h-4 w-4" />
                                                            Spécialités
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                        Actions
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>

            </div>

            {/* Modal des spécialités */}
            <Modal
                isOpen={isSpecialtiesModalOpen}
                onClose={() => setIsSpecialtiesModalOpen(false)}
                title="Spécialités"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {claimSpecialties.map((specialty) => (
                            <div
                                key={specialty.id}
                                className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    id={specialty.id}
                                    checked={tempSpecialties.includes(specialty.id)}
                                    onChange={() => handleSpecialtyToggle(specialty.id)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label
                                    htmlFor={specialty.id}
                                    className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                                >
                                    {specialty.label}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="secondary"
                            onClick={() => setIsSpecialtiesModalOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleSaveSpecialities}>
                            Sauvegarder les spécialités
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
