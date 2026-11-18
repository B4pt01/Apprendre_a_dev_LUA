import { callout, compare, h2, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const luaExtra: Lesson[] = [
  lesson({
    id: 'lua-bitwise',
    slug: 'operateurs-bit-a-bit',
    title: 'Opérateurs bit à bit',
    summary: '& | ~ << >> et // : flags, masques, IDs. Divergences Luau / LuaJIT.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-ops',
    tags: ['bits', '&', 'bit32'],
    blocks: [
      p('Lua 5.3+ a des opérateurs bit à bit natifs. Ils travaillent sur des entiers. Avant 5.3 (LuaJIT, vieux FiveM), tu importes bit ou bit32. Luau expose bit32.* sans les opérateurs & |.'),
      lua(`print(0x0F & 0x3)   -- AND : 3
print(1 << 4)       -- 16
print(16 >> 2)      -- 4
print(~0 & 0xFF)    -- 255 sur un octet
print(5 | 2)        -- 7

-- flags d'un item
local BIND_ON_PICKUP, TRADEABLE = 1, 2
local flags = BIND_ON_PICKUP | TRADEABLE
print(flags & TRADEABLE ~= 0)`),
      compare(
        'Bits selon l’hôte',
        'Ne copie pas un snippet bits sans regarder la version.',
        [
          {
            label: 'API',
            lua: '& | ~ << >> (5.3+)',
            luau: 'bit32.band / bor / bnot / lshift',
            fivem: 'opérateurs 5.4, ou bit.* si LuaJIT',
          },
        ],
      ),
      callout(
        'game',
        'Flags',
        'Les collision bits Roblox (CollisionGroup) et les control bits FiveM (DisableControlAction) sont des masques. Pense « est-ce que ce bit est allumé » plutôt que des booléens séparés si tu as 20 flags.',
      ),
    ],
    quiz: [
      q('bw1', '`1 << 3` vaut…', ['3', '8', '4'], 1, 'Décalage gauche = ×2 trois fois → 8.'),
      q('bw2', 'Luau pour un AND bit à bit…', ['a & b', 'bit32.band(a, b)', 'a and b'], 1, 'Luau n’a pas & | ~ au niveau langage.'),
      q('bw3', 'Tester si le flag 2 est dans flags…', ['flags == 2', 'flags & 2 ~= 0', 'flags or 2'], 1, 'Masque AND, puis compare à 0.'),
    ],
  }),
  lesson({
    id: 'lua-goto',
    slug: 'goto-et-labels',
    title: 'goto, labels, et continue maison',
    summary: 'Lua 5.2+ a goto. Utile pour un continue, rarement pour le reste.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-flow',
    tags: ['goto', 'continue'],
    blocks: [
      p('Il n’y a pas de continue en Lua PUC. Le substitut propre est un if. goto ::label:: existe depuis 5.2 ; Luau a continue natif et décourage goto.'),
      lua(`for i = 1, 6 do
  if i % 2 == 0 then goto continue end
  print("impair", i)
  ::continue::
end

local function parse(tokens)
  local i = 1
  ::retry::
  local t = tokens[i]
  if t == "skip" then
    i = i + 1
    goto retry
  end
  return t
end
print(parse({ "skip", "skip", "ok" }))`),
      callout(
        'warn',
        'Lisibilité',
        'Un goto qui saute par-dessus un local est une erreur. En équipe FiveM / Roblox, préfère if / continue Luau. Ce cours te le montre pour lire du code généré ou d’anciens snippets.',
      ),
    ],
    quiz: [
      q('gt1', 'Le continue Luau dans FiveM…', ['marche', 'est une erreur de syntaxe', 'vaut goto'], 1, 'FiveM = Lua 5.x, pas Luau.'),
      q('gt2', 'goto ne peut pas…', ['sauter en avant', 'traverser la portée d’un local', 'porter un label'], 1, 'Les locaux du bloc cible doivent déjà exister.'),
    ],
  }),
  lesson({
    id: 'lua-utf8',
    slug: 'utf8',
    title: 'UTF-8 : # n’est pas len visuelle',
    summary: 'utf8.len, offset, codes. Noms de joueurs, chat, NUI.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['utf8'],
    blocks: [
      p('#s compte des octets. « été » fait plus que 3. utf8 (Lua 5.3+, Luau, FiveM 5.4) compte les codepoints.'),
      lua(`local s = "été"
print("# octets", #s)
print("codepoints", utf8.len(s))
for p, c in utf8.codes(s) do
  print(p, c, utf8.char(c))
end
print(s:sub(1, 1)) -- peut couper un caractère
print(s:sub(1, utf8.offset(s, 2) - 1))`),
      callout(
        'game',
        'Validation',
        'Borne les noms (utf8.len <= 24) plutôt que #s <= 24. Un joueur malin mettra des emoji 4 octets. FiveM chat et Roblox TextBox : filtre les caractères de contrôle.',
      ),
    ],
    quiz: [
      q('u1', '`#"é"` vaut souvent…', ['1', '2 (UTF-8)', '0'], 1, '# compte les octets, pas les glyphes.'),
      q('u2', 'Pour une longueur « humaine »…', ['#s', 'utf8.len(s)', 'tonumber(s)'], 1, 'utf8.len renvoie les codepoints ou nil si invalide.'),
    ],
  }),
  lesson({
    id: 'lua-load',
    slug: 'load-et-environnements',
    title: 'load, _ENV, et pourquoi tu ne load pas le client',
    summary: 'Compiler une chaîne. Sandbox _ENV. Interdit en prod joueur.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['load', '_ENV'],
    blocks: [
      p('load(src) compile un chunk et renvoie une fonction, ou nil+erreur. En 5.2+, chaque chunk a _ENV. Tu peux lui passer une table vide pour sandboxer print/math seulement.'),
      lua(`local fn, err = load("return 2 + 3", "demo")
print(err or fn())

local env = { print = print, x = 10 }
local g = load("print(x + 1)", "sandboxed", "t", env)
g()

local bad, berr = load("os.execute('rm -rf /')", "nope", "t", { print = print })
print("compile", bad ~= nil, berr)
if bad then
  local ok, msg = pcall(bad)
  print("run", ok, msg)
end`),
      callout(
        'warn',
        'Jamais load un string venant d’un joueur',
        'RemoteEvent + load = backdoor. Roblox a loadstring désactivé par défaut (et à laisser ainsi). FiveM : pas de load d’un NUI callback. Les « execute lua » menus cheat s’appuient là-dessus.',
      ),
      compare(
        'loadstring',
        'Le nom a changé.',
        [
          {
            label: 'API',
            lua: 'load / loadstring (5.1)',
            luau: 'loadstring off par défaut',
            fivem: 'load 5.4, à n’utiliser que sur du code à toi',
          },
        ],
      ),
    ],
    quiz: [
      q('ld1', 'load("return 1")() vaut…', ['une fonction', '1', 'nil'], 1, 'load compile, l’appel exécute.'),
      q('ld2', 'Faire load du texte d’un RemoteEvent…', ['pratique', 'une backdoor', 'plus rapide que require'], 1, 'Le client choisit le code.'),
    ],
  }),
  lesson({
    id: 'lua-debug',
    slug: 'bibliotheque-debug',
    title: 'debug : traceback, pas un debugger magique',
    summary: 'debug.traceback dans xpcall. getinfo. À ne pas laisser aux joueurs.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-stdlib',
    tags: ['debug', 'traceback'],
    blocks: [
      lua(`local function inner()
  error("pv négatifs")
end
local function outer()
  inner()
end
local ok, err = xpcall(outer, function(e)
  return tostring(e) .. "\\n" .. debug.traceback(nil, 2)
end)
print(ok)
print(err)

local info = debug.getinfo(outer, "nS")
print(info.name, info.what, info.short_src)`),
      ul([
        'debug.traceback : pile lisible pour tes logs serveur.',
        'debug.getinfo : nom, ligne, source — utile dans un wrapper d’events.',
        'debug.sethook / getupvalue : puissants, lents, dangereux. Roblox les bride. FiveM : ne les expose pas à une NUI.',
      ]),
      callout('tip', 'Prod', 'Log l’erreur + traceback, puis continue. Ne dump pas toute la pile vers le client (fuite de chemins, d’events internes).'),
    ],
    quiz: [
      q('db1', 'Dans xpcall, le traceback se fait…', ['automatiquement toujours', 'dans le handler d’erreur', 'par print'], 1, 'Le 2e argument d’xpcall reçoit l’erreur.'),
      q('db2', 'debug.getupvalue en jeu public…', ['est le bon moyen de sauver un joueur', 'est trop puissant / bridé', 'remplace DataStore'], 1, 'Ça lit l’état privé des closures.'),
    ],
  }),
  lesson({
    id: 'lua-inv-kata',
    slug: 'kata-inventaire-portable',
    title: 'Kata : inventaire portable',
    summary: 'Tables, closures, pcall, metatables — un module que Roblox et FiveM peuvent copier.',
    minutes: 16,
    track: 'lua',
    moduleId: 'lua-quiz',
    tags: ['kata', 'inventaire'],
    blocks: [
      p('Avant les tracks jeux, on assemble. Cet inventaire ne connaît ni Instance ni native : juste Lua. Ensuite tu brancheras un RemoteEvent ou ox_inventory par-dessus.'),
      lua(`local Inv = {}
Inv.__index = Inv

function Inv.new(cap)
  return setmetatable({ cap = cap or 20, slots = {} }, Inv)
end

function Inv:count(id)
  local n = 0
  for _, s in ipairs(self.slots) do
    if s.id == id then n = n + s.qty end
  end
  return n
end

function Inv:add(id, qty)
  assert(type(id) == "string" and qty > 0, "add invalide")
  for _, s in ipairs(self.slots) do
    if s.id == id then
      s.qty = s.qty + qty
      return true
    end
  end
  if #self.slots >= self.cap then return false, "plein" end
  self.slots[#self.slots + 1] = { id = id, qty = qty }
  return true
end

function Inv:remove(id, qty)
  for i, s in ipairs(self.slots) do
    if s.id == id then
      if s.qty < qty then return false, "manque" end
      s.qty = s.qty - qty
      if s.qty == 0 then table.remove(self.slots, i) end
      return true
    end
  end
  return false, "absent"
end

local bag = Inv.new(3)
print(bag:add("bread", 2))
print(bag:add("water", 1))
print(bag:count("bread"))
print(bag:remove("bread", 1))
print(bag:add("ammo", 30), bag:add("phone", 1)) -- 2e : plein`),
      h2('À brancher plus tard'),
      ul([
        'Roblox : le serveur détient Inv, le client affiche un GUI. RemoteEvent "InvAdd" ne dit PAS la qty réelle si le sac est plein : le serveur répond.',
        'FiveM : même table, persistée oxmysql. ESX/QBCore ont déjà un inventaire : wrapping, pas duplication, sauf ressource standalone.',
      ]),
    ],
    quiz: [
      q('k1', 'Pourquoi cap sur #slots et pas sur count total ?', ['c’est faux', 'un slot = une pile (stack)', '# est en octets'], 1, 'Modèle pile unique par id, limité par nombre de piles.'),
      q('k2', 'table.remove au qty 0 évite…', ['les globales', 'un trou dans la séquence', 'pcall'], 1, 'Sinon ipairs s’arrête trop tôt plus tard.'),
    ],
  }),
]
