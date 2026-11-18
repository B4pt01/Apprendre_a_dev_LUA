import { callout, compare, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const luaC: Lesson[] = [
  lesson({
    id: 'lua-pairs',
    slug: 'pairs-ipairs-next',
    title: 'pairs, ipairs et next',
    summary: 'Les itérateurs génériques du for.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-iter',
    tags: ['pairs', 'next'],
    blocks: [
      p('`for k,v in ipairs(t)` est du sucre pour un itérateur : une fonction, un état, une valeur de contrôle. ipairs suit 1,2,3… jusqu’au nil. pairs s’appuie sur next.'),
      lua(`local t = { "a", "b", c = 3 }
print(next(t))          -- une première clé
print(next(t, next(t))) -- la suivante, ordre non garanti

local list = { 10, 20, 30 }
print(select(1, ipairs(list))) -- la fonction itératrice`),
      callout(
        'diff',
        'Luau generalised iteration',
        'En Luau tu peux écrire `for k,v in t` sans pairs. En FiveM / Lua 5.4 classique, non : il faut pairs/ipairs.',
      ),
    ],
  }),
  lesson({
    id: 'lua-custom-iter',
    slug: 'iterateurs-custom',
    title: 'Itérateurs personnalisés',
    summary: 'Stateless vs closure. Range, filter, values.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-iter',
    tags: ['iterator'],
    blocks: [
      lua(`local function range(from, to)
  local i = from - 1
  return function()
    i = i + 1
    if i <= to then return i end
  end
end
for n in range(3, 6) do print(n) end

local function values(t)
  local i = 0
  return function()
    i = i + 1
    return t[i]
  end
end
for v in values({ "eau", "pain" }) do print(v) end`),
      p('Un itérateur stateless reçoit (état, contrôle) comme ipairs. Plus difficile, plus léger. Pour du gameplay, une closure suffit.'),
    ],
    quiz: [
      q('ci1', 'Un itérateur custom `for x in f()` s’arrête quand f renvoie…', ['false', 'nil', '0'], 1, 'Premier nil = fin du for générique.'),
      q('ci2', 'range(3,6) ci-dessus est…', ['stateless', 'une closure avec upvalue', 'une coroutine OS'], 1, 'i est capturé.'),
    ],
  }),
  lesson({
    id: 'lua-meta-intro',
    slug: 'metatables-intro',
    title: 'Metatables : le levier caché',
    summary: 'setmetatable, getmetatable, et la table de comportements.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-meta',
    tags: ['metatable'],
    blocks: [
      p('Une metatable est une table ordinaire attachée à une autre. Elle décrit quoi faire si une opération n’a pas de sens par défaut : lecture d’une clé absente, addition, tostring…'),
      lua(`local proto = { kind = "item" }
local mt = { __index = proto }
local pomme = setmetatable({ nom = "pomme" }, mt)
print(pomme.nom, pomme.kind)
print(getmetatable(pomme) == mt)`),
      callout(
        'game',
        'Tu t’en sers déjà',
        'Les « objets » Roblox et beaucoup d’objets FiveM (ESX player) exposent des méthodes via __index. Comprendre ça, c’est lire les stacks traces.',
      ),
    ],
  }),
  lesson({
    id: 'lua-index',
    slug: 'index-et-newindex',
    title: '__index et __newindex',
    summary: 'Prototype, defaults, propriétés calculées, gel.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-meta',
    tags: ['__index'],
    blocks: [
      lua(`local defaults = { pv = 100, armure = 0 }
local mt = {
  __index = defaults,
  __newindex = function(t, k, v)
    if k == "pv" and v < 0 then v = 0 end
    rawset(t, k, v)
  end,
}
local p = setmetatable({}, mt)
print(p.pv)
p.pv = -20
print(p.pv)`),
      p('__index peut être une table (délégation) ou une fonction. __newindex ne se déclenche que si la clé est absente : d’où rawset pour vraiment écrire.'),
    ],
    quiz: [
      q('i1', '__newindex se déclenche…', ['à chaque écriture', 'seulement si la clé n’existe pas encore', 'seulement en lecture'], 1, 'Une clé déjà présente s’écrit directement.'),
    ],
  }),
  lesson({
    id: 'lua-metamethods',
    slug: 'metamethods',
    title: 'Metamethods arithmétiques et autres',
    summary: '__add, __tostring, __call, __len, __eq, __lt.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-meta',
    tags: ['__add', '__tostring'],
    blocks: [
      lua(`local Vec = {}
Vec.__index = Vec
function Vec.new(x, y)
  return setmetatable({ x = x, y = y }, Vec)
end
function Vec.__add(a, b)
  return Vec.new(a.x + b.x, a.y + b.y)
end
function Vec.__tostring(v)
  return string.format("(%d, %d)", v.x, v.y)
end
function Vec:mag()
  return math.sqrt(self.x ^ 2 + self.y ^ 2)
end
local a, b = Vec.new(2, 3), Vec.new(5, -1)
print(a + b, a:mag())`),
      ul([
        '__call : rendre une table invocable, style factory.',
        '__len : personnaliser #t (Lua 5.2+).',
        '__eq / __lt / __le : comparaisons. Les deux opérandes doivent partager la metatable pour __eq.',
      ]),
    ],
  }),
  lesson({
    id: 'lua-raw',
    slug: 'rawget-rawset',
    title: 'rawget, rawset, rawequal, rawlen',
    summary: 'Contourner les metamethods, indispensable dans __index.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-meta',
    tags: ['rawget'],
    blocks: [
      lua(`local t = setmetatable({ a = 1 }, {
  __index = function() return "fantôme" end,
})
print(t.b)
print(rawget(t, "b"))
rawset(t, "b", 2)
print(t.b, rawlen(t))`),
      p('Sans rawset dans __newindex, tu récurses à l’infini. En DataStores / serialization, utilise rawget pour éviter d’exécuter du code proxy.'),
    ],
    quiz: [
      q('rw1', 'rawget ignore…', ['les clés number', '__index', 'pairs'], 1, 'Lecture brute.'),
      q('rw2', 'Dans __newindex, écrire avec t[k]=v…', ['est OK', 'récursive souvent', 'supprime la metatable'], 1, 'Réarme __newindex → rawset.'),
    ],
  }),
  lesson({
    id: 'lua-coro-intro',
    slug: 'coroutines-intro',
    title: 'Coroutines : create, resume, yield',
    summary: 'Des threads collaboratifs, pas OS. status, wrap.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-coro',
    tags: ['coroutine'],
    blocks: [
      lua(`local co = coroutine.create(function(start)
  local x = start
  while true do
    x = coroutine.yield(x * 2)
  end
end)
print(coroutine.status(co))
print(coroutine.resume(co, 3))
print(coroutine.resume(co, 5))
print(coroutine.status(co))`),
      p('resume renvoie true + valeurs yieldées, ou false + erreur. wrap() transforme ça en fonction qui relance l’erreur.'),
      compare(
        'Où sont les coroutines',
        'Les moteurs enveloppent souvent ça.',
        [
          {
            label: 'API',
            lua: 'coroutine.*',
            luau: 'task.spawn / task.defer / task.wait (sur coroutines)',
            fivem: 'CreateThread + Wait (scheduler Citizen)',
          },
        ],
      ),
    ],
  }),
  lesson({
    id: 'lua-coro-patterns',
    slug: 'coroutines-patterns',
    title: 'Patterns : producteur et pipeline',
    summary: 'Générer des valeurs à la demande, séquencer des cinématiques.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-coro',
    tags: ['yield'],
    blocks: [
      lua(`local function producer(list)
  return coroutine.wrap(function()
    for i, v in ipairs(list) do
      coroutine.yield(i, v)
    end
  end)
end
local nextItem = producer({ "braquage", "fuite", "clean" })
print(nextItem())
print(nextItem())`),
      callout('game', 'Cinématique', 'Une cutscene Roblox ou une progression de mission FiveM se modèle bien en coroutine : yield jusqu’à ce que le joueur arrive, puis resume. Attention à annuler si le joueur quitte.'),
    ],
    quiz: [
      q('cp1', 'coroutine.wrap renvoie…', ['un thread brut', 'une fonction qui relance les erreurs', 'un userdata Roblox'], 1, 'wrap = resume + error si fail.'),
      q('cp2', 'CreateThread FiveM / task.spawn Luau s’appuient sur…', ['des process OS', 'des coroutines + un scheduler hôte', 'des metatables'], 1, 'Collaboratif, pas preemptif.'),
    ],
  }),
  lesson({
    id: 'lua-require',
    slug: 'require-et-package',
    title: 'require et package',
    summary: 'Un module se charge une fois, puis est mis en cache.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-mod',
    tags: ['require', 'package'],
    blocks: [
      p('require("foo") cherche foo.lua selon package.path, exécute le chunk, met le retour dans package.loaded. Le second require renvoie le cache, sans réexécuter.'),
      lua(`-- simulation du cache
package.loaded.atelier_demo = { ping = function() return "pong" end }
local m = require("atelier_demo")
print(m.ping())
print(package.loaded.atelier_demo == m)`),
      callout(
        'diff',
        'Chez les hôtes',
        'Roblox : pas de require fichier, mais require(ModuleScript). FiveM : require Lua 5.4 dans la ressource, plus @ox_lib/init.lua via fxmanifest. Les chemins package.path ne sont pas ceux de ton PC.',
      ),
    ],
  }),
  lesson({
    id: 'lua-module-style',
    slug: 'styles-de-modules',
    title: 'Styles d’export de modules',
    summary: 'Table de fonctions, module fonction, class module.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-mod',
    tags: ['module'],
    blocks: [
      lua(`-- style table (le plus courant)
local M = {}
function M.clamp(x, a, b)
  if x < a then return a end
  if x > b then return b end
  return x
end
print(M.clamp(12, 0, 10))

-- style singleton
local Inventory = { items = {} }
function Inventory:add(name)
  self.items[#self.items + 1] = name
end
Inventory:add("eau")
print(Inventory.items[1])`),
      p('Évite le module global d’avant 5.1. Un module = un return de table, zéro globale.'),
    ],
    quiz: [
      q('ms1', 'Un module Lua idiomatique…', ['écrit dans _G', 'return une table', 'appelle os.exit'], 1, 'Export explicite.'),
      q('ms2', 'require une 2e fois…', ['réexécute le fichier', 'renvoie le cache package.loaded', 'vide _ENV'], 1, 'Sauf si tu nil le cache.'),
    ],
  }),
  lesson({
    id: 'lua-error',
    slug: 'error-et-assert',
    title: 'error et assert',
    summary: 'Lever, messages, niveaux de stack.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-err',
    tags: ['error', 'assert'],
    blocks: [
      lua(`local function take(gold, amount)
  assert(type(amount) == "number", "amount number attendu")
  if amount > gold then
    error("fonds insuffisants", 2)
  end
  return gold - amount
end
print(take(80, 10))
local ok, err = pcall(take, 5, 10)
print(ok, err)`),
      p('Le second argument de error est le niveau : 1 = ici, 2 = l’appelant. assert(v, msg) équivaut à if not v then error(msg) end et renvoie v si ok.'),
    ],
  }),
  lesson({
    id: 'lua-pcall',
    slug: 'pcall-xpcall',
    title: 'pcall, xpcall, traceback',
    summary: 'Protéger un appel, logger, continuer le serveur.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-err',
    tags: ['pcall'],
    blocks: [
      lua(`local function boom()
  error("kaboom")
end
local ok, a = pcall(boom)
print(ok, a)

local ok2, b = xpcall(boom, function(err)
  return "wrap: " .. tostring(err) .. "\\n" .. debug.traceback()
end)
print(ok2)
print(b)`),
      callout(
        'game',
        'Serveur',
        'Un event FiveM ou un RemoteEvent Roblox ne doit jamais crasher la boucle : pcall autour du handler, log, return. Ne avale pas l’erreur sans la journaliser.',
      ),
    ],
    quiz: [
      q('pc1', 'pcall(fn) si fn error…', ['tue le process', 'renvoie false, message', 'renvoie nil'], 1, 'pcall protège et convertit l’erreur en valeur.'),
    ],
  }),
  lesson({
    id: 'lua-oop-class',
    slug: 'classes-par-tables',
    title: 'Classes par tables',
    summary: 'Le pattern new + __index, standard de l’industrie Lua.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-oop',
    tags: ['oop', 'class'],
    blocks: [
      lua(`local Door = {}
Door.__index = Door

function Door.new(locked)
  return setmetatable({ locked = locked or false }, Door)
end

function Door:lock()
  self.locked = true
end

function Door:tryOpen(hasKey)
  if self.locked and not hasKey then
    return false, "fermée"
  end
  return true, "ouverte"
end

local d = Door.new(true)
print(d:tryOpen(false))
print(d:tryOpen(true))`),
      p('new construit l’instance, __index = Class retrouve les méthodes. self est l’instance. C’est le même schéma que beaucoup de frameworks FiveM et de modules Roblox.'),
    ],
  }),
  lesson({
    id: 'lua-oop-inherit',
    slug: 'heritage-et-mixins',
    title: 'Héritage et mixins',
    summary: 'Chaîner __index, ou copier des fonctions.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-oop',
    tags: ['heritage'],
    blocks: [
      lua(`local Entity = {}
Entity.__index = Entity
function Entity.new(id)
  return setmetatable({ id = id }, Entity)
end
function Entity:desc()
  return "entity#" .. self.id
end

local Vehicle = setmetatable({}, { __index = Entity })
Vehicle.__index = Vehicle
function Vehicle.new(id, plate)
  local self = Entity.new(id)
  self.plate = plate
  return setmetatable(self, Vehicle)
end
function Vehicle:desc()
  return Entity.desc(self) .. " plate " .. self.plate
end
print(Vehicle.new(7, "LUA 404"):desc())`),
      callout('tip', 'Mixins', 'Pour partager Freeze / Log sans héritage profond : copie les fonctions dans la class table. Plus lisible qu’une chaîne de metatables de 6 niveaux.'),
    ],
    quiz: [
      q('ih1', 'Vehicle.__index = Vehicle après héritage…', ['est optionnel cosmétique', 'fait retrouver les méthodes Vehicle', 'casse Entity'], 1, 'Sinon les méthodes restent sur Entity seulement.'),
      q('ih2', 'Un mixin simple…', ['exige 4 metatables', 'copie des fonctions dans la class table', 'utilise goto'], 1, 'Composition > héritage profond.'),
    ],
  }),
  lesson({
    id: 'lua-io',
    slug: 'fichiers-io',
    title: 'Fichiers : io.open',
    summary: 'Lecture / écriture. Dans ce playground, l’I/O disque est limité.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['io'],
    blocks: [
      p('io.open(path, mode) renvoie un handle ou nil+erreur. Modes : r, w, a, rb. Toujours pcall / tester le nil. Ferme avec :close() ou to-be-closed (5.4).'),
      lua(`local f = io.tmpfile and io.tmpfile()
if f then
  f:write("ligne1\\nligne2\\n")
  f:seek("set")
  print(f:read("*a"))
  f:close()
else
  print("pas de tmpfile dans cet hôte — le pattern reste :")
  print("local f, err = io.open(path, 'r')")
  print("if not f then error(err) end")
end`, true, 'io.lua'),
      compare(
        'Fichiers en prod',
        'Les jeux restreignent le disque.',
        [
          {
            label: 'Disque',
            lua: 'io.* complet',
            luau: 'pas d’io fichier joueur ; DataStore / MemoryStore',
            fivem: 'LoadResourceFile / SaveResourceFile, pas n’importe quel path',
          },
        ],
      ),
    ],
  }),
  lesson({
    id: 'lua-math',
    slug: 'bibliotheque-math',
    title: 'Bibliothèque math',
    summary: 'floor, random, trigos, huge. RNG à initialiser.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['math'],
    blocks: [
      lua(`print(math.floor(3.9), math.ceil(3.1), math.abs(-4))
print(math.max(1, 8, 3), math.clamp and math.clamp(5, 0, 3) or "pas clamp natif")
print(math.pi, math.huge)
math.randomseed(os.time() % 100000)
print(math.random(), math.random(1, 6))`),
      callout(
        'diff',
        'clamp / noise',
        'Luau a math.clamp, math.noise. FiveM : math.clamp n’est pas toujours là, ox_lib ou une fonction maison. Ne copie pas math.noise hors Roblox.',
      ),
    ],
  }),
  lesson({
    id: 'lua-os',
    slug: 'bibliotheque-os',
    title: 'Bibliothèque os',
    summary: 'time, date, difftime. execute souvent interdit.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['os.time'],
    blocks: [
      lua(`print(os.time())
print(os.date("%Y-%m-%d %H:%M:%S"))
print(os.difftime(os.time(), os.time() - 60))`),
      p('os.execute, os.remove, os.rename sont des trous de sécu : sandboxés à zéro sur Roblox, souvent coupés ou inutiles sur FiveM. Serve-toi d’os.time pour les cooldowns, pas du clock murale du joueur côté client.'),
    ],
  }),
  lesson({
    id: 'lua-utils',
    slug: 'utilitaires-standard',
    title: 'tonumber, tostring, select, type',
    summary: 'Les fonctions globales que tu utiliseras tous les jours.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['tonumber'],
    blocks: [
      lua(`print(tonumber("42"), tonumber("0xFF"), tonumber("10", 2))
print(tonumber("nope") == nil)
print(tostring(nil), type(print))
print(select("#", 1, nil, 3))
local a, b = table.unpack({ 9, 8 })
print(a, b)`),
      p('tonumber échoue en silence (nil). C’est parfait pour valider un argument d’event : if not tonumber(id) then return end.'),
      lua(`local function asId(v)
  local n = tonumber(v)
  if not n or n % 1 ~= 0 or n <= 0 then return nil end
  return n
end
print(asId("12"), asId("nope"), asId(-3), asId("3.5"))`),
    ],
  }),
  lesson({
    id: 'lua-quiz-final',
    slug: 'quiz-fondations',
    title: 'Quiz de synthèse — fondations',
    summary: 'Valide le langage avant de choisir un track jeu.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-quiz',
    tags: ['quiz'],
    blocks: [
      p('Pas de nouveau concept : seulement des questions. 70 % pour marquer la leçon complète. Ensuite tu peux enchaîner Roblox, FiveM, ou les deux.'),
    ],
    quiz: [
      q('z1', 'Quelle valeur est fausse dans un if ?', ['0', '""', 'nil'], 2, 'Seuls nil et false.'),
      q('z2', 'Les tableaux Lua commencent à…', ['0', '1', 'selon #t'], 1, 'Index 1.'),
      q('z3', '`t:f(x)` équivaut à…', ['t.f(x)', 't.f(t, x)', 'f(t.x)'], 1, 'self est passé implicitement.'),
      q('z4', 'ipairs s’arrête…', ['à la fin de pairs', 'au premier trou nil', 'après 100 éléments'], 1, 'Contrat de séquence.'),
      q('z5', 'pcall sert à…', ['accélérer le GC', 'attraper une error', 'charger un module'], 1, 'Appel protégé.'),
      q('z6', 'Une metatable __index table…', ['interdit la lecture', 'délègue les clés manquantes', 'convertit en JSON'], 1, 'Prototype.'),
      q('z7', 'Luau `continue` dans FiveM…', ['marche toujours', 'est une erreur Lua 5.x', 'vaut break'], 1, 'continue n’existe pas en Lua PUC.'),
      q('z8', '`1 << 3` (Lua 5.3+)…', ['3', '8', '4'], 1, 'Décalage gauche.'),
      q('z9', 'utf8.len vs #s…', ['identiques', '#s = octets, utf8.len = codepoints', 'utf8.len est déprécié'], 1, 'Emoji ≠ 1 octet.'),
      q('z10', 'load() du texte d’un joueur…', ['pratique pour un REPL public', 'une backdoor', 'plus sûr que require'], 1, 'Jamais.'),
      q('z11', 'table.pack("a", nil, "c").n…', ['2', '3', 'nil'], 1, 'n survit aux trous.'),
    ],
  }),
]
