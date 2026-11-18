import { callout, h2, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const luaB: Lesson[] = [
  lesson({
    id: 'lua-if',
    slug: 'conditions-if',
    title: 'if / elseif / else',
    summary: 'then et end sont obligatoires. Pas de switch natif.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-flow',
    tags: ['if'],
    blocks: [
      lua(`local grade = 3
if grade >= 4 then
  print("boss")
elseif grade >= 2 then
  print("officier")
else
  print("recrue")
end`),
      p('Il n’y a pas de switch. On enchaîne elseif, ou on utilise une table de fonctions indexée par une chaîne (plus propre pour les commandes).'),
      lua(`local commandes = {
  heal = function() print("soin") end,
  kick = function() print("expulsion") end,
}
local cmd = "heal"
local fn = commandes[cmd]
if fn then fn() else print("inconnue") end`),
      callout('diff', 'Luau if expression', 'Luau permet `local x = if cond then a else b`. En Lua / FiveM tu écris `cond and a or b` en faisant attention au cas où a est faux.'),
    ],
  }),
  lesson({
    id: 'lua-loops',
    slug: 'while-et-repeat',
    title: 'while et repeat until',
    summary: 'repeat teste après le corps : il tourne au moins une fois.',
    minutes: 8,
    track: 'lua',
    moduleId: 'lua-flow',
    tags: ['while', 'repeat'],
    blocks: [
      lua(`local i = 3
while i > 0 do
  print("while", i)
  i = i - 1
end

local n = 0
repeat
  n = n + 1
  print("repeat", n)
until n >= 3`),
      p('break sort de la boucle la plus proche. Il n’y a pas de continue en Lua 5.x : utilise un if, ou goto ::continue:: dans 5.2+ (à éviter en code d’équipe).'),
      callout('game', 'FiveM Wait', 'Une boucle while true do ... Wait(0) end est le heartbeat client. Oublier Wait gèle le jeu. Roblox utilise Heartbeat:Connect ou task.wait().'),
    ],
  }),
  lesson({
    id: 'lua-for',
    slug: 'for-numerique-et-generique',
    title: 'for numérique et for générique',
    summary: 'Deux for distincts. La variable de boucle est locale au for.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-flow',
    tags: ['for'],
    blocks: [
      lua(`for i = 1, 5 do print("i", i) end
for i = 10, 0, -2 do print("down", i) end

local inventaire = { "eau", "pain", "bandage" }
for i, item in ipairs(inventaire) do
  print(i, item)
end

local jobs = { police = true, ambulance = true }
for nom in pairs(jobs) do
  print("job", nom)
end`),
      callout(
        'warn',
        'pairs n’est pas ordonné',
        'L’ordre des clés dans pairs n’est pas garanti. Trie avec table.sort sur une liste de clés si tu affiches un menu.',
      ),
    ],
    quiz: [
      q('for1', 'La variable i du for numérique…', ['est globale', 'est locale à la boucle', 'persiste après le end'], 1, 'Chaque for crée ses locaux.'),
    ],
  }),
  lesson({
    id: 'lua-tables-intro',
    slug: 'tables-introduction',
    title: 'Tout est table',
    summary: 'Tableau, dictionnaire, objet, module : une seule structure.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-tables',
    tags: ['table'],
    blocks: [
      p('Une table a une partie tableau (clés 1..n) et une partie hash (autres clés). Les deux cohabitent. C’est la force et la source des bugs de #.'),
      lua(`local joueur = {
  "premier champ anonyme", -- index 1
  nom = "Ada",
  pv = 100,
}
print(joueur[1], joueur.nom, joueur["pv"])
joueur.job = "police"
print(joueur.job)`),
      ul([
        't.nom est du sucre pour t["nom"] si nom est un identifiant valide.',
        't[1] n’est pas t["1"].',
        'La constante nil comme valeur d’un champ le supprime.',
      ]),
    ],
  }),
  lesson({
    id: 'lua-arrays',
    slug: 'tables-sequences',
    title: 'Séquences (arrays)',
    summary: 'Index 1, holes, insertion en fin.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-tables',
    tags: ['array', 'ipairs'],
    blocks: [
      p('Une séquence est une table dont les clés sont 1, 2, …, n sans trou. #t et ipairs s’appuient là-dessus.'),
      lua(`local queue = {}
queue[#queue + 1] = "Ada"
table.insert(queue, "Bob")
print(#queue, queue[1])

table.remove(queue, 1) -- décale le reste
print(queue[1], #queue)

local scores = { 10, 20, 30 }
print(table.concat(scores, " / "))`),
      callout(
        'game',
        'Inventaire',
        'Un inventaire FiveM / Roblox est souvent une séquence d’items { name, count, metadata }. Évite les trous : nil au milieu casse #t.',
      ),
    ],
  }),
  lesson({
    id: 'lua-maps',
    slug: 'tables-dictionnaires',
    title: 'Dictionnaires (maps)',
    summary: 'Clés string, number, même table. Compter avec une boucle.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-tables',
    tags: ['map', 'pairs'],
    blocks: [
      lua(`local grades = { recrue = 0, officier = 2, boss = 4 }
print(grades.officier)

local byId = {}
byId[12] = { nom = "Ada" }
byId[12].nom = "Ada Lovelace"
print(byId[12].nom)

local n = 0
for _ in pairs(grades) do n = n + 1 end
print("taille hash", n)`),
      p('# ne compte pas les clés non séquentielles. #grades peut valoir 0.'),
      lua(`local t = { a = 1, b = 2 }
print("#t", #t)`),
    ],
    quiz: [
      q('m1', '`#{a=1,b=2}` vaut en pratique…', ['2', 'souvent 0', 'erreur'], 1, '# ignore la partie hash.'),
    ],
  }),
  lesson({
    id: 'lua-table-lib',
    slug: 'bibliotheque-table',
    title: 'Bibliothèque table',
    summary: 'insert, remove, sort, concat, move, pack/unpack.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-tables',
    tags: ['table.sort'],
    blocks: [
      lua(`local items = { { n = "eau", p = 2 }, { n = "rifle", p = 50 }, { n = "pain", p = 1 } }
table.sort(items, function(a, b) return a.p < b.p end)
for i, it in ipairs(items) do print(i, it.n, it.p) end

local a = { 1, 2, 3, 4 }
table.move(a, 2, 4, 1) -- 5.3+ / Luau / 5.4
print(table.concat(a, ","))`),
      h2('pack et unpack'),
      lua(`local function dump(...)
  local t = table.pack(...)
  print("n=", t.n)
  for i = 1, t.n do print(i, t[i]) end
end
dump("a", nil, "c")

print(table.concat({ table.unpack({ "x", "y", "z" }) }, "-"))`),
      callout('diff', 'unpack', 'Lua 5.1 / LuaJIT : unpack global. 5.2+ : table.unpack. Luau : table.unpack et unpack. FiveM 5.4 : table.unpack.'),
    ],
  }),
  lesson({
    id: 'lua-table-pitfalls',
    slug: 'pieges-des-tables',
    title: 'Pièges : #, trous, ipairs vs pairs',
    summary: 'Le contrat de séquence, et pourquoi JSON null fait mal.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-tables',
    tags: ['holes', 'ipairs'],
    blocks: [
      lua(`local t = { 10, 20, nil, 40 }
print("#t peut surprendre:", #t)
print("--- ipairs ---")
for i, v in ipairs(t) do print(i, v) end
print("--- pairs ---")
for k, v in pairs(t) do print(k, v) end`),
      p('ipairs s’arrête au premier nil. pairs visite tout, sans ordre. Si tu reçois un JSON array avec un null, json.decode peut créer un trou.'),
      callout(
        'warn',
        'Ne mélange pas',
        'Une table { 1, 2, nom = "x" } est valide mais # et ipairs ne voient que 1,2. Documente : « ceci est une liste » ou « ceci est un record ».',
      ),
      lua(`local function len(t)
  local n = 0
  for _ in pairs(t) do n = n + 1 end
  return n
end
print(len({ a = 1, b = 2, 10 }))`),
    ],
  }),
  lesson({
    id: 'lua-fn-basics',
    slug: 'fonctions-bases',
    title: 'Fonctions : déclaration et return',
    summary: 'Les fonctions sont des valeurs. syntaxe locale vs globale.',
    minutes: 9,
    track: 'lua',
    moduleId: 'lua-fn',
    tags: ['function'],
    blocks: [
      lua(`local function add(a, b)
  return a + b
end
print(add(2, 5))

local mul = function(a, b) return a * b end
print(mul(3, 4))

local function fact(n)
  if n <= 1 then return 1 end
  return n * fact(n - 1)
end
print(fact(5))`),
      p('`local function f()` est visible dans son propre corps (récursion). `local f = function()` ne l’est pas, sauf déclaration préalable `local f`.'),
    ],
  }),
  lesson({
    id: 'lua-fn-multi',
    slug: 'retours-multiples',
    title: 'Retours multiples',
    summary: 'Lua peut renvoyer plusieurs valeurs. Les extra sont jetées, les manquantes valent nil.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-fn',
    tags: ['return'],
    blocks: [
      lua(`local function splitName(full)
  local prenom, nom = full:match("^(%S+)%s+(.+)$")
  return prenom, nom
end
local p, n = splitName("Ada Lovelace")
print(p, n)

local function coords()
  return 1, 2, 3
end
local x, y = coords() -- z jeté
print(x, y)

print(select("#", coords()))
print((coords())) -- parenthèses : une seule valeur`),
      callout(
        'game',
        'pcall et remotes',
        'pcall renvoie ok, err_ou_valeurs. RemoteFunction Roblox et lib.callback FiveM riment avec ça : toujours valider le nombre et le type des retours.',
      ),
    ],
    quiz: [
      q('rm1', '`(coords())` avec 3 retours…', ['garde les 3', 'n’en garde qu’un', 'erreur'], 1, 'Les parenthèses ajustent à 1 valeur.'),
    ],
  }),
  lesson({
    id: 'lua-methods',
    slug: 'point-vs-deux-points',
    title: 'Point vs deux-points : méthodes',
    summary: 't:f() passe t comme premier argument self.',
    minutes: 10,
    track: 'lua',
    moduleId: 'lua-fn',
    tags: ['self', 'methodes'],
    blocks: [
      lua(`local arme = { nom = "pistol", mun = 12 }
function arme:tirer()
  if self.mun <= 0 then
    print("clic")
    return
  end
  self.mun = self.mun - 1
  print(self.nom, "reste", self.mun)
end
arme:tirer()
arme.tirer(arme) -- équivalent`),
      p('Oublier les deux-points est le bug n°1 des débutants OOP : self devient le premier vrai argument, souvent une string, et tout explose.'),
      callout('diff', 'Roblox', 'part:Destroy() est la même règle. En FiveM, beaucoup d’APIs sont des fonctions globales (GetEntityCoords(ped)) plutôt que des méthodes.'),
    ],
  }),
  lesson({
    id: 'lua-closures',
    slug: 'closures-et-upvalues',
    title: 'Closures et upvalues',
    summary: 'Une fonction capture les locaux de son créateur. C’est l’état privé.',
    minutes: 12,
    track: 'lua',
    moduleId: 'lua-fn',
    tags: ['closure', 'upvalue'],
    blocks: [
      lua(`local function compteur(depart)
  local n = depart
  return function()
    n = n + 1
    return n
  end
end
local c1, c2 = compteur(0), compteur(100)
print(c1(), c1(), c2())`),
      p('Chaque appel à compteur crée sa propre upvalue n. C’est ainsi qu’on fait des factories, des middlewares d’events, des rate-limiters.'),
      lua(`local function once(fn)
  local done = false
  return function(...)
    if done then return end
    done = true
    return fn(...)
  end
end
local hello = once(function() print("une seule fois") end)
hello(); hello()`),
      callout('game', 'Mémoire', 'Une closure qui capture un joueur Roblox ou un player FiveM peut retenir l’objet après le leave. Nil la référence, Disconnect les connections, release les callbacks.'),
    ],
  }),
  lesson({
    id: 'lua-varargs',
    slug: 'varargs',
    title: 'Varargs : ...',
    summary: 'select, table.pack, transmission des arguments.',
    minutes: 11,
    track: 'lua',
    moduleId: 'lua-fn',
    tags: ['varargs', 'select'],
    blocks: [
      lua(`local function log(tag, ...)
  print("[" .. tag .. "]", ...)
end
log("INV", "ajout", "eau", 2)

local function forward(fn, ...)
  return fn(...)
end
print(forward(function(a, b) return a + b end, 10, 32))

local function nth(k, ...)
  return select(k, ...)
end
print(nth(2, "a", "b", "c"))
print("count", select("#", "a", nil, "c"))`),
      p('`...` n’est pas une table. Convertis avec table.pack si tu dois stocker, surtout s’il y a des nil au milieu (le champ n compte tout).'),
    ],
  }),
]
