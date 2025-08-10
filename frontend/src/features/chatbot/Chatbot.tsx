import { useSendMessage, useStartChat } from '@/api/queries/ticketQueries';
import { ChatRequestDto } from '@shared/dto';
import { MessageSender } from '@shared/enums';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatUuid, setChatUuid] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasTriedToStart, setHasTriedToStart] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const startChatMutation = useStartChat();
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 100; // pixels from bottom
      const nearBottom = scrollHeight - scrollTop - clientHeight < threshold;
      
      setIsNearBottom(nearBottom);
      setShowScrollButton(!nearBottom && messages.length > 3);
    }
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  useEffect(() => {
    // Only auto-scroll if user is near bottom or it's a new conversation
    if (isNearBottom || messages.length <= 1) {
      setTimeout(() => scrollToBottom(), 100);
    }
    checkScrollPosition();
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
  }, [chatUuid, hasTriedToStart]);

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
      onError: () => {
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
    setIsNearBottom(true);
    setShowScrollButton(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-semibold">Assistant Sinistres</h1>
              <p className="text-blue-100 text-sm">
                {isCompleted ? 'Déclaration terminée' : 'En ligne - Prêt à vous aider'}
              </p>
            </div>
          </div>
          <button
            onClick={resetChat}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-sm"
          >
            Nouvelle conversation
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 relative"
      >
        {startChatMutation.isPending && (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Initialisation du chat...</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === MessageSender.CLIENT ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === MessageSender.CLIENT
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.sender === MessageSender.CLIENT ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border max-w-xs">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-500 text-xs ml-2">En train d'écrire...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="sticky bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={() => scrollToBottom()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-xs">Aller en bas</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isCompleted ? "Conversation terminée" : "Tapez votre message..."}
              disabled={isCompleted || sendMessageMutation.isPending}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '50px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isCompleted || sendMessageMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[80px]"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
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
  );
};

export default Chatbot;
