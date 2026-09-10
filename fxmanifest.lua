fx_version 'cerulean'
game 'gta5'

description 'SPiceZ-Core â€” Dynamic Racing Nametags'
version '1.2.0'

ui_page 'ui/dist/index.html'

shared_script '@ox_lib/init.lua'

files {
    'ui/dist/**/*',
}

client_scripts {
    'config.lua',
    'client/main.lua'
}

server_scripts {
    'config.lua',
    'server/main.lua'
}

dependency 'ox_lib'
dependency 'spz-core'

