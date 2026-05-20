# Supabase — Forum, Communauté & Messages privés

L'application utilise **Supabase** (PostgreSQL + Realtime + RLS) comme backend
partagé pour les fonctionnalités sociales :

- Forum (threads + réponses)
- Découverte des autres utilisateurs (Communauté)
- Messages privés temps réel

Sans Supabase configuré, ces 3 pages affichent un message « non activé » mais
le reste de l'app (Markets, Simulateur 1M$, etc.) continue de fonctionner.

## 1. Créer un projet Supabase

1. Va sur https://supabase.com et inscris-toi (gratuit, pas de CB).
2. **New project** → choisis :
   - **Name** : `trading-pro`
   - **Database password** : laisse Supabase générer
   - **Region** : la plus proche (eu-west-1 ou eu-central-1)
3. Attends 1–2 minutes le provisioning.

## 2. Récupérer URL + clé anon

**Project Settings → API** :

- **Project URL** : `https://xxxxxxxx.supabase.co`
- **anon public** key : un long JWT qui commence par `eyJhbG…`

> ⚠️ Ne JAMAIS partager la `service_role` key, seulement la `anon` (publique).

## 3. Exécuter le schéma SQL

**SQL Editor → New query** → colle le contenu de `supabase/schema.sql` →
**Run**. Tu devrais voir « Success. No rows returned. »

Le script :

- Crée les tables `profiles`, `threads`, `replies`, `conversations`, `messages`
- Crée les triggers (compteur de réponses, last_message_at)
- Active Row Level Security avec des policies ouvertes (forum public démo)
- Active Realtime sur les 4 tables (threads, replies, conversations, messages)

## 4. Configurer l'application

Edite `~/.config/trading-pro-app/.env` (Linux) ou l'équivalent sous
Windows / macOS :

```ini
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi…
```

Relance l'application. Le Forum / Communauté / Messages doivent s'activer.

## Comment sont identifiés les utilisateurs ?

Trading Pro garde sa propre auth locale (email/mot de passe + Google OAuth).
Pour le forum, un **`public_id` UUID v4** est généré lors de la création du
compte, stocké localement (`users.public_id`) et synchronisé vers Supabase
(`profiles.id`). C'est cet UUID qui sert d'auteur pour les threads / DMs.

## Sécurité

Comme nous n'utilisons PAS Supabase Auth, les policies RLS acceptent
l'anonyme. C'est suffisant pour un forum démo entre amis, mais il faut
savoir :

- N'importe qui ayant la clé `anon` peut insérer un profil avec un UUID
  arbitraire et poster en se faisant passer pour un autre.
- Pour une vraie prod, il faudrait : (a) activer Supabase Auth et lier
  `profiles.id` à `auth.uid()` via une policy RLS plus stricte, ou (b) faire
  passer les écritures par une Edge Function qui valide un JWT signé par
  Trading Pro.

## Free tier

- **500 MB** de stockage Postgres (largement suffisant pour des milliers de
  threads et messages texte)
- **2 GB** de Realtime egress / mois
- **50 000 MAU** (Monthly Active Users)

Largement assez pour un usage personnel et un petit groupe.
