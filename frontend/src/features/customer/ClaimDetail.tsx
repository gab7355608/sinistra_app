import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Bot,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    Edit3,
    Eye,
    EyeOff,
    Heart,
    Home,
    Lock,
    MapPin,
    MessageCircle,
    Phone,
    Shield,
    StickyNote,
    User,
    XCircle
} from 'lucide-react';


interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'bot' | 'consultant';
    timestamp: string;
    isInternal?: boolean;
}

interface InternalNote {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    isPrivate: boolean;
}

interface ClaimDetail {
    id: string;
    type: 'automobile' | 'habitation' | 'sante' | 'vie';
    title: string;
    date: string;
    status: 'En cours' | 'Résolu' | 'En attente' | 'Refusé';
    lastUpdate: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    claimNumber: string;
    location: string;
    details: string;

    contact: {
        name: string;
        phone: string;
        email: string;
    };
    chatHistory: ChatMessage[];
    internalNotes?: InternalNote[];
    clientInfo?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

// Données d'exemple étendues
const mockClaimDetails: Record<string, ClaimDetail> = {
    '1': {
        id: '1',
        type: 'automobile',
        title: 'Collision véhicule',
        date: '2024-01-15',
        status: 'En cours',
        lastUpdate: '2024-01-20',
        description: 'Accident avec un autre véhicule au carrefour principal',
        priority: 'high',
        claimNumber: 'SIN-2024-00001',
        location: 'Avenue des Champs-Élysées, 75008 Paris',
        details: 'Collision frontale lors d\'un freinage d\'urgence. Dégâts sur l\'avant du véhicule et pare-chocs. Aucun blessé à déplorer. Constat amiable rempli sur place avec l\'autre conducteur.',
        contact: {
            name: 'Sophie Durand',
            phone: '+33 1 23 45 67 89',
            email: 'sophie.durand@sinistra.fr'
        },
        clientInfo: {
            id: 'client-1',
            firstName: 'Sam',
            lastName: 'Martin',
            email: 'sam.martin@email.com'
        },
        chatHistory: [
            {
                id: '1',
                content: 'Bonjour ! Je souhaite déclarer un sinistre automobile.',
                sender: 'user',
                timestamp: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                content: 'Bonjour Sam ! Je vais vous aider à déclarer votre sinistre automobile. Pouvez-vous me décrire ce qui s\'est passé ?',
                sender: 'bot',
                timestamp: '2024-01-15T10:00:30Z'
            },
            {
                id: '3',
                content: 'J\'ai eu un accident au carrefour des Champs-Élysées. Une collision frontale lors d\'un freinage d\'urgence.',
                sender: 'user',
                timestamp: '2024-01-15T10:01:00Z'
            },
            {
                id: '4',
                content: 'Je comprends, cela doit être stressant. Y a-t-il eu des blessés dans cet accident ?',
                sender: 'bot',
                timestamp: '2024-01-15T10:01:15Z'
            },
            {
                id: '5',
                content: 'Heureusement non, aucun blessé. J\'ai le constat amiable qui a été rempli sur place.',
                sender: 'user',
                timestamp: '2024-01-15T10:01:45Z'
            },
            {
                id: '6',
                content: 'Parfait ! Pouvez-vous uploader le constat amiable et quelques photos des dégâts ? Cela m\'aidera à traiter votre dossier plus rapidement.',
                sender: 'bot',
                timestamp: '2024-01-15T10:02:00Z'
            },
            {
                id: '7',
                content: 'J\'ai uploadé le constat et les photos. Quelles sont les prochaines étapes ?',
                sender: 'user',
                timestamp: '2024-01-15T10:15:00Z'
            },
            {
                id: '8',
                content: 'Merci pour les documents ! J\'ai créé votre dossier sous le numéro SIN-2024-00001. Un expert va être assigné dans les 24h pour évaluer les dégâts. Vous recevrez une notification dès qu\'il aura terminé son expertise.',
                sender: 'bot',
                timestamp: '2024-01-15T10:15:30Z'
            },
            {
                id: '9',
                content: 'Bonjour, j\'ai une question sur l\'avancement de mon dossier.',
                sender: 'user',
                timestamp: '2024-01-18T14:30:00Z'
            },
            {
                id: '10',
                content: 'Bonjour Sam ! Bonne nouvelle, l\'expert a terminé son évaluation. Le devis de réparation s\'élève à 4 500€. Votre dossier est maintenant en cours de validation par notre équipe.',
                sender: 'bot',
                timestamp: '2024-01-18T14:30:45Z'
            },
            {
                id: '11',
                content: 'J\'ai contacté l\'expert automobile. Il passera demain matin pour évaluer les dégâts.',
                sender: 'consultant',
                timestamp: '2024-01-16T14:00:00Z',
                isInternal: true
            },
            {
                id: '12',
                content: 'Parfait ! Nous procédons maintenant à la validation du dossier. Vous serez informé de la suite dans les plus brefs délais.',
                sender: 'consultant',
                timestamp: '2024-01-19T10:00:00Z'
            }
        ],
        internalNotes: [
            {
                id: '1',
                content: 'Client très coopératif. Toutes les pièces justificatives sont fournies. Expertise programmée pour demain.',
                authorId: 'consultant-1',
                authorName: 'Sophie Durand',
                createdAt: '2024-01-15T15:30:00Z',
                isPrivate: false
            },
            {
                id: '2',
                content: 'Expert confirme que les dégâts sont cohérents avec le constat. Aucune trace de fraude. Dossier peut être validé.',
                authorId: 'consultant-1',
                authorName: 'Sophie Durand',
                createdAt: '2024-01-18T16:00:00Z',
                isPrivate: false
            },
            {
                id: '3',
                content: 'ATTENTION: Le client a mentionné des douleurs cervicales lors de notre dernière conversation. À surveiller.',
                authorId: 'consultant-1',
                authorName: 'Sophie Durand',
                createdAt: '2024-01-19T09:00:00Z',
                isPrivate: true
            }
        ]
    }
};

const getClaimIcon = (type: ClaimDetail['type']) => {
    const icons = {
        automobile: <Car className="h-6 w-6" />,
        habitation: <Home className="h-6 w-6" />,
        sante: <Heart className="h-6 w-6" />,
        vie: <Shield className="h-6 w-6" />
    };
    return icons[type];
};

const getStatusConfig = (status: ClaimDetail['status']) => {
    const configs = {
        'En cours': { 
            icon: <Clock className="h-5 w-5" />, 
            color: 'bg-blue-500/10 text-blue-600 border-blue-200',
        },
        'Résolu': { 
            icon: <CheckCircle2 className="h-5 w-5" />, 
            color: 'bg-green-500/10 text-green-600 border-green-200',
        },
        'En attente': { 
            icon: <AlertCircle className="h-5 w-5" />, 
            color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
        },
        'Refusé': { 
            icon: <XCircle className="h-5 w-5" />, 
            color: 'bg-red-500/10 text-red-600 border-red-200',
        }
    };
    return configs[status];
};

const getPriorityColor = (priority: ClaimDetail['priority']) => {
    const colors = {
        high: 'bg-red-500',
        medium: 'bg-yellow-500',
        low: 'bg-green-500'
    };
    return colors[priority];
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};


const getTypeLabel = (type: ClaimDetail['type']) => {
    const labels = {
        automobile: 'Automobile',
        habitation: 'Habitation',
        sante: 'Santé',
        vie: 'Vie'
    };
    return labels[type];
};

const ClaimDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Simule si l'utilisateur est consultant (à remplacer par une vraie vérification du rôle)
    const isConsultant = window.location.pathname.includes('/consultant/');
    
