import { callout, h2, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const fivemExtra: Lesson[] = [
  lesson({
    id: 'fivem-callbacks',
    slug: 'lib-callback',
    title: 'lib.callback : aller-retour propre',
    summary: 'Remplace les duos d’events pour « donne-moi mon job ». Toujours valider source.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-runtime',
    tags: ['lib.callback', 'ox_lib'],
    blocks: [
      lua(`-- serveur
lib.callback.register('atelier:getWallet', function(source)
  local license = GetPlayerIdentifierByType(source, 'license')
  local row = MySQL.single.await('SELECT gold FROM atelier_users WHERE license = ?', { license })
  return row and row.gold or 0
end)

lib.callback.register('atelier:buy', function(source, item)
  if type(item) ~= 'string' then return false, 'id' end
  -- débit + add item
  return true, item
end)`, false, 'server/cb.lua'),
      lua(`-- client
local gold = lib.callback.await('atelier:getWallet', false)
print('gold', gold)

local ok, info = lib.callback.await('atelier:buy', false, 'bread')
if ok then
  lib.notify({ title = 'Shop', description = info })
else
  lib.notify({ type = 'error', description = 'achat refusé' })
end`, false, 'client/cb.lua'),
      p('Le false du await = « ne pas restreindre au current resource ». Timeout : un callback qui hitch la DB sans await bien géré bloque le client. Préfère des requêtes indexées, ou réponds depuis un cache mémoire.'),
      callout('diff', 'Roblox', 'C’est le RemoteFunction, en mieux : ox_lib gère le timeout. Inverse serveur→client (callback client) : même danger qu’InvokeClient.'),
    ],
    quiz: [
      q('cb1', 'lib.callback.register côté serveur reçoit…', ['license en 1er', 'source en 1er', 'un Player instance'], 1, 'Comme un NetEvent.'),
      q('cb2', 'Un callback qui fait un SELECT à chaque frame…', ['est OK', 'hitch client + DB', 'remplace oxmysql'], 1, 'Cache le wallet en mémoire.'),
    ],
  }),
  lesson({
    id: 'fivem-exports',
    slug: 'exports-entre-ressources',
    title: 'exports entre ressources',
    summary: 'exports.ressource:fn(), GetResourceState, dépendances fxmanifest.',
    minutes: 11,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['exports'],
    blocks: [
      lua(`-- ressource atelier_core / server/export.lua
exports('GetGold', function(src)
  return Wallet[src] or 0
end)

exports('AddGold', function(src, amount)
  if type(amount) ~= 'number' or amount ~= amount then return false end
  Wallet[src] = (Wallet[src] or 0) + amount
  return true
end)`, false, 'atelier_core/server/export.lua'),
      lua(`-- autre ressource
if GetResourceState('atelier_core') ~= 'started' then
  print('atelier_core manquant')
  return
end
local gold = exports.atelier_core:GetGold(source)`, false, 'atelier_shop/server/pay.lua'),
      ul([
        'dependency / dependencies dans le fxmanifest pour l’ordre de start.',
        'Un export est un contrat : ne casse pas la signature entre deux versions.',
        'Ne fais pas d’export qui mute l’inventaire sans revalider source — l’appelant peut être une ressource malveillante (leak d’un zip).',
      ]),
    ],
    quiz: [
      q('ex1', 'GetResourceState avant export…', ['est cosmétique', 'évite un nil index si la ressource est down', 'remplace MySQL'], 1, 'started | stopped | missing.'),
    ],
  }),
  lesson({
    id: 'fivem-statebags',
    slug: 'state-bags',
    title: 'State bags : état répliqué',
    summary: 'Player(src).state, Entity(ent).state. replicated, pas une DB.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['statebag'],
    blocks: [
      lua(`-- serveur
local ply = Player(source)
ply.state:set('atelierDuty', true, true) -- 3e arg = replicated

AddStateBagChangeHandler('atelierDuty', nil, function(bagName, key, value)
  print(bagName, key, value)
end)`, false, 'server/state.lua'),
      lua(`-- client
local me = PlayerId()
local serverId = GetPlayerServerId(me)
print(Player(serverId).state.atelierDuty)

-- entité
local veh = cache.vehicle
if veh and Entity(veh).state.locked then
  print('véhicule lock via state')
end`, false, 'client/state.lua'),
      p('Un state bag n’est pas oxmysql. C’est de la replication temps réel (duty, cuffed, currentWeapon). Le client peut parfois écrire des bags mal configurés : set tes bags critiques serveur-only (replicated true mais setter serveur).'),
      callout('diff', 'Roblox', 'Proche des attributes + replication. Attributes Roblox = instance. State bags = player/entity FiveM.'),
    ],
    quiz: [
      q('sb1', 'Player(source).state:set("duty", true, true)…', ['sauve en MySQL', 'réplique l’état', 'ouvre une NUI'], 1, '3e argument replicated.'),
      q('sb2', 'Pour l’argent persistant…', ['un state bag suffit', 'DB / inventaire framework', 'Entity state'], 1, 'State = session, pas save.'),
    ],
  }),
  lesson({
    id: 'fivem-anim',
    slug: 'animations-et-scenarios',
    title: 'Animations et scenarios',
    summary: 'RequestAnimDict, TaskPlayAnim, scenarios. Toujours timeout le load.',
    minutes: 11,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['TaskPlayAnim'],
    blocks: [
      lua(`local function play(dict, name, duration)
  local ped = PlayerPedId()
  lib.requestAnimDict(dict) -- ox_lib, avec timeout
  TaskPlayAnim(ped, dict, name, 8.0, 8.0, duration or 3000, 49, 0.0, false, false, false)
  RemoveAnimDict(dict)
end

RegisterNetEvent('atelier:progressEat', function()
  if lib.progressCircle({ duration = 4000, label = 'Mange…', disable = { move = true, combat = true } }) then
    play('mp_player_inteat@burger', 'mp_player_int_eat_burger', 2000)
    TriggerServerEvent('atelier:ate', 'bread')
  end
end)`, false, 'client/anim.lua'),
      p('Les dicts se chargent async. Une boucle while not HasAnimDictLoaded sans timeout = freeze. ox_lib requestAnimDict échoue proprement. Le serveur ne « voit » pas l’anim : il croit le progress + un cooldown, pas le nom de dict envoyé par le client.'),
    ],
    quiz: [
      q('an1', 'HasAnimDictLoaded en while true sans Wait…', ['est recommandé', 'gèle', 'charge plus vite'], 1, 'Toujours Wait / timeout.'),
    ],
  }),
  lesson({
    id: 'fivem-shop',
    slug: 'ressource-shop-complete',
    title: 'Projet : ressource boutique',
    summary: 'fxmanifest, config, callback, ox_inventory, target. Le squelette d’une vraie resource.',
    minutes: 16,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['shop', 'resource'],
    blocks: [
      h2('config + serveur'),
      lua(`Config.Items = {
  bread = { price = 12, label = 'Pain' },
  water = { price = 8, label = 'Eau' },
}

lib.callback.register('atelier_shop:buy', function(source, item)
  local def = Config.Items[item]
  if not def then return false, 'unknown' end
  local cash = exports.ox_inventory:Search(source, 'count', 'money') or 0
  if cash < def.price then return false, 'funds' end
  if not exports.ox_inventory:RemoveItem(source, 'money', def.price) then
    return false, 'funds'
  end
  if not exports.ox_inventory:AddItem(source, item, 1) then
    exports.ox_inventory:AddItem(source, 'money', def.price) -- rollback
    return false, 'inv'
  end
  return true, item
end)`, false, 'server/buy.lua'),
      h2('client target'),
      lua(`exports.ox_target:addBoxZone({
  coords = vec3(25.7, -1347.3, 29.5),
  size = vec3(1.5, 1.5, 2.0),
  rotation = 0,
  options = {{
    name = 'atelier_shop',
    label = 'Boutique',
    icon = 'fa-solid fa-basket-shopping',
    onSelect = function()
      local options = {}
      for id, def in pairs(Config.Items) do
        options[#options+1] = {
          title = def.label .. ' — $' .. def.price,
          onSelect = function()
            local ok, why = lib.callback.await('atelier_shop:buy', false, id)
            lib.notify({ type = ok and 'success' or 'error', description = why })
          end,
        }
      end
      lib.registerContext({ id = 'atelier_shop', title = 'Épicerie', options = options })
      lib.showContext('atelier_shop')
    end,
  }},
})`, false, 'client/shop.lua'),
      p('Rollback si AddItem échoue : sinon tu brûles l’argent. Les prix du context menu sont cosmétiques. Ajoute un ratelimit (leçon sécurité) et un log Discord serveur sur les achats > 10k.'),
    ],
    quiz: [
      q('fs1', 'Si AddItem échoue après RemoveItem money…', ['tant pis', 'rollback AddItem money', 'kick le joueur'], 1, 'Atomicité approximative à la main.'),
      q('fs2', 'Les prix dans lib.registerContext…', ['font foi', 'sont de l’UI, le serveur relit Config', 'sont chiffrés'], 1, 'Le client dump Config.'),
    ],
  }),
]
