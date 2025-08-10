# 📄 Cahier des charges – Gestion des Tickets

## 🎯 Récap de l’entité

L’entité `Ticket` représente une demande ou un incident client. Elle est créée automatiquement (pas par API), mais peut être **mise à jour par un consultant**.  
Elle est liée à un `client` (obligatoire) et éventuellement à un `consultant` (optionnel). Elle contient également une liste de `messages`.

---

## 🧭 Objectif

Permettre aux consultants de **mettre à jour** les tickets attribués et aux systèmes ou utilisateurs autorisés de **récupérer la liste des tickets** avec des filtres avancés (`clientId`, `consultantId`, `status`, `type`, `search`).

Aucune **création** de ticket ne doit être possible via API.

---

## 🗂 Modèle de données

### Schéma JSON de l’entité `Ticket`

```json
{
  "id": "string (uuid)",
  "title": "string",
  "description": "string",
  "type": "CAR_ACCIDENT | FIRE | THEFT_BURGLARY | WATER_DAMAGE",
  "status": "OPEN | IN_PROGRESS | RESOLVED",
  "specificData": "object (JSON) | null",
  "createdAt": "datetime (ISO 8601)",
  "clientId": "string (uuid)",
  "consultantId": "string (uuid) | null",
  "messages": "array of Message",
  "client": "User",
  "consultant": "User | null"
}
```

### Relations

- `Ticket.client` → `User` (obligatoire)
- `Ticket.consultant` → `User` (optionnelle)
- `Ticket.messages` → `Message[]`

---

## 🧾 Règles métier

1. **Création impossible par API** : tout endpoint de création (`POST`) doit être inexistant ou bloqué par permission backend.
2. Seuls les **consultants** peuvent modifier un ticket.
3. Les tickets ne doivent pas pouvoir changer de client (`clientId` non modifiable).
4. Le champ `type` est immuable après création.
5. Le champ `specificData` peut contenir n’importe quelle structure JSON selon le `type` du ticket.
6. Le champ `status` ne peut évoluer que dans cet ordre logique :
   - `OPEN` → `IN_PROGRESS` → `RESOLVED`
7. La recherche (`search`) porte sur `title` et `description` (contient, insensible à la casse).
8. Le `consultant` ne peut **mettre à jour que les tickets qui lui sont assignés**.
9. Le **client** peut consulter **uniquement ses propres tickets**.

---

## 📡 Routes API

### ✅ `GET /tickets`

#### Auth / Permission

- Consultant (tous les tickets visibles)
- Admin (tous les tickets visibles)
- Client (uniquement ses tickets)

#### Query params

| Paramètre       | Type     | Description                         |
|-----------------|----------|-------------------------------------|
| `clientId`      | string   | Filtrer par ID du client            |
| `consultantId`  | string   | Filtrer par ID du consultant        |
| `status`        | string   | Filtrer par statut                  |
| `type`          | string   | Filtrer par type                    |
| `search`        | string   | Recherche textuelle (title + desc)  |
| `limit`         | number   | Pagination                          |
| `offset`        | number   | Pagination                          |

#### Réponse

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "string",
      "status": "string",
      "specificData": { },
      "createdAt": "string",
      "clientId": "string",
      "consultantId": "string | null"
    }
  ],
  "meta": {
    "total": 120,
    "limit": 20,
    "offset": 0
  }
}
```

#### Side effects

- Aucun.

---

### ✅ `GET /tickets/:id`

#### Auth / Permission

- Consultant : s’il est assigné OU accès global selon rôle.
- Admin : accès total.
- Client : accès uniquement si `ticket.clientId === user.id`.

#### Réponse

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "status": "string",
  "specificData": { },
  "createdAt": "string",
  "clientId": "string",
  "consultantId": "string | null",
  "messages": [ /* messages liés */ ]
}
```

#### Side effects

- Aucun.

---

### 🔄 `PATCH /tickets/:id`

#### Auth / Permission

- Consultant connecté **et** assigné au ticket.

#### Body

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "OPEN | IN_PROGRESS | RESOLVED (optional)",
  "consultantId": "string (optional, uniquement si null à l'origine)",
  "specificData": { }
}
```

#### Side effects

- Historique de modification (log).
- (optionnel) Notification client si `status` passe à `IN_PROGRESS` ou `RESOLVED`.

---

## 🚫 `POST /tickets`

> ❌ **Non autorisé**  
Retour attendu : `403 Forbidden`

#### Side effect

- Journalisation possible d’une tentative bloquée.

---

## ✅ Résumé des permissions

| Rôle        | GET /tickets | GET /tickets/:id | PATCH /tickets/:id | POST /tickets |
|-------------|---------------|------------------|---------------------|----------------|
| Consultant  | ✅ (filtrés)  | ✅ (assignés)     | ✅ (assigné)         | ❌              |
| Admin       | ✅            | ✅               | ✅                  | ❌              |
| Client      | ✅ (own)      | ✅ (own)         | ❌                  | ❌              |