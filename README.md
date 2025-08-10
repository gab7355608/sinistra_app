# Sinistra - Plateforme de Gestion de Sinistres

## Description

Sinistra est une plateforme moderne de gestion de sinistres qui permet aux utilisateurs de déclarer et suivre leurs sinistres (automobile, incendie, dégâts des eaux, vol/cambriolage) via un chatbot intelligent alimenté par Claude AI. Elle permet également l'analyse des dégâts subis par un véhicule grâce à la technologie Custom Vision d'Azure AI.

## Prérequis

- Docker
- Node.js (version 18 ou supérieure)
- PNPM (npm install -g pnpm)

## Structure du projet

- `backend`: Serveur Fastify avec API REST et intégration Claude AI
- `frontend`: Application React avec interface utilisateur moderne
- `shared`: Fichiers partagés (types, DTOs, enums, etc.)

## Installation et lancement

1. **Cloner le repository**

```bash
git clone <repository-url>
cd sinistra
```

2. **Créer les fichiers d'environnement**

Créez un fichier `.env` dans le dossier `backend` et `frontend` avec les variables d'environnement nécessaires.

3. **Installer les dépendances**

```bash
pnpm i
```

4. **Configurer la base de données**

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
cd ..
```

5. **Lancer le projet**

```bash
pnpm run dev
```

Cela lancera simultanément :
- Backend sur http://localhost:3000
- Frontend sur http://localhost:5173

## Services Docker (Optionnel)

Pour lancer les services complémentaires (base de données, email, etc.) :

```bash
docker compose -f ./docker/docker-compose.dev.yml -p sinistra-dev up -d
```

Services disponibles :
- **MySQL**: Base de données principale
- **PHPMyAdmin**: http://localhost:8080 - Interface de gestion de la base de données
- **Mailhog**: http://localhost:8025 - Interface de test d'emails
- **Minio**: http://localhost:9000 - Stockage de fichiers
- **Loki**: http://localhost:3100 - Système de logging
- **Grafana**: http://localhost:3001 - Interface de consultation des logs
- **Redis**: Cache et sessions

## Fonctionnalités

- **Chatbot intelligent** : Déclaration de sinistres guidée par Claude AI
- **Gestion des rôles** : Utilisateurs, consultants, administrateurs
- **Types de sinistres** : 
  - Accidents de voiture
  - Incendies
  - Dégâts des eaux
  - Vol et cambriolage
- **Interface moderne** : Design responsive avec Tailwind CSS
- **API REST** : Documentation automatique avec Swagger

## Architecture

- **Backend** : Fastify + TypeScript + Prisma ORM
- **Frontend** : React + TypeScript + Tailwind CSS
- **Base de données** : MySQL
- **AI** : Claude API pour le chatbot
- **Authentification** : JWT avec refresh tokens

## Développement

### Commandes utiles

```bash
# Développement
pnpm run dev

# Build
pnpm run build

# Tests
pnpm run test

# Prisma
cd backend
pnpm prisma:generate    # Génère les types
pnpm prisma:migrate     # Applique les migrations
pnpm prisma:studio      # Interface graphique
```

### Structure des rôles

- **USER (ROLE_USER)** : Peut créer et consulter ses propres sinistres
- **CONSULTANT (ROLE_CONSULTANT)** : Peut traiter les tickets de sinistres
- **ADMIN (ROLE_ADMIN)** : Accès complet à la plateforme

## Notes de version

### Version 1.0.0

- Première version de Sinistra
- Intégration Claude AI pour le chatbot
- Gestion complète des sinistres
- Interface utilisateur moderne
- Système de rôles et permissions
- API REST documentée

