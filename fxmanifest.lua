fx_version 'cerulean'
game 'gta5'

description 'SPiceZ-Core â€” Dynamic Racing Nametags'
version '1.1.5'

ui_page 'ui/dist/index.html'

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

dependency 'spz-lib'
dependency 'spz-core'

