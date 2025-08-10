# Pages Client - Interface Utilisateur

## 🎯 Objectif UX

Design épuré et rassurant pour l'utilisateur avec :
- **Simplicité** : peu d'éléments, clarté maximale
- **Professionnalisme** : typographie sobre, palette de couleurs neutres et rassurantes
- **Rapidité** : navigation fluide, chatbot réactif, accès direct aux informations utiles

## ��️ Architecture

### Navigation Unifiée
- `Sidebar.tsx` : Navigation unique qui s'adapte selon le rôle utilisateur (admin/client)
- **Routes intégrées** : Toutes les routes sont gérées dans `AppRoutes.tsx`

### Pages Disponibles

#### 1. **Mes sinistres** (`Claims.tsx`)
- **Route** : `/customer/claims`
- **Fonctionnalités** :
  - Liste des sinistres sous forme de cards
  - Recherche par titre/description
  - Filtres par statut (En cours, Résolu, En attente, Refusé)
  - Affichage des informations : type, date, statut, dernière mise à jour
  - Actions : voir les détails

#### 2. **Déclarer un sinistre** (`NewClaim.tsx`)
- **Route** : `/customer/new-claim`
- **Fonctionnalités** :
  - Interface chatbot interactive
  - Upload de fichiers (photos, documents)
  - Prévisualisation des pièces jointes
  - Indicateur de frappe du bot
  - Messages temps réel

#### 3. **Profil** (`Profile.tsx`)
- **Route** : `/customer/profile`
- **Fonctionnalités** :
  - Formulaire de mise à jour des données personnelles
  - Gestion du changement de mot de passe
  - Validation des champs
  - Mode édition/lecture
  - Messages de succès/erreur

## 🎨 Composants Utilisés

### UI Components
- `Button` : Boutons avec variantes et animations
- `Input` : Champs de saisie avec validation
- `Badge` : Indicateurs de statut
- `SearchBar` : Barre de recherche avec filtres
- `Card` : Containers pour l'affichage des données

### Animations
- **Framer Motion** : Animations fluides pour les transitions
- **Stagger animations** : Animation échelonnée pour les listes
- **Hover effects** : Effets au survol pour l'interactivité

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Primary** : Bleu professionnel (#3b82f6)
- **Secondary** : Gris neutre (#64748b)
- **Success** : Vert (#22c55e)
- **Danger** : Rouge (#ef4444)
- **Warning** : Orange (#f59e0b)

### Utilisation
```tsx
// Exemples d'utilisation des couleurs
className="bg-primary-50 text-primary-600"    // Fond bleu clair, texte bleu
className="bg-secondary-100 text-secondary-900" // Fond gris clair, texte gris foncé
```

## 🚀 Utilisation

### 1. Sidebar Unifiée
```tsx
import Sidebar from '@/components/layout/Sidebar';

// Pour les clients
<Sidebar userRole="customer" />

// Pour les admins
<Sidebar userRole="admin" />
```

### 2. Routes Intégrées
Toutes les routes sont gérées dans `AppRoutes.tsx` :

```tsx
// Routes client
<Route path="/customer/claims" element={<Claims />} />
<Route path="/customer/new-claim" element={<NewClaim />} />
<Route path="/customer/profile" element={<CustomerProfile />} />

// Routes admin
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/users" element={<Users />} />
```

### 3. Import des Composants
```tsx
import { 
  Claims, 
  NewClaim, 
  Profile 
} from '@/features/customer';
```

### 4. Navigation Automatique
La sidebar s'adapte automatiquement selon le rôle :
- **Clients** : Mes sinistres, Déclarer un sinistre, Profil, Déconnexion
- **Admins** : Dashboard, Utilisateurs, Chatbot, Statistiques, Paramètres, Déconnexion

## 📱 Responsive Design

- **Mobile First** : Design adaptatif pour tous les écrans
- **Sidebar** : Collapsible avec animations fluides
- **Grid Layout** : Adaptation automatique des colonnes
- **Touch Friendly** : Boutons et interactions adaptés au tactile

## 🔧 Personnalisation

### Modification des Couleurs
Éditez `tailwind.config.js` pour personnaliser la palette :

```js
colors: {
  primary: {
    // Vos couleurs primaires
  },
  secondary: {
    // Vos couleurs secondaires
  }
}
```

### Ajout de Pages
1. Créez votre composant dans `/features/customer/`
2. Ajoutez l'export dans `index.ts`
3. Intégrez la route dans `AppRoutes.tsx`
4. Ajoutez l'entrée dans la sidebar si nécessaire

### Gestion des Rôles
Modifiez la logique dans `AppRoutes.tsx` :

```tsx
const [userRole] = useState<'admin' | 'customer'>('customer');

// Ou avec logique dynamique
const getUserRole = (): 'admin' | 'customer' => {
  // Vérifiez le token, store auth, etc.
  return user.role;
};
```

## 🔐 Sécurité

- Validation côté client pour tous les formulaires
- Gestion des erreurs avec messages utilisateur
- Protection des routes avec `PrivateRoutes`
- Masquage des mots de passe avec toggle visibilité

## 📊 Performance

- **Lazy Loading** : Chargement différé des composants
- **Optimizations** : Animations optimisées avec Framer Motion
- **Memoization** : React.memo pour les composants statiques
- **Debouncing** : Recherche avec délai pour limiter les requêtes

## 🧪 Tests

Structure recommandée pour les tests :
```
/tests/
  /customer/
    Claims.test.tsx
    NewClaim.test.tsx
    Profile.test.tsx
  /layout/
    Sidebar.test.tsx
```

## 🎭 Accessibilité

- **Semantic HTML** : Utilisation des balises appropriées
- **Keyboard Navigation** : Navigation au clavier
- **Screen Reader** : Labels et descriptions
- **Color Contrast** : Respect des standards WCAG
- **Focus Management** : Gestion du focus utilisateur

## 🔄 Migration

### Changements Majeurs
- **Sidebar unifiée** : Plus de `CustomerSidebar` séparé
- **Routes intégrées** : Plus de `CustomerRoutes` séparé
- **Layout simplifié** : Plus de `CustomerLayout` nécessaire

### Avantages
- **Maintenance simplifiée** : Un seul composant sidebar à maintenir
- **Consistance** : Design unifié entre admin et client
- **Performance** : Moins de code dupliqué
- **Flexibilité** : Facile d'ajouter de nouveaux rôles 