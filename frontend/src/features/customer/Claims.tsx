import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    Droplets,
    Eye,
    Filter,
    Flame,
    Search,
    Shield,
    UserX
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetAllTickets } from '@/api/queries/ticketQueries';
import { Button } from '@/components/ui/Button/Button';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import { useAuthStore } from '@/stores/authStore';
import { TicketStatus, TicketType } from '@shared/enums';
import { TicketDto } from '@shared/dto';

interface Claim {
    id: string;
    type: 'automobile' | 'habitation' | 'sante' | 'vie';
    title: string;
    date: string;
    status: 'En cours' | 'Résolu' | 'En attente' | 'Refusé';
    lastUpdate: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}


const getClaimIcon = (type: TicketType) => {
    const icons = {
        [TicketType.CAR_ACCIDENT]: <Car className="h-5 w-5" />,
        [TicketType.FIRE]: <Flame className="h-5 w-5" />,
        [TicketType.THEFT_BURGLARY]: <UserX className="h-5 w-5" />,
        [TicketType.WATER_DAMAGE]: <Droplets className="h-5 w-5" />
    };
    return icons[type];
};

const getStatusConfig = (status: TicketStatus) => {
    const configs = {
        [TicketStatus.OPEN]: { 
            icon: <Clock className="h-4 w-4" />, 
            color: 'bg-blue-500/10 text-blue-600',
            badgeVariant: 'info' as const 
        },
        [TicketStatus.RESOLVED]: { 
            icon: <CheckCircle2 className="h-4 w-4" />, 
            color: 'bg-green-500/10 text-green-600',
            badgeVariant: 'success' as const 
        },
        [TicketStatus.IN_PROGRESS]: { 
            icon: <AlertCircle className="h-4 w-4" />, 
            color: 'bg-yellow-500/10 text-yellow-600',
            badgeVariant: 'warning' as const 
        }
       
    };
    return configs[status as unknown as keyof typeof configs];
};


const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const Claims: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const { data: tickets, isLoading, error } = useGetAllTickets({
        status: selectedStatus as TicketStatus,
        type: selectedType as TicketType,
        clientId: user?.id,
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
    };


    const handleViewDetails = (claimId: string) => {
        navigate(`/customer/claims/${claimId}`);
    };

    const statusOptions = [
        { value: '', label: 'Tous les statuts' },
        { value: 'En cours', label: 'En cours' },
        { value: 'Résolu', label: 'Résolu' },
        { value: 'En attente', label: 'En attente' },
        { value: 'Refusé', label: 'Refusé' }
    ];

    const getTypeLabel = (type: TicketType) => {
        const labels = {
            [TicketType.CAR_ACCIDENT]: 'Automobile',
            [TicketType.FIRE]: 'Incendie',
            [TicketType.THEFT_BURGLARY]: 'Vol',
            [TicketType.WATER_DAMAGE]: 'Eau'
        };
        return labels[type as unknown as keyof typeof labels];
    };

    return (
        <div className="min-h-screen bg-gray-50 px-8 py-6">
            <div className="mx-auto max-w-7xl">
                {/* Header moderne */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-purple rounded-2xl flex items-center justify-center shadow-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mes sinistres
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez et suivez vos déclarations de sinistres
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{tickets?.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-gray-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">En cours</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {tickets?.filter(c => c.status === TicketStatus.OPEN).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Résolus</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {tickets?.filter(c => c.status === TicketStatus.RESOLVED).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">En attente</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {tickets?.filter(c => c.status === TicketStatus.IN_PROGRESS).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8 flex flex-col sm:flex-row gap-4"
                >
                    <div className="flex-1">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Rechercher un sinistre..."
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Claims Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {tickets?.map((claim: TicketDto, index) => {
                        const statusConfig = getStatusConfig(claim.status);
                        
                        return (
                            <motion.div
                                key={claim.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center text-white">
                                            {getClaimIcon(claim.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {claim.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {getTypeLabel(claim.type as TicketType)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                </div>

                                {/* Status */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                    <span>{claim.status}</span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {claim.description}
                                </p>

                                {/* Dates */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>Déclaré le {formatDate(claim.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        {/* TODO: add updatedAt */}
                                        <span>Mis à jour le {formatDate(claim.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <button 
                                    onClick={() => handleViewDetails(claim.id)}
                                    className="w-full bg-gray-100 text-gray-700 rounded-lg py-2 px-3 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Voir les détails</span>
                                </button>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Empty State */}
                {tickets?.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                    >
                        <div className="bg-white rounded-2xl p-12 mx-auto max-w-md shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucun sinistre trouvé
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Aucun sinistre ne correspond à vos critères de recherche
                            </p>
                            <Button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedStatus('');
                                }}
                                className="bg-gradient-purple text-white hover:opacity-90"
                            >
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Claims; 