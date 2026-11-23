import { compare as compareBlock } from '../content/helpers'
import { BlockList } from '../components/BlockList'

export default function ComparePage() {
  const block = compareBlock(
    'Lua · Luau · FiveM',
    'Même langage, trois hôtes. Apprends Lua une fois, adapte l’API.',
    [
      {
        label: 'Version',
        lua: '5.1–5.4 PUC',
        luau: 'Luau (fork Roblox)',
        fivem: 'Lua 5.4 (lua54 yes) / parfois LuaJIT',
      },
      {
        label: 'continue / +=',
        lua: 'non',
        luau: 'oui',
        fivem: 'non',
      },
      {
        label: 'Types',
        lua: 'dynamiques',
        luau: 'annotations + --!strict',
        fivem: 'LuaLS optionnel',
      },
      {
        label: 'Objets hôte',
        lua: 'userdata C',
        luau: 'Instance (typeof)',
        fivem: 'handles number (ped, veh)',
      },
      {
        label: 'Scheduler',
        lua: 'coroutine.*',
        luau: 'task.wait / spawn',
        fivem: 'CreateThread + Wait(ms)',
      },
      {
        label: 'RPC',
        lua: '—',
        luau: 'RemoteEvent / RemoteFunction',
        fivem: 'TriggerServerEvent / lib.callback',
      },
      {
        label: 'Persistance',
        lua: 'io / ta DB',
        luau: 'DataStoreService',
        fivem: 'oxmysql / files ressource',
      },
      {
        label: 'UI',
        lua: '—',
        luau: 'ScreenGui / SurfaceGui',
        fivem: 'NUI HTML/JS',
      },
      {
        label: 'Modules',
        lua: 'require + package.path',
        luau: 'require(ModuleScript)',
        fivem: 'scripts fxmanifest + require 5.4',
      },
      {
        label: 'Sécurité',
        lua: 'sandbox maison',
        luau: 'never trust client, FilteringEnabled',
        fivem: 'revalider source, ACE, entity lockdown',
      },
    ],
  )

  return (
    <div>
      <p className="kicker">Référence</p>
      <h1 className="page-title">Luau vs FiveM vs Lua</h1>
      <p>
        Tu peux suivre les deux tracks. Ce tableau est le pense-bête quand un snippet « ne
        compile pas » : c’est souvent un dialecte, pas Lua.
      </p>
      <BlockList blocks={[block]} />
    </div>
  )
}
