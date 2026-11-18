import { callout, compare, h2, html, js, json, lesson, lua, p, q, ul } from '../helpers'
import type { Lesson } from '../schema'

export const fivemLessons: Lesson[] = [
  lesson({
    id: 'fivem-intro',
    slug: 'quest-ce-que-fivem',
    title: 'FiveM : le runtime GTA',
    summary: 'FXServer, ressources, client GTA, Cfx natives.',
    minutes: 10,
    track: 'fivem',
    moduleId: 'fivem-res',
    tags: ['fivem', 'fxserver'],
    blocks: [
      p('FiveM (Cfx.re) embarque Lua dans un serveur (FXServer) et dans le client GTA V. Ton code vit dans une ressource : un dossier avec un fxmanifest.lua, des scripts client / server / shared, parfois une NUI (HTML).'),
      ul([
        'Une ressource est isolée : tes globales ne fuient pas vers l’autre ressource.',
        'Le serveur a autorité sur l’argent, l’inventaire, la DB.',
        'Le client a les natives graphiques : ped, véhicule, marker, scaleform.',
        'Les “natives” sont des fonctions C++ du jeu exposées à Lua.',
      ]),
      compare(
        'Mental model',
        'Proche de Roblox, vocabulaire différent.',
        [
          {
            label: 'Joueur',
            lua: '—',
            luau: 'Player instance + UserId',
            fivem: 'source (server id), identifier licence',
          },
          {
            label: 'RPC',
            lua: '—',
            luau: 'RemoteEvent',
            fivem: 'TriggerServerEvent / lib.callback',
          },
        ],
      ),
    ],
  }),
  lesson({
    id: 'fivem-fxmanifest',
    slug: 'fxmanifest',
    title: 'fxmanifest.lua',
    summary: 'fx_version, games, scripts, files, lua54, dependencies.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-res',
    tags: ['fxmanifest'],
    blocks: [
      lua(`fx_version 'cerulean'
game 'gta5'
lua54 'yes'
name 'atelier_shop'
author 'Atelier Lua'
version '1.0.0'

shared_scripts { 'config.lua', '@ox_lib/init.lua' }
client_scripts { 'client/*.lua' }
server_scripts { '@oxmysql/lib/MySQL.lua', 'server/*.lua' }

ui_page 'web/index.html'
files { 'web/index.html', 'web/**/*' }

dependencies { 'oxmysql', 'ox_lib' }`, false, 'fxmanifest.lua'),
      ul([
        'lua54 yes : syntaxe 5.4 (to-be-closed, integers).',
        'shared_scripts : chargés des deux côtés, idéal pour Config.',
        '@ox_lib/init.lua : importe ox_lib dans ta ressource.',
        'files + ui_page : NUI. Sans files[], le HTML n’est pas servi.',
      ]),
      callout('warn', 'Cerulean', 'fx_version cerulean est le canal moderne. adamant / bodacious sont historiques. Vérifie tes natives contre la doc docs.fivem.net.'),
    ],
  }),
  lesson({
    id: 'fivem-sides',
    slug: 'client-server-shared',
    title: 'Client, server, shared',
    summary: 'IsDuplicityVersion, source, PlayerId, isolation.',
    minutes: 10,
    track: 'fivem',
    moduleId: 'fivem-res',
    tags: ['IsDuplicityVersion'],
    blocks: [
      lua(`local SERVER = IsDuplicityVersion()
if SERVER then
  print("serveur", GetCurrentResourceName())
else
  print("client", PlayerId(), GetPlayerServerId(PlayerId()))
end`, false, 'shared/side.lua'),
      p('source est l’id serveur du joueur dans un event (1, 2, 3…). Ce n’est pas un identifiant persistant : au reboot il change. Pour la DB, utilise license: / fivem: via GetPlayerIdentifiers.'),
      callout('diff', 'Pas d’Instance', 'Un ped est un handle number. S’il despawn, le number peut être réutilisé. Valide DoesEntityExist. Roblox : objets GC. FiveM : handles C.'),
    ],
  }),
  lesson({
    id: 'fivem-events',
    slug: 'events-fivem',
    title: 'Events net',
    summary: 'RegisterNetEvent, TriggerServerEvent, AddEventHandler, latence.',
    minutes: 14,
    track: 'fivem',
    moduleId: 'fivem-runtime',
    tags: ['TriggerServerEvent'],
    blocks: [
      lua(`-- serveur
RegisterNetEvent('atelier:buy', function(item)
  local src = source
  if type(item) ~= 'string' then return end
  -- vérifier argent, retirer, donner
  TriggerClientEvent('atelier:buyResult', src, true, item)
end)`, false, 'server/shop.lua'),
      lua(`-- client
RegisterNetEvent('atelier:buyResult', function(ok, item)
  lib.notify({ title = ok and 'Achat' or 'Refus', description = item })
end)

TriggerServerEvent('atelier:buy', 'bread')`, false, 'client/shop.lua'),
      h2('Conventions'),
      ul([
        'Préfixe tes events avec le nom de ressource : atelier:buy. Évite "buy" global.',
        'RegisterNetEvent + handler. AddEventHandler seul n’est pas net.',
        'Un client peut forger TriggerServerEvent : revalide TOUT côté serveur.',
      ]),
      callout('tip', 'ox_lib callbacks', 'lib.callback.await("atelier:getJob", false) est plus lisible qu’un duo d’events pour un aller-retour.'),
    ],
  }),
  lesson({
    id: 'fivem-natives',
    slug: 'natives',
    title: 'Natives Cfx / GTA',
    summary: 'Invocation, hashes, docs, wrappers Citizen.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-runtime',
    tags: ['natives'],
    blocks: [
      lua(`-- client
local ped = PlayerPedId()
local coords = GetEntityCoords(ped)
print(coords.x, coords.y, coords.z)

SetEntityInvincible(ped, false)
TaskStartScenarioInPlace(ped, 'WORLD_HUMAN_SMOKING', 0, true)`, false, 'client/natives.lua'),
      p('Les natives sont générées depuis des hashes. La doc : docs.fivem.net/natives. Beaucoup attendent un handle (ped, vehicle, object). Les vecteurs FiveM ont .x .y .z — ce ne sont pas tes Vec maison des fondations, mais le même réflexe.'),
      callout(
        'warn',
        'Natives serveur',
        'Une native « client only » crash ou no-op sur le serveur. Lis la colonne de la doc. GiveWeaponToPed est client ; l’inventaire persistant est serveur + ox_inventory.',
      ),
    ],
  }),
  lesson({
    id: 'fivem-threads',
    slug: 'createthread-et-wait',
    title: 'CreateThread et Wait',
    summary: 'Le scheduler Citizen. Jamais de while true sans Wait.',
    minutes: 11,
    track: 'fivem',
    moduleId: 'fivem-runtime',
    tags: ['CreateThread', 'Wait'],
    blocks: [
      lua(`CreateThread(function()
  while true do
    local sleep = 1000
    local ped = PlayerPedId()
    local dist = #(GetEntityCoords(ped) - vec3(120.1, -200.2, 54.0))
    if dist < 20.0 then
      sleep = 0
      DrawMarker(1, 120.1, -200.2, 53.0, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 80, 180, 255, 120, false, false, 2, false, nil, nil, false)
      if dist < 2.0 and IsControlJustPressed(0, 38) then -- E
        TriggerServerEvent('atelier:openShop')
      end
    end
    Wait(sleep)
  end
end)`, false, 'client/point.lua'),
      p('Le pattern sleep dynamique : Wait(1000) loin du point, Wait(0) seulement quand tu dessines. Un Wait(0) global = 1 frame, OK pour un marker proche, criminel sur 200 points.'),
      compare(
        'Attente',
        'Même idée, API différente.',
        [
          {
            label: 'yield',
            lua: 'coroutine.yield',
            luau: 'task.wait(t)',
            fivem: 'Wait(ms)',
          },
        ],
      ),
    ],
  }),
  lesson({
    id: 'fivem-nui',
    slug: 'nui',
    title: 'NUI : HTML dans le jeu',
    summary: 'SendNUIMessage, RegisterNUICallback, SetNuiFocus.',
    minutes: 14,
    track: 'fivem',
    moduleId: 'fivem-data',
    tags: ['NUI', 'SendNUIMessage'],
    blocks: [
      lua(`local open = false
local function setOpen(v)
  open = v
  SetNuiFocus(v, v)
  SendNUIMessage({ action = 'shop', visible = v })
end

RegisterCommand('shop', function() setOpen(true) end)

RegisterNUICallback('close', function(_, cb)
  setOpen(false)
  cb({ ok = true })
end)

RegisterNUICallback('buy', function(data, cb)
  TriggerServerEvent('atelier:buy', data.item)
  cb({ ok = true })
end)`, false, 'client/nui.lua'),
      js(`window.addEventListener('message', (e) => {
  if (e.data.action === 'shop') {
    document.body.classList.toggle('show', e.data.visible)
  }
})
document.getElementById('close').onclick = () => {
  fetch('https://atelier_shop/close', { method: 'POST', body: '{}' })
}`, 'web/app.js'),
      html(`<button id="close">Fermer</button>`, 'web/index.html'),
      p('Le fetch NUI vise https://nom_de_ressource/callback. Le nom doit matcher le dossier ressource. Toujours cb() sinon le fetch pend.'),
    ],
  }),
  lesson({
    id: 'fivem-oxmysql',
    slug: 'oxmysql',
    title: 'oxmysql',
    summary: 'Insert / query async, placeholders, jamais de concat SQL.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-data',
    tags: ['oxmysql', 'sql'],
    blocks: [
      lua(`-- serveur, @oxmysql/lib/MySQL.lua dans le fxmanifest
MySQL.ready(function()
  print('mysql ready')
end)

RegisterNetEvent('atelier:load', function()
  local src = source
  local license = GetPlayerIdentifierByType(src, 'license')
  MySQL.query('SELECT gold FROM atelier_users WHERE license = ?', { license }, function(rows)
    local gold = rows[1] and rows[1].gold or 0
    TriggerClientEvent('atelier:wallet', src, gold)
  end)
end)

local function addGold(license, amount)
  MySQL.update('UPDATE atelier_users SET gold = gold + ? WHERE license = ?', { amount, license })
end`, false, 'server/db.lua'),
      json(`{
  "mysql": {
    "create": "CREATE TABLE atelier_users (license VARCHAR(64) PRIMARY KEY, gold INT NOT NULL DEFAULT 0)"
  }
}`, 'notes.json'),
      callout('warn', 'SQL injection', 'Jamais "WHERE id = " .. src. Placeholders ? seulement. oxmysql prépare les requêtes.'),
    ],
  }),
  lesson({
    id: 'fivem-config',
    slug: 'config-et-locales',
    title: 'Config, locales, secrets',
    summary: 'config.lua shared, locales ox_lib, aucun secret client.',
    minutes: 8,
    track: 'fivem',
    moduleId: 'fivem-data',
    tags: ['config'],
    blocks: [
      lua(`Config = {}
Config.Shop = {
  { item = 'bread', price = 12 },
  { item = 'water', price = 8 },
}
Config.InteractDistance = 2.0`, false, 'config.lua'),
      p('Le client peut dumper Config. Les prix affichés sont cosmétique : le serveur relit SA copie (même shared_script, mais revalide). Les credentials MySQL sont dans server.cfg (set mysql_connection_string), jamais dans un script client.'),
    ],
  }),
  lesson({
    id: 'fivem-esx',
    slug: 'esx-patterns',
    title: 'ESX : patterns',
    summary: 'ESX.GetPlayerFromId, xPlayer, items, jobs.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-fw',
    tags: ['ESX', 'xPlayer'],
    blocks: [
      lua(`ESX = exports['es_extended']:getSharedObject()

RegisterNetEvent('atelier:esxPay', function()
  local xPlayer = ESX.GetPlayerFromId(source)
  if not xPlayer then return end
  if xPlayer.getMoney() < 12 then
    return TriggerClientEvent('esx:showNotification', source, 'Pas assez d\\'argent')
  end
  xPlayer.removeMoney(12)
  xPlayer.addInventoryItem('bread', 1)
end)`, false, 'server/esx_shop.lua'),
      lua(`RegisterNetEvent('esx:playerLoaded', function(xPlayer)
  -- client : xPlayer job, etc.
end)
-- job check
-- if xPlayer.job.name ~= 'police' then return end`, false, 'client/esx.lua'),
      p('xPlayer est un objet serveur. Ne le serialize pas vers le client entier. Envoie job.name, job.grade. ESX legacy vs ESX Legacy (export getSharedObject) : suis la version de ton serveur.'),
    ],
  }),
  lesson({
    id: 'fivem-qbcore',
    slug: 'qbcore-patterns',
    title: 'QBCore : patterns',
    summary: 'QBCore.Functions.GetPlayer, PlayerData, Player.Functions.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-fw',
    tags: ['QBCore'],
    blocks: [
      lua(`local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('atelier:qbPay', function()
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end
  if Player.PlayerData.money.cash < 12 then return end
  Player.Functions.RemoveMoney('cash', 12, 'atelier-shop')
  Player.Functions.AddItem('bread', 1)
  TriggerClientEvent('inventory:client:ItemBox', src, QBCore.Shared.Items['bread'], 'add')
end)`, false, 'server/qb_shop.lua'),
      p('QBCore aime les PlayerData répliqués au client (QBCore:Client:OnPlayerLoaded). Même règle : l’argent se mute serveur. qb-inventory et ox_inventory n’ont pas les mêmes exports : lis ceux de TON serveur.'),
    ],
  }),
  lesson({
    id: 'fivem-ox',
    slug: 'ox-lib-et-ox-inventory',
    title: 'ox_lib et ox_inventory',
    summary: 'notify, progress, callback, points, inventory exports.',
    minutes: 11,
    track: 'fivem',
    moduleId: 'fivem-fw',
    tags: ['ox_lib', 'ox_inventory'],
    blocks: [
      lua(`-- client, @ox_lib/init.lua
lib.callback.register('atelier:ping', function()
  return 'pong'
end)

lib.registerContext({
  id = 'atelier_shop',
  title = 'Épicerie',
  options = {
    { title = 'Pain — 12$', onSelect = function()
      TriggerServerEvent('atelier:buy', 'bread')
    end },
  }
})
lib.showContext('atelier_shop')`, false, 'client/ox.lua'),
      lua(`-- serveur
exports.ox_inventory:AddItem(source, 'bread', 1)
-- ou
-- if not exports.ox_inventory:RemoveItem(source, 'cash', 12) then return end`, false, 'server/ox_inv.lua'),
      callout('tip', 'ox_lib points', 'lib.points.new({ coords, distance, nearby }) remplace beaucoup de boucles marker. Moins de Wait(0) = plus de FPS.'),
    ],
  }),
  lesson({
    id: 'fivem-jobs',
    slug: 'jobs-et-target',
    title: 'Jobs, target, duty',
    summary: 'job name/grade, ox_target / qb-target, clock in.',
    minutes: 10,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['jobs', 'ox_target'],
    blocks: [
      lua(`exports.ox_target:addBoxZone({
  coords = vec3(441.0, -982.0, 30.7),
  size = vec3(1.2, 1.2, 2.0),
  debug = false,
  options = {
    {
      name = 'atelier_duty',
      label = 'Prise de service',
      icon = 'fa-solid fa-badge',
      canInteract = function()
        return true -- vérifier job client cosmétique
      end,
      onSelect = function()
        TriggerServerEvent('atelier:duty')
      end,
    },
  },
})`, false, 'client/target.lua'),
      p('Le target client est du sugar d’UX. Le serveur revérifie job et grade. Un duty flag en DB ou PlayerData empêche les extras hors service.'),
    ],
  }),
  lesson({
    id: 'fivem-vehicles',
    slug: 'vehicules',
    title: 'Véhicules, clés, spawn',
    summary: 'CreateVehicle serveur, NetworkGetNetworkIdFromEntity, keys.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['CreateVehicle'],
    blocks: [
      lua(`RegisterNetEvent('atelier:spawnVeh', function(model)
  local src = source
  if model ~= 'sultan' then return end -- whitelist
  local ped = GetPlayerPed(src)
  local c = GetEntityCoords(ped)
  local veh = CreateVehicle(joaat(model), c.x + 3.0, c.y, c.z, 0.0, true, true)
  local netId = NetworkGetNetworkIdFromEntity(veh)
  TriggerClientEvent('atelier:warpVeh', src, netId)
end)`, false, 'server/veh.lua'),
      lua(`RegisterNetEvent('atelier:warpVeh', function(netId)
  local veh = NetworkGetEntityFromNetworkId(netId)
  if not DoesEntityExist(veh) then return end
  TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
end)`, false, 'client/veh.lua'),
      callout('warn', 'Client spawn', 'CreateVehicle 100 % client = véhicule non autoritatif, dupes, exploit. Spawn serveur (ou entity lockdown) + keys (ox_vehiclekeys / qb-vehiclekeys).'),
    ],
  }),
  lesson({
    id: 'fivem-commands',
    slug: 'commandes-et-chat',
    title: 'Commandes, chat, ACE',
    summary: 'RegisterCommand, Restrict, ACE perms, suggestions.',
    minutes: 10,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['RegisterCommand', 'ACE'],
    blocks: [
      lua(`RegisterCommand('gold', function(source, args)
  if source == 0 then
    print('console: ' .. table.concat(args, ' '))
    return
  end
  local amount = tonumber(args[1] or '')
  if not amount then return end
  -- vérifier ACE : IsPlayerAceAllowed(source, 'atelier.give')
  TriggerClientEvent('chat:addMessage', source, { args = { 'Atelier', 'gold=' .. amount } })
end, false)

TriggerEvent('chat:addSuggestion', '/gold', 'Debug gold', {
  { name = 'montant', help = 'nombre' },
})`, false, 'server/cmd.lua'),
      p('source == 0 : la commande vient de la console serveur. Le 3e argument de RegisterCommand (restricted) s’appuie sur ACE. En prod, add_ace group.admin atelier.give allow dans server.cfg.'),
    ],
  }),
  lesson({
    id: 'fivem-security',
    slug: 'securite-fivem',
    title: 'Sécurité FiveM',
    summary: 'source, spam, cheats events, entity lockdown.',
    minutes: 12,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['security', 'cheats'],
    blocks: [
      ul([
        'Ne fais jamais confiance à un netId / ped id client pour des récompenses.',
        'Rate-limit tes events (os.clock par source).',
        'Whitelist les modèles de véhicules et armes.',
        'OneSync : préfère les natives serveur (GetPlayerPed, GetEntityCoords).',
        'Ferme tes NUI callbacks : un fetch peut être imité, le serveur décide.',
        'Logs (ox_lib logger, Discord webhook serveur) sur les give d’items.',
      ]),
      lua(`local bucket = {}
local function ratelimit(src, key, cd)
  bucket[src] = bucket[src] or {}
  local now = os.clock()
  if bucket[src][key] and now - bucket[src][key] < cd then return false end
  bucket[src][key] = now
  return true
end
AddEventHandler('playerDropped', function()
  bucket[source] = nil
end)`, false, 'server/rate.lua'),
    ],
  }),
  lesson({
    id: 'fivem-quiz',
    slug: 'quiz-fivem',
    title: 'Quiz FiveM',
    summary: 'fxmanifest, events, NUI, frameworks, sécurité.',
    minutes: 10,
    track: 'fivem',
    moduleId: 'fivem-gameplay',
    tags: ['quiz'],
    blocks: [p('Valide le track FiveM. 70 % pour marquer complet.')],
    quiz: [
      q('fq1', 'source dans un NetEvent serveur est…', ['la licence', 'l’id session du joueur', 'le netId véhicule'], 1, 'Éphémère, pas un identifiant DB.'),
      q('fq2', 'while true sans Wait…', ['est optimal', 'gèle le thread / le jeu', 'vaut coroutine.yield'], 1, 'Toujours Wait.'),
      q('fq3', 'Les prix d’un shop dans config.lua client…', ['font foi', 'doivent être revalidés serveur', 'sont chiffrés'], 1, 'Le client est dumpable.'),
      q('fq4', 'RegisterNUICallback doit…', ['ignorer cb', 'appeler cb(...)', 'utiliser io.open'], 1, 'Sinon le fetch pend.'),
      q('fq5', 'CreateVehicle autoritatif…', ['client only', 'de préférence serveur + netId', 'dans le fxmanifest'], 1, 'Anti-dupe.'),
    ],
  }),
]
