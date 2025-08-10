import { useUploadCarPhoto } from '@/api/queries/carPhotoQueries';
import { Button } from '@/components/ui/Button/Button';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { ImageUploadResponse, formatDamageLevel, getHighestDamageLevel } from '@/types';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Camera,
    Car,
    CheckCircle,
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CarPhoto: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<ImageUploadResponse | null>(null);
    const [hasUploaded, setHasUploaded] = useState(false);

    const uploadMutation = useUploadCarPhoto();

    // Auto-upload dès qu'un fichier est sélectionné
    useEffect(() => {
        if (selectedFile && !uploadMutation.isPending && !hasUploaded) {
            setHasUploaded(true);
            uploadMutation.mutate(selectedFile, {
                onSuccess: (data) => {
                    setUploadResult(data);
                    toast.success('Image analysée avec succès !');
                },
                onError: (error) => {
                    console.error('Erreur upload:', error);
                    toast.error('Erreur lors de l\'analyse de l\'image');
                    setHasUploaded(false); // Réinitialiser en cas d'erreur
                }
            });
        }
    }, [selectedFile, uploadMutation.isPending, hasUploaded]);

    const handleFileChange = (file: File | null) => {
        setSelectedFile(file);
        setUploadResult(null);
        setHasUploaded(false); // Réinitialiser le flag pour le nouveau fichier

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadResult(null);
        setHasUploaded(false); // Réinitialiser le flag
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Utilisation de la fonction helper du type partagé
    const formatPredictionLabel = formatDamageLevel;



    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - uniquement si pas de résultat */}
                {!uploadResult && (
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Analyse de Photo de Véhicule
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Sélectionnez une photo de votre véhicule - l'analyse automatique des dommages par IA se lancera immédiatement
                        </p>
                    </div>
                )}

                {/* Affichage conditionnel selon l'état */}
                {uploadResult ? (
                    /* Vue Résultat : Photo à gauche + Stats à droite */
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Analyse Terminée
                                    </h2>
                                    <p className="text-gray-600">Résultats de l'intelligence artificielle</p>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={resetUpload}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Nouvelle photo
                            </Button>
                        </div>

                        {/* Layout 2 colonnes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Photo à gauche */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Photo Analysée
                                    </h3>
                                </div>

                                <div className="rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={previewUrl || ''}
                                        alt="Photo analysée"
                                        className="w-full h-96 object-cover"
                                    />
                                </div>

                                {/* Info fichier sous la photo */}
                                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium">Nom:</span> {uploadResult.fileName}</p>
                                        <p><span className="font-medium">Type:</span> {uploadResult.contentType}</p>
                                        <p><span className="font-medium">Taille:</span> {formatFileSize(uploadResult.size)}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats à droite */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-6"
                            >
                                {/* Diagnostic principal */}
                                {(() => {
                                    const highestDamage = getHighestDamageLevel(uploadResult.predictions);
                                    if (!highestDamage) return null;
                                    
                                    const confidence = Math.round(highestDamage.confidence * 100);
                                    const isHighConfidence = confidence >= 70;
                                    
                                    return (
                                        <div className={`p-6 rounded-xl border-2 ${
                                            highestDamage.level === 'severe' ? 'bg-red-50 border-red-200' :
                                            highestDamage.level === 'moderate' ? 'bg-orange-50 border-orange-200' :
                                            'bg-green-50 border-green-200'
                                        }`}>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                🎯 Diagnostic Principal
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`text-2xl font-bold ${
                                                        highestDamage.level === 'severe' ? 'text-red-700' :
                                                        highestDamage.level === 'moderate' ? 'text-orange-700' :
                                                        'text-green-700'
                                                    }`}>
                                                        {formatPredictionLabel(highestDamage.level)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-3xl font-bold ${
                                                        isHighConfidence ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                        {confidence}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {isHighConfidence ? 'Confiance élevée' : 'Confiance modérée'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Statistiques détaillées */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        Statistiques Détaillées
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Dommage Mineur */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-700">🟢 Petit Dégât</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {Math.round((uploadResult.predictions.minor ?? 0) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round((uploadResult.predictions.minor ?? 0) * 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                    className="bg-green-500 h-3 rounded-full"
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Dommage Modéré */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-700">🟡 Moyen Dégât</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    {Math.round((uploadResult.predictions.moderate ?? 0) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round((uploadResult.predictions.moderate ?? 0) * 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.4 }}
                                                    className="bg-orange-500 h-3 rounded-full"
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Dommage Sévère */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-700">🔴 Gros Dégât</span>
                                                <span className="text-lg font-bold text-red-600">
                                                    {Math.round((uploadResult.predictions.severe ?? 0) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round((uploadResult.predictions.severe ?? 0) * 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="bg-red-500 h-3 rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Distribution visuelle */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-700 mb-3">Distribution globale</div>
                                        <div className="flex w-full h-6 rounded-full overflow-hidden bg-gray-200">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.round((uploadResult.predictions.minor ?? 0) * 100)}%` }}
                                                transition={{ duration: 1.2, delay: 0.6 }}
                                                className="bg-green-500"
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.round((uploadResult.predictions.moderate ?? 0) * 100)}%` }}
                                                transition={{ duration: 1.2, delay: 0.7 }}
                                                className="bg-orange-500"
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.round((uploadResult.predictions.severe ?? 0) * 100)}%` }}
                                                transition={{ duration: 1.2, delay: 0.8 }}
                                                className="bg-red-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    /* Vue Upload : Interface complète */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Upload className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Upload de Photo
                                </h2>
                            </div>

                            <FileUpload
                                label=""
                                accept="image/*"
                                maxSize={10}
                                onFileChange={handleFileChange}
                                value={selectedFile}
                            />

                            {selectedFile && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 space-y-4"
                                >
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Fichier sélectionné</h4>
                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-medium">Nom:</span> {selectedFile.name}</p>
                                            <p><span className="font-medium">Taille:</span> {formatFileSize(selectedFile.size)}</p>
                                            <p><span className="font-medium">Type:</span> {selectedFile.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {uploadMutation.isPending ? (
                                            <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                                                <span className="text-purple-700 font-medium">Analyse automatique en cours...</span>
                                            </div>
                                        ) : (
                                            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center">
                                                <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                                                <span className="text-blue-700 font-medium">Analyse automatique après upload</span>
                                            </div>
                                        )}
                                        <Button
                                            variant="secondary"
                                            onClick={resetUpload}
                                            disabled={uploadMutation.isPending}
                                        >
                                            Réinitialiser
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Preview Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Aperçu
                                </h2>
                            </div>

                            {previewUrl ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative rounded-lg overflow-hidden bg-gray-100"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    {uploadMutation.isPending && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                                <span className="text-gray-700 font-medium">Analyse en cours...</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <Car className="h-12 w-12 mx-auto mb-3" />
                                        <p>Aucune image sélectionnée</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default CarPhoto;
