import { useSendMessage, useStartChat } from '@/api/queries/ticketQueries';
import { ChatRequestDto } from '@shared/dto';
import { MessageSender } from '@shared/enums';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    Send,
    User
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    content: string;
    sender: MessageSender;
    timestamp: Date;
}

const NewClaim: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatUuid, setChatUuid] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasTriedToStart, setHasTriedToStart] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const startChatMutation = useStartChat();
    const sendMessageMutation = useSendMessage();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Démarrer automatiquement la conversation au chargement
        if (!chatUuid && !hasTriedToStart) {
            setHasTriedToStart(true);
            startChatMutation.mutate(undefined, {
                onSuccess: (response) => {
                    setChatUuid(response.chatUuid);
                    setIsCompleted(response.isComplete);
                    
                    // Ajouter le message de bienvenue du bot
                    const welcomeMessage: ChatMessage = {
                        id: Date.now().toString(),
                        content: response.response,
                        sender: MessageSender.CHATBOT,
                        timestamp: new Date(),
                    };
                    setMessages([welcomeMessage]);
                },
                onError: (error) => {
                    console.error('Erreur lors du démarrage du chat:', error);
                    // Ajouter un message d'erreur pour l'utilisateur
                    const errorMessage: ChatMessage = {
                        id: Date.now().toString(),
                        content: "❌ Impossible de démarrer la conversation. Veuillez rafraîchir la page ou réessayer plus tard.",
                        sender: MessageSender.CHATBOT,
                        timestamp: new Date(),
                    };
                    setMessages([errorMessage]);
                }
            });
        }
    }, [chatUuid, hasTriedToStart, startChatMutation]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !chatUuid || sendMessageMutation.isPending) return;

        // Ajouter le message de l'utilisateur
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: MessageSender.CLIENT,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        const chatRequest: ChatRequestDto = {
            chatUuid,
            message: inputMessage,
        };

        // Envoyer le message via l'API
        sendMessageMutation.mutate(chatRequest, {
            onSuccess: (response) => {
                // Ajouter la réponse du bot
                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: response.response,
                    sender: MessageSender.CHATBOT,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
                setIsCompleted(response.isComplete);

                // Si le ticket est complété, afficher un message de succès
                if (response.isComplete) {
                    setTimeout(() => {
                        const successMessage: ChatMessage = {
                            id: (Date.now() + 2).toString(),
                            content: "🎉 Parfait ! Votre déclaration de sinistre a été enregistrée avec succès. Un consultant vous contactera prochainement.",
                            sender: MessageSender.CHATBOT,
                            timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, successMessage]);
                    }, 1000);
                }
            },
            onError: (error) => {
                console.error('Erreur lors de l\'envoi du message:', error);
                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                    sender: MessageSender.CHATBOT,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        });

        setInputMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const resetChat = () => {
        setMessages([]);
        setChatUuid(null);
        setIsCompleted(false);
        setInputMessage('');
        setHasTriedToStart(false);
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Chat Container - Full Height */}
            <div className="flex-1 bg-white flex flex-col">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Assistant Sinistra
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {isCompleted ? 'Déclaration terminée' : 'En ligne - Prêt à vous aider'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={resetChat}
                            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200 text-sm text-purple-700"
                        >
                            Nouvelle conversation
                        </button>
                    </div>
                </div>

                {/* Messages Area - Flexible Height */}
                <div className="flex-1 overflow-y-auto px-[100px] py-6 space-y-6">
                    {/* Loading state */}
                    {startChatMutation.isPending && (
                        <div className="flex justify-center">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                    <span className="text-gray-600">Initialisation de votre conversation...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${message.sender === MessageSender.CLIENT ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[70%] ${message.sender === MessageSender.CLIENT ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`
                                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                                        ${message.sender === MessageSender.CLIENT 
                                            ? 'bg-gradient-purple text-white' 
                                            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                                        }
                                    `}>
                                        {message.sender === MessageSender.CLIENT ? (
                                            <User className="h-5 w-5" />
                                        ) : (
                                            <Bot className="h-5 w-5" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className={`
                                        flex flex-col gap-2 max-w-full
                                    `}>
                                        {/* Sender Name */}
                                        <div className={`
                                            text-xs font-medium text-gray-500
                                            ${message.sender === MessageSender.CLIENT ? 'text-right' : 'text-left'}
                                        `}>
                                            {message.sender === MessageSender.CLIENT ? 'Vous' : 'Assistant Sinistra'}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`
                                            px-4 py-3 rounded-2xl max-w-full
                                            ${message.sender === MessageSender.CLIENT 
                                                ? 'bg-gradient-purple text-white rounded-tr-md' 
                                                : 'bg-gray-100 text-gray-900 rounded-tl-md'
                                            }
                                        `}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                        </div>

                                        {/* Timestamp */}
                                        <div className={`
                                            text-xs text-gray-400 px-1
                                            ${message.sender === MessageSender.CLIENT ? 'text-right' : 'text-left'}
                                        `}>
                                            {message.timestamp.toLocaleTimeString('fr-FR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {sendMessageMutation.isPending && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-4 max-w-[70%]">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="text-xs font-medium text-gray-500">
                                        Assistant Sinistra
                                    </div>
                                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-md">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Fixed at Bottom */}
                <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
                    {/* Input Row */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isCompleted ? "Conversation terminée" : "Tapez votre message..."}
                                disabled={isCompleted || sendMessageMutation.isPending}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isCompleted || sendMessageMutation.isPending}
                            className={`
                                flex-shrink-0 p-3 rounded-xl transition-all min-w-[50px] flex items-center justify-center
                                ${inputMessage.trim() && !isCompleted && !sendMessageMutation.isPending
                                    ? 'bg-gradient-purple text-white hover:opacity-90 shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {sendMessageMutation.isPending ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Success message when completed */}
                    {isCompleted && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Déclaration de sinistre terminée avec succès !</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewClaim; 