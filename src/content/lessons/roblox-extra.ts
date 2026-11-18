import { callout, h2, lesson, luau, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const robloxExtra: Lesson[] = [
  lesson({
    id: 'rbx-runservice',
    slug: 'runservice',
    title: 'RunService : Heartbeat, Stepped, RenderStepped',
    summary: 'Chaque frame a un budget. task.wait vs Heartbeat, côté client vs serveur.',
    minutes: 12,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['RunService', 'Heartbeat'],
    blocks: [
      p('RunService distribue des events de frame. Heartbeat : après physique, serveur+client. Stepped : avant physique. RenderStepped : client only, avant le rendu (caméra). Abuser de RenderStepped tue le framerate.'),
      luau(`local RunService = game:GetService("RunService")
local t = 0
local conn = RunService.Heartbeat:Connect(function(dt)
  t += dt
  if t > 2 then
    print("2s de heartbeat", dt)
    conn:Disconnect()
  end
end)

-- alternative propre : boucle annulable
task.spawn(function()
  while true do
    local dt = task.wait() -- ≈ heartbeat
    if t > 99 then break end
  end
end)`, 'ServerScriptService/Loop.lua'),
      ul([
        'Caméra, FOV, arms : RenderStepped (LocalScript).',
        'Hitbox, regen, round timer : Heartbeat ou task.wait serveur.',
        'Toujours Disconnect / casser la boucle au CharacterRemoving.',
      ]),
      callout('warn', 'while true dans un LocalScript', 'Sans wait, tu gèles le client comme un Wait oublié FiveM. task.wait() yield la frame.'),
    ],
    quiz: [
      q('rs1', 'RenderStepped existe…', ['serveur et client', 'client seulement', 'uniquement Studio'], 1, 'Pas de rendu sur le serveur.'),
      q('rs2', 'Pour un timer de round serveur…', ['RenderStepped', 'Heartbeat ou task.wait', 'TweenService'], 1, 'Autorité serveur, pas de caméra.'),
    ],
  }),
  lesson({
    id: 'rbx-raycast',
    slug: 'raycast',
    title: 'Raycast : hitscan, armes, NPC',
    summary: 'workspace:Raycast, params, FilterType, jamais faire confiance au hit client.',
    minutes: 14,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['Raycast', 'armes'],
    blocks: [
      p('Un Tool client peut viser (caméra). Le serveur re-raycast depuis la tête / la muzzle, ignore le personnage du tireur, vérifie la distance. Le client qui envoie « j’ai touché UserId 12 » est un tricheur.'),
      luau(`local function shoot(origin: Vector3, dir: Vector3, ignore: {Instance}): RaycastResult?
  local params = RaycastParams.new()
  params.FilterType = Enum.RaycastFilterType.Exclude
  params.FilterDescendantsInstances = ignore
  params.IgnoreWater = true
  return workspace:Raycast(origin, dir.Unit * 250, params)
end

-- serveur, après FireServer(origin, look)
-- if (origin - character.Head.Position).Magnitude > 8 then return end
-- local result = shoot(origin, look, { character })
-- if result and result.Instance then
--   local hum = result.Instance.Parent and result.Instance.Parent:FindFirstChildOfClass("Humanoid")
--   if hum then hum:TakeDamage(18) end
-- end
print("pattern raycast prêt")`, 'ServerScriptService/Combat.lua'),
      callout(
        'tip',
        'Whitelist vs Exclude',
        'Exclude = ignore moi + l’arme. Include = seulement les hitboxes (plus sûr si tu tags Hurtbox avec CollectionService).',
      ),
    ],
    quiz: [
      q('rc1', 'Le hit d’une arme doit être décidé…', ['par le LocalScript', 'par un raycast serveur', 'par TweenService'], 1, 'Never trust the client.'),
      q('rc2', 'FilterType Exclude sert à…', ['ne toucher que l’eau', 'ignorer le tireur / l’arme', 'augmenter les dégâts'], 1, 'Sinon tu te touches toi-même.'),
    ],
  }),
  lesson({
    id: 'rbx-prompts',
    slug: 'proximityprompt',
    title: 'ProximityPrompt : interactions monde',
    summary: 'E pour ouvrir un coffre, un shop, un siège. Triggered côté serveur.',
    minutes: 11,
    track: 'roblox',
    moduleId: 'rbx-gameplay',
    tags: ['ProximityPrompt'],
    blocks: [
      luau(`local prompt = workspace.ShopNpc:WaitForChild("ProximityPrompt") :: ProximityPrompt
prompt.HoldDuration = 0.4
prompt.ActionText = "Ouvrir le shop"
prompt.ObjectText = "Marchand"

prompt.Triggered:Connect(function(player)
  -- serveur : ouvrir le shop pour CE player
  local remotes = game:GetService("ReplicatedStorage").Remotes
  remotes.OpenShop:FireClient(player)
end)`, 'ServerScriptService/NpcPrompt.lua'),
      p('Triggered se réplique : un LocalScript voit aussi l’event, mais l’autorité (prix, stock) reste serveur. MaxActivationDistance trop grand = interact through walls : raycast ou check magnitude.'),
      callout('diff', 'FiveM', 'Équivalent : ox_target / qb-target / markers E. Même règle : le press E client n’achète pas, il demande.'),
    ],
    quiz: [
      q('pp1', 'ProximityPrompt.Triggered fiable pour débiter gold ?', ['oui si HoldDuration > 0', 'non, revalider serveur (déjà le cas si le handler est serveur)', 'oui uniquement en LocalScript'], 1, 'Place le handler dans un Script serveur.'),
    ],
  }),
  lesson({
    id: 'rbx-leaderstats',
    slug: 'leaderstats',
    title: 'leaderstats, HUD, et la vérité serveur',
    summary: 'IntValue sous leaderstats pour le tableau. Le vrai gold vit dans ton cache DataStore.',
    minutes: 11,
    track: 'roblox',
    moduleId: 'rbx-patterns',
    tags: ['leaderstats'],
    blocks: [
      luau(`local function leaderstats(player: Player, gold: number, wins: number)
  local folder = Instance.new("Folder")
  folder.Name = "leaderstats"
  folder.Parent = player
  local g = Instance.new("IntValue")
  g.Name = "Gold"
  g.Value = gold
  g.Parent = folder
  local w = Instance.new("IntValue")
  w.Name = "Wins"
  w.Value = wins
  w.Parent = folder
end

-- après load DataStore
-- leaderstats(player, data.gold, data.wins)
-- plus tard : player.leaderstats.Gold.Value = cache[player].gold
print("leaderstats = vue, pas la source de vérité")`, 'ServerScriptService/Leaderstats.lua'),
      p('Un exploiteur peut cloner un IntValue en local : ça ne réplique pas. Ce qui compte, c’est le cache serveur que tu sauvegardes. leaderstats n’est qu’un affichage Roblox (liste joueurs).'),
    ],
    quiz: [
      q('ls1', 'La source de vérité de l’or…', ['leaderstats.Gold.Value côté client', 'le cache / DataStore serveur', 'ReplicatedStorage.Gold'], 1, 'leaderstats est cosmétique répliqué depuis le serveur.'),
    ],
  }),
  lesson({
    id: 'rbx-shop',
    slug: 'boutique-roblox',
    title: 'Projet : boutique (remotes + GUI + data)',
    summary: 'Un shop complet : catalogue serveur, débit, FireClient, UI locale.',
    minutes: 16,
    track: 'roblox',
    moduleId: 'rbx-patterns',
    tags: ['shop', 'RemoteEvent'],
    blocks: [
      h2('Serveur'),
      luau(`local RS = game:GetService("ReplicatedStorage")
local buy = RS.Remotes.Buy
local CATALOG = { medkit = 50, speed = 120 }
local wallet: {[number]: number} = {}

buy.OnServerEvent:Connect(function(player, itemId)
  if typeof(itemId) ~= "string" then return end
  local price = CATALOG[itemId]
  if not price then return end
  local gold = wallet[player.UserId] or 0
  if gold < price then
    buy:FireClient(player, false, "funds")
    return
  end
  wallet[player.UserId] = gold - price
  -- donner l'item (tool clone, attribute, etc.)
  buy:FireClient(player, true, itemId)
end)`, 'ServerScriptService/Shop.server.lua'),
      h2('Client'),
      luau(`local Players = game:GetService("Players")
local buy = game:GetService("ReplicatedStorage"):WaitForChild("Remotes"):WaitForChild("Buy")
local gui = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("Shop")
gui.Medkit.MouseButton1Click:Connect(function()
  buy:FireServer("medkit")
end)
buy.OnClientEvent:Connect(function(ok, info)
  gui.Status.Text = ok and ("Achat "..info) or "Refusé"
end)`, 'StarterPlayerScripts/Shop.client.lua'),
      p('Le prix n’est pas dans le GUI. Le client n’envoie que l’id. Étends avec un cooldown (leçon sécurité) et une sauvegarde wallet dans le session DataStore.'),
    ],
    quiz: [
      q('sh1', 'Le client envoie au serveur…', ['le prix', 'l’id d’item', 'le nouveau gold'], 1, 'Le serveur connaît le catalogue.'),
      q('sh2', 'FireClient(false, "funds") sert à…', ['débiter', 'mettre à jour l’UI', 'ouvrir Studio'], 1, 'Feedback, pas d’autorité.'),
    ],
  }),
]
