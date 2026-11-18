import type { CheatSheet } from './schema'

export const CHEATSHEETS: CheatSheet[] = [
  {
    id: 'lua',
    title: 'Mémo Lua 5.x',
    track: 'lua',
    groups: [
      {
        title: 'Types et vérité',
        rows: [
          { k: 'type(x)', v: 'nil boolean number string table function userdata thread' },
          { k: 'if x then', v: 'faux seulement si nil ou false (0 et "" sont vrais)' },
          { k: 'x or d', v: 'défaut, sauf si 0 est une valeur légale' },
        ],
      },
      {
        title: 'Tables',
        rows: [
          { k: 't[#t+1]=v', v: 'push en fin de séquence' },
          { k: 'table.insert/remove', v: 'décale les index' },
          { k: '#t / ipairs', v: 's’arrêtent au trou nil' },
          { k: 'pairs', v: 'tout, ordre non garanti' },
        ],
      },
      {
        title: 'Fonctions',
        rows: [
          { k: 't:f()', v: 't.f(t)' },
          { k: 'return a,b', v: 'multi-valeurs ; (f()) n’en garde qu’une' },
          { k: '... / select', v: 'varargs ; table.pack pour stocker avec nil' },
        ],
      },
      {
        title: 'Erreurs & meta',
        rows: [
          { k: 'pcall(fn, ...)', v: 'ok, ...' },
          { k: 'setmetatable', v: '__index __newindex __add __tostring __call' },
          { k: 'rawget/rawset', v: 'bypass meta, évite la récursion' },
        ],
      },
    ],
  },
  {
    id: 'roblox',
    title: 'Mémo Roblox Luau',
    track: 'roblox',
    groups: [
      {
        title: 'Structure',
        rows: [
          { k: 'GetService', v: 'Players, RS, ServerStorage, TweenService' },
          { k: 'WaitForChild', v: 'client / streaming' },
          { k: 'task.wait', v: 'remplace wait()' },
        ],
      },
      {
        title: 'Réseau',
        rows: [
          { k: 'RemoteEvent', v: 'FireServer / FireClient ; arg1 = Player' },
          { k: 'RemoteFunction', v: 'InvokeServer OK ; InvokeClient risqué' },
          { k: 'Validation', v: 'typeof, bornes, cooldown, distance, prix serveur' },
        ],
      },
      {
        title: 'Data & jeu',
        rows: [
          { k: 'DataStore', v: 'cache mémoire + UpdateAsync + BindToClose' },
          { k: 'CharacterAdded', v: 'reconnecter à chaque respawn' },
          { k: 'CollectionService', v: 'tags plutôt que des noms magiques' },
        ],
      },
    ],
  },
  {
    id: 'fivem',
    title: 'Mémo FiveM',
    track: 'fivem',
    groups: [
      {
        title: 'Ressource',
        rows: [
          { k: 'fxmanifest', v: 'fx_version cerulean, lua54 yes, client/server/shared' },
          { k: 'source', v: 'id session ; DB = license identifier' },
          { k: 'Wait(ms)', v: 'obligatoire dans while true' },
        ],
      },
      {
        title: 'Comms',
        rows: [
          { k: 'events', v: 'RegisterNetEvent + TriggerServerEvent, préfixe ressource' },
          { k: 'NUI', v: 'SendNUIMessage / RegisterNUICallback + cb()' },
          { k: 'oxmysql', v: 'MySQL.query(sql, { params })' },
        ],
      },
      {
        title: 'Frameworks',
        rows: [
          { k: 'ESX', v: 'GetPlayerFromId, xPlayer.getMoney / addInventoryItem' },
          { k: 'QBCore', v: 'GetPlayer, Player.Functions.RemoveMoney' },
          { k: 'ox_lib', v: 'notify, callback, points, context, ox_inventory exports' },
        ],
      },
    ],
  },
]
