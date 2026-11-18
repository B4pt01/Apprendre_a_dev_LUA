import { callout, compare, h2, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const luaA: Lesson[] = [
  lesson({
    id: 'lua-welcome',
    slug: 'quest-ce-que-lua',
    title: 'Qu’est-ce que Lua ?',
    summary: 'Pourquoi Lua équipe Roblox, FiveM, et tant de jeux.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-start',
    tags: ['intro', 'langage'],
    blocks: [
      p('Lua (prononce « loua ») est un langage de script né au Brésil en 1993. Il est petit, rapide, et conçu pour être embarqué dans un programme hôte — exactement le cas d’un moteur de jeu.'),
      p('Tu n’installes pas « un monde Lua » : tu écris des scripts que Roblox Studio, le serveur FiveM, ou un autre moteur exécute. Le langage est le même ; les APIs (instances, natives, events) changent.'),
      h2('Ce qui le rend unique'),
      ul([
        'Presque tout est une table : listes, objets, modules, classes.',
        'Les tableaux commencent à l’index 1, pas 0.',
        'nil signifie « absence de valeur » et casse souvent les séquences.',
        'Les fonctions sont des valeurs : tu peux les stocker, les renvoyer, les fermer sur des variables (closures).',
        'Pas de classes natives : l’OOP se construit avec metatables.',
      ]),
      lua(`print("Bienvenue à l'Atelier Lua")
print("Lua" .. " " .. _VERSION)`),
      callout(
        'diff',
        'Roblox vs FiveM',
        'Roblox exécute Luau, un dialecte avec types optionnels et quelques syntaxes en plus. FiveM exécute Lua 5.4 (souvent) côté serveur et un runtime client proche de Lua 5.4 / LuaJIT selon la ressource. Les leçons fondations ici tournent en Lua 5.x dans le navigateur.',
      ),
      compare(
        'Où s’exécute le script',
        'Le langage est commun, l’hôte change.',
        [
          {
            label: 'Hôte',
            lua: 'Interpréteur lua / ce playground',
            luau: 'Roblox Studio / Roblox client',
            fivem: 'FXServer + client GTA',
          },
          {
            label: 'Fichier typique',
            lua: 'script.lua',
            luau: 'ServerScript / LocalScript / ModuleScript',
            fivem: 'client.lua, server.lua, fxmanifest.lua',
          },
        ],
      ),
    ],
    quiz: [
      q('w1', 'Lua a surtout été conçu pour…', ['Remplacer C++', 'Être embarqué dans un programme hôte', 'Compiler vers WebAssembly'], 1, 'C’est un langage d’extension : le moteur (Roblox, FiveM) l’embarque.'),
    ],
  }),
  lesson({
    id: 'lua-versions',
    slug: 'versions-lua-luau-luajit',
    title: 'Versions : 5.1, 5.4, Luau, LuaJIT',
    summary: 'Savoir quelle Lua tu as entre les mains évite 80 % des surprises.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-start',
    tags: ['versions', 'luau', 'luajit'],
    blocks: [
      p('« Lua » n’est pas une seule cible. Les jeux ont figé des versions différentes. Tu dois connaître les écarts, pas les mémoriser par cœur.'),
      h2('Repères'),
      ul([
        'Lua 5.1 : base historique. LuaJIT (utilisé par beaucoup de runtimes GTA / anciens outils) est compatible 5.1 avec des extensions.',
        'Lua 5.2 / 5.3 : bitops natifs, integers 64 bits en 5.3, _ENV.',
        'Lua 5.4 : const, to-be-closed, générational GC. FiveM serveur moderne est proche de 5.4.',
        'Luau : fork Roblox. Types, +=, if expressions, continue, generalised iteration, sandboxing.',
      ]),
      lua(`print(_VERSION)
print(type(1), type(1.5), math.type and math.type(1) or "math.type absent")`),
      callout(
        'warn',
        'Piège fréquent',
        'Un snippet « Luau » avec `continue` ou `+=` plantera dans FiveM. Un snippet FiveM qui utilise `Citizen.CreateThread` n’existe pas dans Roblox. Ce cours marque clairement ce qui est portable.',
      ),
      compare(
        'Syntaxe qui diverge',
        'À retenir avant de copier-coller.',
        [
          {
            label: 'continue',
            lua: 'n’existe pas (goto ou if)',
            luau: 'continue dans les boucles',
            fivem: 'absent (Lua 5.x)',
          },
          {
            label: 'types',
            lua: 'dynamiques seulement',
            luau: 'annotations optionnelles : x: number',
            fivem: 'pas de types natifs (LuaLS possible)',
          },
          {
            label: '+=',
            lua: 'x = x + 1',
            luau: 'x += 1',
            fivem: 'x = x + 1',
          },
        ],
      ),
    ],
    quiz: [
      q('v1', 'Roblox n’exécute pas Lua PUC-Rio pur, mais…', ['LuaJIT 2.1', 'Luau', 'MoonScript'], 1, 'Roblox a son propre dialecte, Luau.'),
    ],
  }),
  lesson({
    id: 'lua-first-script',
    slug: 'premier-script',
    title: 'Premier script : print, commentaires, chunks',
    summary: 'Un fichier Lua est un chunk : une liste d’instructions.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-start',
    tags: ['print', 'commentaires'],
    blocks: [
      p('Un script Lua s’appelle un chunk. Le playground de l’atelier exécute un chunk à chaque clic sur Exécuter. print envoie du texte vers la sortie.'),
      lua(`-- commentaire une ligne
--[[ commentaire
     sur plusieurs lignes ]]

local nom = "B4pt02"
print("Salut", nom) -- print sépare par une tabulation
print("1+1 =", 1 + 1)`),
      h2('Plusieurs valeurs'),
      p('print accepte plusieurs arguments. Ils s’affichent séparés par une tabulation. En jeu, tu logueras plutôt avec des APIs hôte (`print` Roblox, `print` FiveM serveur, ou `lib.print` ox_lib).'),
      lua(`print("pv", 100, "armure", 50)`),
      callout(
        'tip',
        'Habitude pro',
        'Dès le premier script, nomme tes variables en anglais ou français, mais sois cohérent. En studio Roblox et en ressources FiveM, l’anglais technique est la norme (Player, source, entity).',
      ),
    ],
    quiz: [
      q('f1', 'Un fichier .lua est…', ['Une classe', 'Un chunk (suite d’instructions)', 'Un bytecode JVM'], 1, 'Le fichier entier est chargé comme un chunk.'),
    ],
  }),
  lesson({
    id: 'lua-types-overview',
    slug: 'huit-types',
    title: 'Les huit types',
    summary: 'nil, boolean, number, string, table, function, userdata, thread.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-types',
    tags: ['types', 'type()'],
    blocks: [
      p('Lua a très peu de types. type(x) renvoie un nom sous forme de chaîne. En Luau tu auras aussi typeof() pour les instances Roblox.'),
      lua(`local valeurs = { nil, true, 42, "ok", {}, print }
-- nil dans une liste crée un trou : on teste un par un
print(type(true), type(3.14), type("lua"), type({}), type(print))
print(type(coroutine.create(function() end)))`),
      ul([
        'nil : absence. Toute variable non assignée vaut nil.',
        'boolean : true / false. Seuls nil et false sont faux.',
        'number : flottant 64 bits (et integer en 5.3+).',
        'string : immuable, internée.',
        'table : unique structure de données.',
        'function : closure Lua ou C.',
        'userdata : objet opaque du moteur (Instance Roblox, entity FiveM).',
        'thread : coroutine, pas un thread OS.',
      ]),
      compare(
        'type vs typeof',
        'Roblox ajoute typeof pour distinguer les instances.',
        [
          {
            label: 'Une Part',
            lua: 'n’existe pas',
            luau: 'type(part) == "userdata", typeof(part) == "Instance"',
            fivem: 'souvent un number (handle) pas un objet',
          },
        ],
      ),
    ],
    quiz: [
      q('t1', 'En Lua, quelle valeur est considérée comme fausse avec if ?', ['0 et ""', 'seulement nil et false', 'toutes les tables vides'], 1, '0 et "" sont vrais. Seuls nil et false sont faux.'),
    ],
  }),
  lesson({
    id: 'lua-scalars',
    slug: 'nil-boolean-number',
    title: 'nil, boolean, number',
    summary: 'Les scalaires, NaN, integers 5.3+, et le piège du 0 vrai.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-types',
    tags: ['nil', 'number'],
    blocks: [
      p('nil n’est pas 0. Affecter nil à un champ de table le supprime. C’est ainsi qu’on « retire » une clé.'),
      lua(`local vivant = true
local pv = 100
print(vivant and pv > 0)

-- 0 est vrai
if 0 then print("0 passe le if") end
if "" then print("la chaîne vide aussi") end

print(10 / 3)
print(10 // 3) -- division entière (5.3+)
print(10 % 3)`),
      h2('Inf et NaN'),
      lua(`print(1 / 0)      -- inf
print(0 / 0)      -- -nan
print(0 / 0 == 0 / 0) -- false : NaN n’est égal à rien`),
      callout(
        'game',
        'En jeu',
        'Les dégâts, l’argent, les IDs FiveM (source, netId) et les UserId Roblox sont des numbers. Vérifie toujours avec type() et tonumber() quand la valeur vient d’un event : un tricheur enverra une table.',
      ),
    ],
    quiz: [
      q('s1', 'Que vaut `if 0 then ...` en Lua ?', ['Le if est sauté', 'Le if s’exécute', 'Erreur'], 1, '0 est vrai. C’est l’inverse de C, JS, Python.'),
    ],
  }),
  lesson({
    id: 'lua-variables',
    slug: 'variables-local-global',
    title: 'Variables locales et globales',
    summary: 'local par défaut. _G. L’oubli de local est le premier bug.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-types',
    tags: ['local', '_G'],
    blocks: [
      p('Sans local, tu crées (ou écrases) une globale. En jeu, c’est une fuite entre scripts, des courses critiques, et des nuits blanches. Écris local partout, sauf API volontairement globale.'),
      lua(`-- local or = 1 -- erreur : 'or' est un mot réservé
local gold = 50
gold = gold + 10
print(gold)

secret = 1 -- globale, à éviter
print(_G.secret)`),
      h2('_G et _ENV'),
      p('Les globales vivent dans une table d’environnement. En 5.2+, chaque chunk a _ENV. En Luau, les globales sont bridées (sandbox). En FiveM, chaque ressource a son propre environnement : une globale d’une ressource n’existe pas dans l’autre.'),
      callout(
        'warn',
        'Typo silencieuse',
        'goldd = 0 crée une nouvelle globale au lieu de modifier gold. Active un linter (LuaLS) et treat undefined global as error.',
      ),
      compare(
        'Globales',
        'Chaque hôte sandboxe autrement.',
        [
          {
            label: 'Visibilité',
            lua: '_G partagé du process',
            luau: 'sandbox par script + shared modules',
            fivem: 'isolé par ressource',
          },
        ],
      ),
    ],
    quiz: [
      q('g1', 'La bonne habitude :', ['Tout mettre dans _G', 'Préfixer par global.', 'Déclarer local sauf API volontaire'], 2, 'local par défaut.'),
    ],
  }),
  lesson({
    id: 'lua-scope',
    slug: 'portee-et-shadowing',
    title: 'Portée, blocs et shadowing',
    summary: 'La portée d’un local commence après sa déclaration, jusqu’à la fin du bloc.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-types',
    tags: ['scope', 'do'],
    blocks: [
      p('do … end crée un bloc. if, for, while, function créent aussi des blocs. Un local du même nom masque (shadow) celui du dessus.'),
      lua(`local x = 1
do
  local x = 2
  print("intérieur", x)
end
print("extérieur", x)

local a, b = 1, 2
a, b = b, a -- swap sans temporaire
print(a, b)`),
      h2('Déclaration après usage'),
      lua(`print(n) -- nil, pas une erreur
local n = 10
print(n)`),
      callout('tip', 'do end', 'Sers-t’en pour limiter la durée de vie d’une grosse table temporaire, ou pour un local qui ne doit pas fuir.'),
    ],
    quiz: [
      q('sc1', 'Un local déclaré dans un for…', ['existe après le end', 'est local à la boucle', 'est toujours global'], 1, 'Chaque for crée un bloc.'),
      q('sc2', 'a, b = b, a…', ['a besoin d’un temporaire', 'swap atomique grâce aux multi-assign', 'est une erreur'], 1, 'Le côté droit est évalué d’abord.'),
    ],
  }),
  lesson({
    id: 'lua-arith',
    slug: 'operateurs-arithmetiques',
    title: 'Opérateurs arithmétiques',
    summary: '+ - * / // % ^ et la coercition de chaînes numériques.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-ops',
    tags: ['operateurs'],
    blocks: [
      lua(`print(2 + 3, 2 - 3, 2 * 3, 2 / 3)
print(2 // 3, 2 % 3, 2 ^ 10)
print("10" + 1) -- coercition : 11
-- print("10" + "pv") -- erreur`),
      p('^ est la puissance, pas le XOR. Le XOR bit à bit s’écrit ~ en 5.3+ ou bit32.bxor / bit.bxor selon l’hôte.'),
      callout(
        'diff',
        'Bits',
        'Luau fournit bit32. FiveM (Lua 5.4) a les opérateurs & | ~ << >>. LuaJIT a bit.*. N’assume pas un seul module.',
      ),
    ],
    quiz: [
      q('a1', '`2 ^ 3` vaut…', ['1 (xor)', '8 (puissance)', '6'], 1, '^ est l’exposant.'),
    ],
  }),
  lesson({
    id: 'lua-logic',
    slug: 'operateurs-logiques',
    title: 'Comparaisons et logique',
    summary: '== ~= and or not. and/or renvoient une valeur, pas forcément un booléen.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-ops',
    tags: ['and', 'or'],
    blocks: [
      p('C’est LE détail qui rend Lua expressif : and et or court-circuitent et renvoient l’opérande utile. d’où l’idiome `x = x or 10`.'),
      lua(`print(1 == "1") -- false, pas de coercition
print(1 ~= 2)
print(true and 5)  -- 5
print(nil or "défaut")
print(false or 0)  -- 0 (et 0 est vrai plus tard)

local pv = nil
pv = pv or 100
print(pv)`),
      callout(
        'warn',
        'or 0 est dangereux si 0 est valide',
        'Si gold peut valoir 0, `gold = gold or 100` le remet à 100. Utilise `if gold == nil then`.',
      ),
      lua(`local function coalesce(v, fallback)
  if v == nil then return fallback end
  return v
end
print(coalesce(0, 100), coalesce(nil, 100))`),
    ],
    quiz: [
      q('l1', '`nil or 4` vaut…', ['true', '4', 'nil'], 1, 'or renvoie le premier opérande vrai.'),
    ],
  }),
  lesson({
    id: 'lua-misc-ops',
    slug: 'concat-longueur-precedence',
    title: 'Concaténation, # et précédence',
    summary: '.. concatène, # mesure (avec des pièges sur les tables).',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-ops',
    tags: ['concat', '#'],
    blocks: [
      lua(`print("Lua" .. " " .. 5.4)
print(#"abc")
print(#"é") -- selon l’encodage : # compte les octets

local t = { "a", "b", "c" }
print(#t)`),
      p('La précédence : ^ > unaires > * / // % > + - > .. > comparaisons > not > and > or. En cas de doute, parenthèse.'),
      lua(`print(1 + 2 .. 3) -- "33" ? Non : (1+2)..3 => "33"
print(2 ^ 3 ^ 2) -- 512, associatif à droite`),
    ],
    quiz: [
      q('mo1', '`#"abc"` vaut…', ['2', '3', '4'], 1, '# sur une string = octets.'),
      q('mo2', '`..` concatène…', ['seulement des tables', 'des strings (et numbers coercés)', 'des fonctions'], 1, 'number est converti, table non.'),
    ],
  }),
  lesson({
    id: 'lua-string-lit',
    slug: 'litteraux-chaines',
    title: 'Littéraux de chaînes',
    summary: 'Guillemets, long strings [[ ]], échappements.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-strings',
    tags: ['string'],
    blocks: [
      lua(`local a = "bonjour\\nmonde"
local b = 'FiveM \\'natives\\''
local json = [[
{ "job": "police", "grade": 2 }
]]
print(a)
print(b)
print(json)`),
      p('Les long strings [[ ]] ne interprètent pas les échappements. Idéal pour du HTML NUI, des SQL, des ASCII art. Niveau d’égalité : [=[ ... ]=] si le texte contient ]].'),
      callout('game', 'NUI FiveM', 'Le HTML d’une NUI est souvent dans des fichiers séparés. En Lua tu envoies des JSON via SendNUIMessage, pas le HTML lui-même.'),
    ],
  }),
  lesson({
    id: 'lua-string-fmt',
    slug: 'formatage-chaines',
    title: 'Formatage et concaténation',
    summary: 'string.format, tostring, table.concat pour les listes.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-strings',
    tags: ['format'],
    blocks: [
      lua(`local nom, pv = "Ada", 87
print(string.format("%s a %d PV", nom, pv))
print(tostring(true), tostring({}))

local parts = { "pistol", "ammo", "12" }
print(table.concat(parts, ":"))`),
      callout(
        'diff',
        'Interpolation',
        'Luau a `string.format` et parfois des bibliothèques. Pas de `${}` natif comme JS. FiveM : même chose, ou ox_lib string helpers.',
      ),
    ],
  }),
  lesson({
    id: 'lua-patterns',
    slug: 'patterns-lua',
    title: 'Patterns Lua (ce n’est pas du regex)',
    summary: 'magic characters, captures, string.match / gsub / gmatch.',
    minutes: 14,
    track: 'lua',
    moduleId: 'lua-strings',
    tags: ['patterns', 'match'],
    blocks: [
      p('Lua n’embarque pas PCRE. Ses patterns sont plus simples et plus sûrs (pas de ReDoS classique). `%d` = digit, `%a` = lettre, `%w` alphanum, `.` n’importe, `+` `*` `-` `?` quantifiers, `()` captures.'),
      lua(`local log = "[police] Ada a arrêté #42"
print(string.match(log, "%[(%w+)%]"))
print(string.match(log, "#(%d+)"))

local s = "pv=10;armure=3"
for k, v in string.gmatch(s, "(%w+)=(%d+)") do
  print(k, v)
end

print((string.gsub("***secret***", "%*", "")))`),
      h2('Magic à échapper'),
      p('^ $ ( ) % . [ ] * + - ? sont magiques. Pour un point littéral : `%.` Pas de `\\.`.'),
      callout('warn', 'FiveM identifiers', 'Un identifiant licence ou un nom steam contient souvent `:`. Escape tes patterns ou utilise string.find avec plain=true.'),
    ],
    quiz: [
      q('p1', 'Pour matcher un point littéral on écrit…', ['\\.', '%.', '[.] uniquement'], 1, '% est l’escape des patterns Lua.'),
    ],
  }),
  lesson({
    id: 'lua-string-lib',
    slug: 'bibliotheque-string',
    title: 'Bibliothèque string',
    summary: 'sub, len, lower/upper, reverse, rep, byte/char, pack.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-strings',
    tags: ['string.sub'],
    blocks: [
      lua(`local s = "AtelierLua"
print(s:sub(1, 7), s:sub(-3))
print(s:lower(), #s, s:rep(2))
print(string.byte("ABC", 1, 3))
print(string.char(76, 117, 97)) -- Lua`),
      p('Les méthodes `s:sub()` sont du sucre pour `string.sub(s, ...)`. Ça marche parce que les chaînes ont une metatable interne.'),
      callout(
        'diff',
        'UTF-8',
        'Lua 5.3+ a utf8.len / utf8.codes. Luau a utf8 aussi. #s reste en octets : "é" peut valoir 2. FiveM chat : pense UTF-8.',
      ),
    ],
    quiz: [
      q('sl1', '`s:sub(1, 3)` équivaut à…', ['string.sub(s, 1, 3)', 's[1][2][3]', 'string.split(s, 3)'], 0, 'Les strings ont une metatable avec __index = string.'),
      q('sl2', 'Les index négatifs de sub…', ['plantent', 'comptent depuis la fin', 'valent 0'], 1, 'sub(-3) = les 3 derniers octets.'),
    ],
  }),
]
