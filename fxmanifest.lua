fx_version 'cerulean'
game 'gta5'

description 'SPiceZ-Core â€” Dynamic Racing Nametags'
version '1.2.2'

-- ui_page 'ui/dist/index.html'  -- drawn by spz-hud now (web/public/apps/spz-nametag); uncomment + drop the shim to roll back

shared_script '@ox_lib/init.lua'

-- UI files are not shipped from here: spz-hud serves this resource's page
-- (synced from ui/ by spz-hud/tools/sync-apps.mjs).

client_scripts {
    '@spz-hud/shim.lua',   -- NUI goes through spz-hud
    'config.lua',
    'client/main.lua'
}

server_scripts {
    'config.lua',
    'server/main.lua'
}

dependency 'ox_lib'
dependency 'spz-hud'
dependency 'spz-core'

