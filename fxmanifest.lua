fx_version 'cerulean'
game 'gta5'

description 'SPiceZ-Core — Dynamic Racing Nametags'
version '1.0.0'

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'ui/assets/**/*'
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
