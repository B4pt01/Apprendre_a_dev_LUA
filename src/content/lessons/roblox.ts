import { callout, compare, h2, lesson, luau, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const robloxLessons: Lesson[] = [
  lesson({
    id: 'rbx-luau',
    slug: 'luau-vs-lua',
    title: 'Luau : ce qui change',
    summary: 'Types optionnels, +=, continue, generalised iteration, sandbox.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-studio',
    tags: ['luau', 'types'],
    blocks: [
      p('Luau est le dialecte Roblox. Tout ce que tu as appris en fondations (tables, closures, metatables) reste vrai. Tu gagnes de la syntaxe et un checker de types optionnel.'),
      luau(`--!strict
type PlayerData = { gold: number, xp: number }

local function grant(data: PlayerData, amount: number)
  data.gold += amount
  return data
end

local bag = { "pomme", "clé", "carte" }
for i, item in bag do -- generalised iteration
  if item == "clé" then continue end
  print(i, item)
end`, 'Luau.lua'),
      compare(
        'Portable ?',
        'Ne copie pas ce code dans FiveM.',
        [
          {
            label: '+= continue for-in',
            lua: 'non',
            luau: 'oui',
            fivem: 'non',
          },
          {
            label: '--!strict',
            lua: 'ignoré',
            luau: 'active l’analyseur',
            fivem: 'commentaire inerte',
          },
        ],
      ),
      callout('tip', 'task', 'Préfère task.wait, task.spawn, task.defer, task.cancel à wait / spawn / delay, dépréciés.'),
    ],
  }),
  lesson({
    id: 'rbx-studio',
    slug: 'studio-et-services',
    title: 'Studio, Explorer, services',
    summary: 'game:GetService, l’arbre d’instances, où poser tes scripts.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-studio',
    tags: ['GetService', 'Explorer'],
    blocks: [
      p('Tout dans un place Roblox est une Instance dans un arbre. game est la racine. Les services (Players, ReplicatedStorage, ServerStorage, TweenService…) se récupèrent avec GetService, jamais par un wait magique sur le nom.'),
      luau(`local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

print("joueurs max", Players.MaxPlayers)
print("RS", ReplicatedStorage:GetFullName())`, 'ServerScriptService/Boot.server.lua'),
      ul([
        'ServerScriptService : scripts serveur (autorité).',
        'StarterPlayerScripts / StarterCharacterScripts : client.',
        'ReplicatedStorage : partagé, visible client+serveur (ModuleScripts, remotes).',
        'ServerStorage : serveur only — secrets, templates à cloner.',
        'StarterGui : UI clonée vers PlayerGui.',
      ]),
      callout('warn', 'Ne fais pas game.Players', 'GetService crée le service s’il manque et est insensible à un rename. L’indexation brute casse.'),
    ],
  }),
  lesson({
    id: 'rbx-instances',
    slug: 'instances-parent-waitforchild',
    title: 'Instances, Parent, WaitForChild',
    summary: 'Clone, Destroy, attributes, et la course de streaming.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-studio',
    tags: ['WaitForChild', 'Clone'],
    blocks: [
      luau(`local template = ServerStorage.Enemy -- exemple
local clone = template:Clone()
clone.Name = "Enemy_" .. tostring(os.clock())
clone.Parent = workspace

clone:SetAttribute("HP", 100)
print(clone:GetAttribute("HP"))

clone:Destroy()`, 'ServerScriptService/Spawn.server.lua'),
      h2('WaitForChild vs FindFirstChild'),
      p('Côté client, l’arbre arrive en streaming. FindFirstChild peut renvoyer nil trop tôt. WaitForChild attend (et peut timeout). Côté serveur, les instances que TU crées sont déjà là : FindFirstChild suffit.'),
      luau(`local RS = game:GetService("ReplicatedStorage")
local remote = RS:WaitForChild("ShopEvent", 8)
if not remote then
  warn("ShopEvent manquant")
  return
end`, 'StarterPlayerScripts/ShopClient.client.lua'),
    ],
    quiz: [
      q('ins1', 'WaitForChild est surtout vital…', ['sur le serveur au boot', 'sur le client (replication / streaming)', 'dans Studio seulement'], 1, 'Le client voit l’arbre arriver progressivement.'),
    ],
  }),
  lesson({
    id: 'rbx-model',
    slug: 'client-serveur-replication',
    title: 'Modèle client / serveur',
    summary: 'Script vs LocalScript, ce qui se réplique, FilteringEnabled.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-net',
    tags: ['LocalScript', 'replication'],
    blocks: [
      p('Depuis FilteringEnabled (désormais le seul mode), le client ne peut pas imposer l’état du monde au serveur. Il demande ; le serveur décide ; la replication descend.'),
      ul([
        'Script (RunContext Server) : autorité, DataStores, dégâts, argent.',
        'LocalScript : input, caméra, UI, effets.',
        'ModuleScript : code partagé, require différent selon le côté.',
      ]),
      luau(`-- serveur
local Players = game:GetService("Players")
Players.PlayerAdded:Connect(function(player)
  print("join", player.UserId)
  player.CharacterAdded:Connect(function(char)
    print("spawn", char.Name)
  end)
end)`, 'ServerScriptService/Players.server.lua'),
      callout('warn', 'Jamais de trust', 'Si le client dit « je t’ai touché, 9999 dégâts », ignore. Le serveur raycast, le serveur applique.'),
    ],
  }),
  lesson({
    id: 'rbx-remotes',
    slug: 'remote-events',
    title: 'RemoteEvent',
    summary: 'FireServer / FireClient / FireAllClients, arguments, anti-spam.',
    minutes: 14,
    track: 'roblox',
    moduleId: 'rbx-net',
    tags: ['RemoteEvent'],
    blocks: [
      luau(`-- ReplicatedStorage/Remotes/BuyItem (RemoteEvent)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local buy = ReplicatedStorage.Remotes.BuyItem

buy.OnServerEvent:Connect(function(player, itemId)
  if typeof(itemId) ~= "string" then return end
  if #itemId > 32 then return end
  -- débiter, donner l'item, notifier
  buy:FireClient(player, true, itemId)
end)`, 'ServerScriptService/Shop.server.lua'),
      luau(`local buy = game:GetService("ReplicatedStorage"):WaitForChild("Remotes"):WaitForChild("BuyItem")
buy:FireServer("medkit")
buy.OnClientEvent:Connect(function(ok, itemId)
  print("achat", ok, itemId)
end)`, 'StarterPlayerScripts/Shop.client.lua'),
      p('Le premier argument serveur est TOUJOURS le Player, injecté par l’engine. Un client malveillant ne peut pas se faire passer pour un autre joueur via ce slot, mais il peut mentir sur la suite.'),
    ],
  }),
  lesson({
    id: 'rbx-remotefn',
    slug: 'remote-functions',
    title: 'RemoteFunction',
    summary: 'Aller-retour synchrone. Timeouts, jamais d’appel serveur→client bloquant.',
    minutes: 10,
    track: 'roblox',
    moduleId: 'rbx-net',
    tags: ['RemoteFunction'],
    blocks: [
      p('RemoteFunction:InvokeServer attend une réponse. Pratique pour « quelle est mon data ? ». Inverse (InvokeClient depuis le serveur) : le client peut ne jamais répondre et geler ton script serveur. Évite.'),
      luau(`-- GetProfile : RemoteFunction
local rf = game:GetService("ReplicatedStorage").Remotes.GetProfile
rf.OnServerInvoke = function(player)
  return { gold = 120, xp = 40 } -- depuis ton cache mémoire, pas un DataStore live
end`, 'ServerScriptService/Profile.server.lua'),
      callout('tip', 'Préfère RemoteEvent', 'Pour 90 % des cas, un event + un event de réponse est plus robuste qu’une RemoteFunction.'),
    ],
  }),
  lesson({
    id: 'rbx-security',
    slug: 'securite-remotes',
    title: 'Sécurité : never trust the client',
    summary: 'Validation de types, rate limit, distance, idempotence.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-net',
    tags: ['security'],
    blocks: [
      luau(`local last = {}
local function allow(player: Player, key: string, cooldown: number)
  local now = os.clock()
  local stamp = last[player] and last[player][key] or 0
  if now - stamp < cooldown then return false end
  last[player] = last[player] or {}
  last[player][key] = now
  return true
end

-- dans OnServerEvent
-- if not allow(player, "buy", 0.4) then return end
-- if typeof(itemId) ~= "string" then return end
print("pattern rate-limit prêt")`, 'ServerScriptService/Guard.lua'),
      ul([
        'typeof + bornes (nombre fini, string courte, enum connue).',
        'Vérifier que le joueur est proche du PNJ (magnitude).',
        'Autorité des prix côté serveur, jamais le prix envoyé par le client.',
        'Nettoyer last[player] au PlayerRemoving.',
      ]),
    ],
  }),
  lesson({
    id: 'rbx-datastores',
    slug: 'datastores',
    title: 'DataStoreService',
    summary: 'GetAsync, SetAsync, UpdateAsync. Budget, clés, JSON implicite.',
    minutes: 14,
    track: 'roblox',
    moduleId: 'rbx-data',
    tags: ['DataStore'],
    blocks: [
      luau(`local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("PlayerV1")

local function keyFor(player)
  return "u_" .. player.UserId
end

local function load(player)
  local ok, data = pcall(function()
    return store:GetAsync(keyFor(player))
  end)
  if not ok then
    warn("load fail", data)
    return nil, false
  end
  return data or { gold = 0, xp = 0 }, true
end`, 'ServerScriptService/Data/Load.lua'),
      p('Les DataStores sérialisent des tables acycliques de scalaires. Pas d’instances, pas de fonctions, pas de NaN. UpdateAsync est le primitive de fusion (évite d’écraser une sauvegarde plus fraîche).'),
      callout('warn', 'Studio', 'Active API Services dans Game Settings. Les DataStores ne marchent pas dans un place non publié comme tu l’attends en prod. Utilise un suffixe _DEV pendant les tests.'),
    ],
  }),
  lesson({
    id: 'rbx-session',
    slug: 'session-locking',
    title: 'Session, retries, autosave',
    summary: 'Cache mémoire, retries exponentiels, PlayerRemoving + BindToClose.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-data',
    tags: ['BindToClose'],
    blocks: [
      p('Le pattern prod : charger une fois au join dans un cache serveur, muter le cache pendant la session, sauvegarder périodiquement + à la sortie. Jamais GetAsync au milieu d’un achat.'),
      luau(`local Players = game:GetService("Players")
game:BindToClose(function()
  -- sauvegarder tous les profils encore ouverts
  -- en Studio le shutdown est court : task.wait borné
  print("shutdown save")
end)
Players.PlayerRemoving:Connect(function(player)
  print("save", player.UserId)
end)`, 'ServerScriptService/Data/Session.lua'),
      ul([
        'Retries : pcall + backoff (0.2, 0.5, 1s) sur les erreurs budget.',
        'session locking (ProfileService / ProfileStore) si un joueur peut hop sur deux serveurs.',
        'Ne jamais faire confiance à un timestamp client.',
      ]),
    ],
  }),
  lesson({
    id: 'rbx-character',
    slug: 'character-humanoid',
    title: 'Character et Humanoid',
    summary: 'Spawn, Humanoid.Died, states, Animate.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['Humanoid'],
    blocks: [
      luau(`local function hook(player: Player, char: Model)
  local hum = char:WaitForChild("Humanoid") :: Humanoid
  local root = char:WaitForChild("HumanoidRootPart") :: BasePart
  hum.Died:Connect(function()
    print(player.Name, "mort à", root.Position)
  end)
  hum:SetStateEnabled(Enum.HumanoidStateType.Swimming, true)
end

game:GetService("Players").PlayerAdded:Connect(function(player)
  player.CharacterAdded:Connect(function(char) hook(player, char) end)
end)`, 'ServerScriptService/Character.lua'),
      p('Le Character est détruit et recréé à chaque respawn : reconnecte tes events dans CharacterAdded, pas une seule fois au join.'),
    ],
  }),
  lesson({
    id: 'rbx-tools',
    slug: 'tools',
    title: 'Tools',
    summary: 'Tool.Activated, Handle, Equipped, debounce.',
    minutes: 10,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['Tool'],
    blocks: [
      luau(`local tool = script.Parent
local debounce = false
tool.Activated:Connect(function()
  if debounce then return end
  debounce = true
  -- FireServer("slash") plutôt que d'infliger les dégâts ici
  task.wait(0.4)
  debounce = false
end)
tool.Equipped:Connect(function() print("équipé") end)
tool.Unequipped:Connect(function() print("rangé") end)`, 'Tool/LocalScript'),
      p('Le client gère le feel (animation, son). Le serveur valide la hitbox. Un Tool dans Backpack se réplique ; les stats (dégâts) restent serveur.'),
    ],
  }),
  lesson({
    id: 'rbx-gui',
    slug: 'gui-ecran',
    title: 'GUI : ScreenGui et input',
    summary: 'PlayerGui, TextButton, UserInputService, contexts.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['ScreenGui', 'UserInputService'],
    blocks: [
      luau(`local Players = game:GetService("Players")
local player = Players.LocalPlayer
local gui = player:WaitForChild("PlayerGui"):WaitForChild("HUD")
local btn = gui:WaitForChild("OpenShop") :: TextButton
btn.MouseButton1Click:Connect(function()
  gui.Shop.Visible = not gui.Shop.Visible
end)

local UIS = game:GetService("UserInputService")
UIS.InputBegan:Connect(function(input, gp)
  if gp then return end -- déjà mangé par un TextBox
  if input.KeyCode == Enum.KeyCode.B then
    gui.Shop.Visible = not gui.Shop.Visible
  end
end)`, 'StarterPlayerScripts/HUD.client.lua'),
      callout('tip', 'Scale', 'Utilise des Scale UDim2 (0.2, 0, 0.1, 0) plus des Constraints, pas des pixels durs. Mobile d’abord.'),
    ],
  }),
  lesson({
    id: 'rbx-tweens',
    slug: 'tweenservice',
    title: 'TweenService',
    summary: 'TweenInfo, Completed, cancel. UI et world.',
    minutes: 10,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['TweenService'],
    blocks: [
      luau(`local TweenService = game:GetService("TweenService")
local part = workspace.Door
local info = TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tw = TweenService:Create(part, info, { Position = part.Position + Vector3.new(0, 8, 0) })
tw:Play()
tw.Completed:Connect(function(state)
  print("tween", state)
end)`, 'ServerScriptService/Door.lua'),
      p('Un tween serveur se réplique (la propriété bouge pour tous). Un tween client est cosmétique. Pour une porte autoritative, tween serveur ou set la CFrame serveur.'),
    ],
  }),
  lesson({
    id: 'rbx-modulescripts',
    slug: 'modulescripts',
    title: 'ModuleScripts',
    summary: 'require, cache par côté, éviter les cycles.',
    minutes: 10,
    track: 'roblox',
    moduleId: 'rbx-patterns',
    tags: ['ModuleScript'],
    blocks: [
      luau(`local Net = {}
local RS = game:GetService("ReplicatedStorage")
function Net.event(name: string): RemoteEvent
  local folder = RS:WaitForChild("Remotes")
  local e = folder:FindFirstChild(name)
  if e and e:IsA("RemoteEvent") then return e end
  error("Remote manquant: " .. name)
end
return Net`, 'ReplicatedStorage/Net.lua'),
      p('require(module) est caché par VM : client et serveur ont chacun leur cache. Un module dans ReplicatedStorage peut contenir du code des deux côtés : garde les DataStores hors de ce module ou teste RunService:IsServer().'),
    ],
  }),
  lesson({
    id: 'rbx-game-patterns',
    slug: 'patterns-de-jeu-roblox',
    title: 'Patterns : obby, rounds, inventaire',
    summary: 'Boucle de round, checkpoints, CollectionService.',
    minutes: 14,
    track: 'roblox',
    moduleId: 'rbx-patterns',
    tags: ['CollectionService', 'rounds'],
    blocks: [
      luau(`local CollectionService = game:GetService("CollectionService")
local function arm(part: BasePart)
  part.Touched:Connect(function(hit)
    local hum = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")
    if hum then hum:TakeDamage(10) end
  end)
end
for _, inst in CollectionService:GetTagged("Killbrick") do
  if inst:IsA("BasePart") then arm(inst) end
end
CollectionService:GetInstanceAddedSignal("Killbrick"):Connect(function(inst)
  if inst:IsA("BasePart") then arm(inst) end
end)`, 'ServerScriptService/Killbricks.lua'),
      h2('Round loop'),
      luau(`local function round()
  -- intermission
  task.wait(5)
  -- lock doors, spawn players
  task.wait(60)
  -- winner, reset map
end
task.spawn(function()
  while true do round() end
end)`, 'ServerScriptService/Round.lua'),
      p('Inventaire : table { {id, qty} } dans le cache DataStore. UI locale. Mutations via remotes validés. CollectionService tags > wait sur des noms magiques dans workspace.'),
    ],
  }),
  lesson({
    id: 'rbx-quiz',
    slug: 'quiz-roblox',
    title: 'Quiz Roblox',
    summary: 'Remotes, DataStores, character, Luau.',
    minutes: 10,
    track: 'roblox',
    moduleId: 'rbx-patterns',
    tags: ['quiz'],
    blocks: [p('Vérifie le track Roblox. 70 % pour valider.')],
    quiz: [
      q('rq1', 'Le premier argument de OnServerEvent est…', ['itemId', 'le Player', 'un GUID'], 1, 'Injecté par l’engine.'),
      q('rq2', 'InvokeClient depuis le serveur…', ['est recommandé', 'peut geler si le client ne répond pas', 'sauvegarde le DataStore'], 1, 'À éviter.'),
      q('rq3', 'Pour une propriété cosmétique d’UI on tween…', ['toujours au serveur', 'côté client', 'via DataStore'], 1, 'Client = feel.'),
      q('rq4', 'WaitForChild est critique…', ['client', 'uniquement BindToClose', 'dans os.execute'], 0, 'Streaming client.'),
      q('rq5', '`continue` en Luau…', ['existe', 'n’existe pas', 'vaut return'], 0, 'Dialecte Roblox.'),
    ],
  }),
]