    const [activeTab, setActiveTab] = useState<'messages' | 'notes'>('messages');
    const [claim, setClaim] = useState(id ? mockClaimDetails[id] : null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>(claim?.status || 'En attente');
    const [newNote, setNewNote] = useState('');
    const [isPrivateNote, setIsPrivateNote] = useState(false);
    const [showInternalMessages, setShowInternalMessages] = useState(true);

    if (!claim) {
        return (
            <div className="min-h-screen bg-gray-50 px-8 py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sinistre non trouvé</h1>
                        <button
                            onClick={() => navigate(isConsultant ? '/consultant/tickets' : '/customer/claims')}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            Retour à la liste des {isConsultant ? 'tickets' : 'sinistres'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(claim.status);

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = () => {
        if (claim && newStatus !== claim.status) {
            setClaim({
                ...claim,
                status: newStatus as ClaimDetail['status'],
                lastUpdate: new Date().toISOString().split('T')[0]
            });
        }
        setIsStatusModalOpen(false);
    };

    const handleAddNote = () => {
        if (newNote.trim() && claim) {
            const note: InternalNote = {
                id: Date.now().toString(),
                content: newNote.trim(),
                authorId: 'consultant-1',
                authorName: 'Sophie Durand',
                createdAt: new Date().toISOString(),
                isPrivate: isPrivateNote
            };

            setClaim({
                ...claim,
                internalNotes: [...(claim.internalNotes || []), note]
            });
            setNewNote('');
            setIsPrivateNote(false);
        }
        setIsNoteModalOpen(false);
    };

    const filteredMessages = claim.chatHistory.filter(message => 
        showInternalMessages || !message.isInternal
    );

    const statusOptions = [
        { value: 'En attente', label: 'En attente' },
        { value: 'En cours', label: 'En cours' },
        { value: 'Résolu', label: 'Résolu' },
        { value: 'Refusé', label: 'Refusé' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-8 py-6 h-full">
            <div className="mx-auto max-w-7xl h-full mb-10 pb-8 ">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(isConsultant ? '/consultant/tickets' : '/customer/claims')}
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="w-12 h-12 bg-gradient-purple rounded-2xl flex items-center justify-center shadow-lg text-white">
                                {getClaimIcon(claim.type)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {claim.title}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {getTypeLabel(claim.type)} • {claim.claimNumber}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.color}`}>
                                {statusConfig.icon}
                                <span className="font-medium">{claim.status}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${getPriorityColor(claim.priority)}`}></div>
                            {isConsultant && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsStatusModalOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Changer le statut
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex gap-8 h-full">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-80 flex-shrink-0"
                    >
                        {/* Overview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                {isConsultant ? 'Client' : 'Informations générales'}
                            </h3>
                            <div className="space-y-4">
                                {isConsultant && claim.clientInfo && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gradient-purple rounded-full flex items-center justify-center text-white font-medium">
                                            {claim.clientInfo.firstName[0]}{claim.clientInfo.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {claim.clientInfo.firstName} {claim.clientInfo.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">{claim.clientInfo.email}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Date de déclaration</p>
                                        <p className="font-medium">{formatDate(claim.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Dernière mise à jour</p>
                                        <p className="font-medium">{formatDate(claim.lastUpdate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Lieu</p>
                                        <p className="font-medium">{claim.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                {isConsultant ? 'Gestionnaire' : 'Votre gestionnaire'}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-purple rounded-full flex items-center justify-center text-white font-medium">
                                        {claim.contact.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{claim.contact.name}</p>
                                        <p className="text-sm text-gray-600">Gestionnaire de sinistres</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{claim.contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MessageCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{claim.contact.email}</span>
                                </div>
                            </div>
                            
                            {isConsultant && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-3">Actions rapides</h4>
                                    <div className="space-y-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsNoteModalOpen(true)}
                                            className="w-full flex items-center gap-2"
                                        >
                                            <StickyNote className="h-4 w-4" />
                                            Ajouter une note
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowInternalMessages(!showInternalMessages)}
                                            className="w-full flex items-center gap-2"
                                        >
                                            {showInternalMessages ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            {showInternalMessages ? 'Masquer' : 'Afficher'} messages internes
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden pb-8">
                            {/* Tabs */}
                            <div className="border-b border-gray-100 px-6 py-4">
                                {isConsultant ? (
                                    <div className="flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab('messages')}
                                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                                activeTab === 'messages'
                                                    ? 'border-purple-600 text-purple-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            Messages ({filteredMessages.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('notes')}
                                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                                activeTab === 'notes'
                                                    ? 'border-purple-600 text-purple-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            Notes internes ({claim.internalNotes?.length || 0})
                                        </button>
                                    </div>
                                ) : (
                                    <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                                )}
                            </div>

                            {/* Chat Content */}
                            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                                {activeTab === 'messages' ? (
                                    <div className="flex-1 overflow-y-auto space-y-4 px-2">
                                        {filteredMessages.map((message) => (
                                            <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {message.sender !== 'user' && (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                                                        message.sender === 'bot' ? 'bg-gradient-purple' : 'bg-gray-600'
                                                    }`}>
                                                        {message.sender === 'bot' ? (
                                                            <Bot className="h-4 w-4" />
                                                        ) : (
                                                            <User className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                    message.sender === 'user'
                                                        ? 'bg-gradient-purple text-white'
                                                        : message.isInternal
                                                        ? 'bg-red-50 text-red-900 border border-red-200'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}>
                                                    {message.isInternal && (
                                                        <div className="flex items-center gap-1 text-xs mb-1">
                                                            <Lock className="h-3 w-3" />
                                                            Message interne
                                                        </div>
                                                    )}
                                                    <p className="text-sm">{message.content}</p>
                                                    <p className={`text-xs mt-1 ${
                                                        message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                                                    }`}>
                                                        {formatTimestamp(message.timestamp)}
                                                    </p>
                                                </div>
                                                {message.sender === 'user' && (
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-4">
                                        {claim.internalNotes?.map((note) => (
                                            <div key={note.id} className={`p-4 rounded-lg border ${
                                                note.isPrivate ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{note.authorName}</span>
                                                        {note.isPrivate && (
                                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                                <Lock className="h-3 w-3" />
                                                                Privé
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimestamp(note.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">{note.content}</p>
                                            </div>
                                        ))}
                                        {(!claim.internalNotes || claim.internalNotes.length === 0) && (
                                            <div className="text-center py-8 text-gray-500">
                                                Aucune note interne pour le moment
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals pour les consultants */}
            {isConsultant && (
                <>
                    {/* Modal changement de statut */}
                    <Modal
                        isOpen={isStatusModalOpen}
                        onClose={() => setIsStatusModalOpen(false)}
                        title="Changer le statut du sinistre"
                    >
                        <div className="space-y-4">
                            <SelectInput
                                label="Nouveau statut"
                                value={newStatus}
                                onChange={setNewStatus}
                                options={statusOptions}
                                name="status"
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsStatusModalOpen(false)}
                                >
                                    Annuler
                                </Button>
                                <Button onClick={handleStatusChange}>
                                    Confirmer
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Modal ajout de note */}
                    <Modal
                        isOpen={isNoteModalOpen}
                        onClose={() => setIsNoteModalOpen(false)}
                        title="Ajouter une note interne"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note
                                </label>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    rows={4}
                                    placeholder="Tapez votre note ici..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={isPrivateNote}
                                    onChange={(e) => setIsPrivateNote(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                                    Note privée (visible uniquement par vous)
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsNoteModalOpen(false)}
                                >
                                    Annuler
                                </Button>
                                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                    Ajouter la note
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default ClaimDetail; 