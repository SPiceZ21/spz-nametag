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

Config.DefaultAvatar = 'https://raw.githubusercontent.com/SPiceZ21/spz-core-media-kit/main/Extra/nametag_profile.png' -- Generic racing helmet/avatar
Config.DefaultBanner = 'https://raw.githubusercontent.com/SPiceZ21/spz-core-media-kit/main/Extra/nametag.png'

Config.Keybind = {
    enabled = true,
    key = 'F10',
    command = 'togglenametags',
    description = 'Toggle Player Nametags'
}

-- Revamp Telemetry and Performance Configs
Config.ShowVehicleName = true   -- Show driving vehicle under name
Config.ShowDistance = true      -- Show distance to player in meters
Config.RaycastThrottle = 200    -- Throttle raycast checks (ms) to optimize performance

-- Curated Premium Presets (URLs and CSS Gradients supported)
Config.PresetBanners = {
    { name = "Matte Carbon", value = "https://raw.githubusercontent.com/SPiceZ21/spz-core-media-kit/main/Extra/nametag.png" },
    { name = "Neon Ignition", value = "gradient:linear-gradient(90deg, #FF2E93 0%, #FF6200 100%)" },
    { name = "Synth Sunset", value = "gradient:linear-gradient(45deg, #F35588 0%, #05DFD7 100%)" },
    { name = "Toxic Camo", value = "gradient:linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
    { name = "Golden Crown", value = "gradient:linear-gradient(60deg, #F39C12 0%, #F1C40F 100%)" },
    { name = "Electric Storm", value = "gradient:linear-gradient(220deg, #00C6FF 0%, #0072FF 100%)" },
    { name = "Abyssal Void", value = "gradient:linear-gradient(180deg, #0f0c1b 0%, #302b63 50%, #24243e 100%)" },
    { name = "Crimson Drift", value = "gradient:linear-gradient(90deg, #e52d27 0%, #b31217 100%)" }
}

Config.PresetAvatars = {
    { name = "Racer Carbon", value = "https://raw.githubusercontent.com/SPiceZ21/spz-core-media-kit/main/Extra/nametag_profile.png" },
    { name = "Racer Red", value = "https://i.ibb.co/313zWqj/helmet-red.png" },
    { name = "Racer Blue", value = "https://i.ibb.co/qDxgS5j/helmet-blue.png" },
    { name = "Racer Gold", value = "https://i.ibb.co/F8bBfPy/helmet-gold.png" },
    { name = "Racer White", value = "https://i.ibb.co/C2rVnN1/helmet-white.png" }
}

