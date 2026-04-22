Config = {}

Config.Debug = false

Config.RenderDistance = 150.0  -- Max distance to see nametags
Config.FadeDistance = 100.0    -- Distance where nametags start to fade out
Config.ScaleMin = 0.5          -- Minimum scale at max distance
Config.ScaleMax = 1.0          -- Maximum scale when close

Config.UpdateInterval = 0      -- Tick wait (0 = every frame for movement smoothness)
Config.DataRefreshInterval = 2000 -- How often to refresh player data from state bags (ms)

Config.ShowOnlyInRace = false  -- If true, only show nametags when in a race
Config.HideInSpectator = true  -- Hide nametags if player is spectating

Config.Colors = {
    ['S'] = '#FFD700', -- Gold
    ['A'] = '#FF4500', -- OrangeRed
    ['B'] = '#1E90FF', -- DodgerBlue
    ['C'] = '#32CD32', -- LimeGreen
    ['D'] = '#A9A9A9', -- DarkGray
    ['Default'] = '#FFFFFF'
}

Config.DefaultAvatar = 'https://i.imgur.com/8NzA8m8.png' -- Generic racing helmet/avatar
Config.DefaultBanner = 'https://github.com/SPiceZ21/spz-core-media-kit/blob/main/Extra/nametag.png?raw=true'

Config.Keybind = {
    enabled = true,
    key = 'F10',
    command = 'togglenametags',
    description = 'Toggle Player Nametags'
}
