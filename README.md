# Atelier Lua

Cours interactif en français pour apprendre **Lua 5.x**, puis scripter **Roblox (Luau)** et **FiveM** (95 leçons, quiz, playground).

Progression, quiz et signets sont stockés dans `localStorage` (aucune base de données).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://127.0.0.1:5173](http://127.0.0.1:5173).

Build de production :

```bash
npm run build
npm run preview
```

## Routes

| Chemin | Page |
| --- | --- |
| `/` | Accueil |
| `/parcours` | Carte du cours + progression |
| `/parcours/lua` `/roblox` `/fivem` | Track filtré |
| `/lecon/:slug` | Leçon (extraits exécutables en Lua) |
| `/glossaire` | Termes |
| `/memos` | Cheatsheets |
| `/playground` | REPL Lua (Wasmoon / WebAssembly) |
| `/comparaison` | Lua vs Luau vs FiveM |

Raccourci : `Ctrl+K` (ou `⌘K`) pour la recherche.

## Stack

Vite, React 19, TypeScript, React Router, Wasmoon (VM Lua). Pas de backend.

## Pédagogie

1. Fondations Lua (types, tables, fonctions, metatables, coroutines, modules, I/O).
2. Track Roblox : instances, remotes, DataStores, character, GUI, Tweens, patterns.
3. Track FiveM : fxmanifest, events, natives, NUI, oxmysql, ESX / QBCore, gameplay.

Les extraits Roblox et FiveM ne s’exécutent pas dans le navigateur : ils se copient dans Studio ou dans une ressource.
