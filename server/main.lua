-- server/main.lua

-- Sync player data to state bags for efficient client access
local function SyncPlayerToState(source)
    local profile = exports["spz-identity"]:GetProfile(source)
    if not profile then return end

    local playerState = Player(source).state
    
    playerState:set('spz:name', profile.username or GetPlayerName(source), true)
    playerState:set('spz:crew', profile.crew_tag or "", true)
    playerState:set('spz:license', profile.rank or "D-5", true) -- rank is like D-5, C-1 etc
    playerState:set('spz:licenseClass', string.sub(profile.rank or "D", 1, 1), true)
    
    -- Profile picture and banner (URL based)
    -- These would ideally be stored in the profile. For now, using placeholders or falling back.
    playerState:set('spz:avatar', profile.avatar_url or Config.DefaultAvatar, true)
    playerState:set('spz:banner', profile.banner_url or Config.DefaultBanner, true)
    
    -- Race status (optional, can be updated by race modules)
    if not playerState.spz_is_racing then
        playerState:set('spz:is_racing', false, true)
    end
end

-- Listen for identity readiness
AddEventHandler("SPZ:playerReady", function(source, profile)
    SyncPlayerToState(source)
end)

-- Listen for manual updates (e.g. crew change, license promotion)
AddEventHandler("SPZ:syncProfile", function(source, changes)
    SyncPlayerToState(source)
end)

-- Save customized settings
RegisterNetEvent("spz-nametag:saveSettings", function(data)
    local source = source
    local profile = exports["spz-identity"]:GetProfile(source)
    if not profile then return end

    -- Update profile with new avatar and banner for persistence
    exports["spz-identity"]:UpdateProfile(source, {
        avatar_url = data.avatar,
        banner_url = data.banner
    })

    print(string.format("[spz-nametag] Saved customized settings for %s", GetPlayerName(source)))
end)

-- Discord Avatar Fetch Callback
exports['spz-lib']:RegisterCallback('spz-nametag:getDiscordAvatar', function(source, cb)
    local discordId = nil
    for i = 0, GetNumPlayerIdentifiers(source) - 1 do
        local id = GetPlayerIdentifier(source, i)
        if string.sub(id, 1, 8) == "discord:" then
            discordId = string.sub(id, 9)
            break
        end
    end

    if discordId then
        -- Using unavatar.io as a reliable proxy for Discord avatars
        local url = string.format("https://unavatar.io/discord/%s", discordId)
        cb(url)
    else
        cb(nil)
    end
end)

-- Initial sync for players already online (resource restart)
CreateThread(function()
    Wait(500)
    local players = GetPlayers()
    for _, src in ipairs(players) do
        SyncPlayerToState(tonumber(src))
    end
end)

-- Command to manually sync if needed (debug)
RegisterCommand("syncnametags", function(source, args)
    if source == 0 or IsPlayerAceAllowed(source, "command.syncnametags") then
        local target = tonumber(args[1]) or source
        if target > 0 then
            SyncPlayerToState(target)
            print("[spz-nametag] Synced state bags for " .. target)
        end
    end
end, true)
