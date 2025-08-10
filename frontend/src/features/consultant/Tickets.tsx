import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    Eye,
    Flame,
    Home,
    Search,
    Shield
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetAllTickets } from '@/api/queries/ticketQueries';
import { Button } from '@/components/ui/Button/Button';
import Loader from '@/components/ui/Loader/Loader';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { useAuthStore } from '@/stores/authStore';
import { TicketDto } from '@shared/dto';
import { Role, TicketStatus, TicketType } from '@shared/enums';

const getTypeIcon = (type: TicketType) => {
    const icons = {
        [TicketType.CAR_ACCIDENT]: <Car className="h-5 w-5" />,
        [TicketType.FIRE]: <Flame className="h-5 w-5" />,
        [TicketType.THEFT_BURGLARY]: <Shield className="h-5 w-5" />,
        [TicketType.WATER_DAMAGE]: <Home className="h-5 w-5" />
    };
    return icons[type];
};

const getTypeLabel = (type: TicketType) => {
    const labels = {
        [TicketType.CAR_ACCIDENT]: 'Accident automobile',
        [TicketType.FIRE]: 'Incendie',
        [TicketType.THEFT_BURGLARY]: 'Vol/Cambriolage',
        [TicketType.WATER_DAMAGE]: 'Dégât des eaux'
    };
    return labels[type];
};

const getStatusConfig = (status: TicketStatus) => {
    const configs = {
        [TicketStatus.OPEN]: { 
            icon: <AlertCircle className="h-4 w-4" />, 
            color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
            label: 'Ouvert'
        },
        [TicketStatus.IN_PROGRESS]: { 
            icon: <Clock className="h-4 w-4" />, 
            color: 'bg-blue-500/10 text-blue-600 border-blue-200',
            label: 'En cours'
        },
        [TicketStatus.RESOLVED]: { 
            icon: <CheckCircle2 className="h-4 w-4" />, 
            color: 'bg-green-500/10 text-green-600 border-green-200',
            label: 'Résolu'
        }
    };
    return configs[status];
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const Tickets: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // Vérifier si l'utilisateur est admin
    const isAdmin = user?.roles.includes(Role.ADMIN) || false;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
    const [selectedType, setSelectedType] = useState<TicketType | ''>('');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    // Debounce de la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Préparer les paramètres de recherche
    const searchParams = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchQuery || undefined,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
        // Les consultants ne voient que leurs tickets, les admins voient tout
        consultantId: isAdmin ? undefined : user?.id,
    };

    const { data: ticketResponse, isLoading, error } = useGetAllTickets(searchParams);
    
    const tickets = ticketResponse || [];

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status as TicketStatus | '');
        setCurrentPage(1);
    };

    const handleTypeFilter = (type: string) => {
        setSelectedType(type as TicketType | '');
        setCurrentPage(1);
    };

    const handleViewDetails = (ticketId: string) => {
        navigate(`/customer/claims/${ticketId}`);
    };

    const statusOptions = [
        { value: '', label: 'Tous les statuts' },
        { value: TicketStatus.OPEN, label: 'Ouvert' },
        { value: TicketStatus.IN_PROGRESS, label: 'En cours' },
        { value: TicketStatus.RESOLVED, label: 'Résolu' }
    ];

    const typeOptions = [
        { value: '', label: 'Tous les types' },
        { value: TicketType.CAR_ACCIDENT, label: 'Accident automobile' },
        { value: TicketType.FIRE, label: 'Incendie' },
        { value: TicketType.THEFT_BURGLARY, label: 'Vol/Cambriolage' },
        { value: TicketType.WATER_DAMAGE, label: 'Dégât des eaux' }
    ];

    if (isLoading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-600">Impossible de charger les tickets.</p>
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
                                {isAdmin ? 'Tous les Tickets' : 'Mes Tickets'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isAdmin 
                                    ? 'Gérez tous les sinistres et leur attribution'
                                    : 'Gérez vos sinistres assignés et suivez leur progression'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {tickets.length} ticket{tickets.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recherche et filtres */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recherche
                            </label>
                            <SearchBar
                                placeholder="Rechercher par titre, description ou client..."
                                onSearch={handleSearch}
                            />
                        </div>
                        <div className="flex gap-4">
                            <SelectInput
                                value={selectedStatus}
                                onChange={handleStatusFilter}
                                options={statusOptions}
                                label="Statut"
                                name="status"
                                placeholder="Statut"
                            />
                            <SelectInput
                                value={selectedType}
                                onChange={handleTypeFilter}
                                options={typeOptions}
                                label="Type"
                                name="type"
                                placeholder="Type"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Tableau des tickets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {tickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Aucun ticket trouvé
                            </h3>
                            <p className="text-gray-600">
                                Essayez de modifier vos critères de recherche ou vos filtres
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Client</TableHead>
                                    {isAdmin && <TableHead>Consultant</TableHead>}
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date création</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket: TicketDto) => {
                                    const statusConfig = getStatusConfig(ticket.status);
                                    
                                    return (
                                        <TableRow
                                            key={ticket.id}
                                            hover
                                            className="cursor-pointer"
                                            onClick={() => handleViewDetails(ticket.id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                                        {getTypeIcon(ticket.type)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {getTypeLabel(ticket.type)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {ticket.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {ticket.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                        {ticket.client.firstName[0]}{ticket.client.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {ticket.client.firstName} {ticket.client.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {ticket.client.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    {ticket.consultant ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                                {ticket.consultant.firstName[0]}{ticket.consultant.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {ticket.consultant.firstName} {ticket.consultant.lastName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {ticket.consultant.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400">
                                                            Non assigné
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(ticket.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(ticket.id);
                                                    }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Voir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Tickets; 