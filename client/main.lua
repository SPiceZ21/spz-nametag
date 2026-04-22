-- client/main.lua

local ActiveNametags = {}
local ShowNametags = true
local MyId = GetPlayerServerId(PlayerId())

local PlayerDataCache = {}

local function GetPlayerData(serverId)
    if PlayerDataCache[serverId] and (GetGameTimer() - PlayerDataCache[serverId].lastUpdate < Config.DataRefreshInterval) then
        return PlayerDataCache[serverId].data
    end

    local p = Player(serverId).state
    if not p['spz:name'] then return nil end

    local data = {
        name = p['spz:name'],
        crew = p['spz:crew'],
        license = p['spz:license'],
        licenseClass = p['spz:licenseClass'],
        avatar = p['spz:avatar'],
        banner = p['spz:banner'],
        isRacing = p['spz:is_racing'] or false
    }

    PlayerDataCache[serverId] = {
        data = data,
        lastUpdate = GetGameTimer()
    }

    return data
end

-- Toggle command
RegisterCommand(Config.Keybind.command, function()
    ShowNametags = not ShowNametags
    if not ShowNametags then
        SendNUIMessage({ action = "clear" })
    end
    exports['spz-lib']:Notify(string.format("Nametags: %s", ShowNametags and "ENABLED" or "DISABLED"), ShowNametags and "info" or "warning")
end)

if Config.Keybind.enabled then
    RegisterKeyMapping(Config.Keybind.command, Config.Keybind.description, "keyboard", Config.Keybind.key)
end

-- Editor Command
RegisterCommand("editnametag", function()
    local data = GetPlayerData(MyId)
    if not data then return end
    
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openEditor",
        payload = data
    })
end)

-- NUI Callbacks
RegisterNUICallback("closeEditor", function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback("saveNametag", function(data, cb)
    SetNuiFocus(false, false)
    TriggerServerEvent("spz-nametag:saveSettings", data)
    cb('ok')
end)

RegisterNUICallback("fetchDiscord", function(data, cb)
    -- We'll call a server event to get the discord avatar
    -- Since we can't do it directly here, we use a callback
    exports['spz-lib']:TriggerCallback('spz-nametag:getDiscordAvatar', function(avatar)
        cb({ avatar = avatar })
    end)
end)

-- Main Render Loop
CreateThread(function()
    while true do
        local wait = 500
        if ShowNametags then
            wait = Config.UpdateInterval
            
            local myPed = PlayerPedId()
            local myPos = GetEntityCoords(myPed)
            local players = GetActivePlayers()
            local payload = {}

            for _, player in ipairs(players) do
                local serverId = GetPlayerServerId(player)
                
                if serverId ~= MyId then
                    local ped = GetPlayerPed(player)
                    local pos = GetEntityCoords(ped)
                    local dist = #(myPos - pos)

                    if dist < Config.RenderDistance then
                        local data = GetPlayerData(serverId)
                        
                        if data then
                            -- Visibility check (Raycast) - Throttled for performance
                            local isVisible = true
                            if dist > 5.0 then -- Always show if very close
                                isVisible = HasEntityClearLosToEntity(myPed, ped, 17)
                            end

                            if isVisible then
                                -- Project world to screen
                                -- Offset for vehicle or head
                                local offset = IsPedInAnyVehicle(ped, false) and 1.2 or 1.0
                                local onScreen, x, y = GetScreenCoordFromWorldCoord(pos.x, pos.y, pos.z + offset)

                                if onScreen then
                                    local scale = math.max(Config.ScaleMin, Config.ScaleMax - (dist / Config.RenderDistance) * (Config.ScaleMax - Config.ScaleMin))
                                    local opacity = 1.0
                                    if dist > Config.FadeDistance then
                                        opacity = 1.0 - ((dist - Config.FadeDistance) / (Config.RenderDistance - Config.FadeDistance))
                                    end

                                    local isTalking = MumbleIsPlayerTalking(player)

                                    table.insert(payload, {
                                        id = serverId,
                                        x = x * 100,
                                        y = y * 100,
                                        scale = scale,
                                        opacity = opacity,
                                        isTalking = isTalking,
                                        data = data
                                    })
                                end
                            end
                        end
                    end
                end
            end

            SendNUIMessage({
                action = "update",
                nametags = payload
            })
        end
        Wait(wait)
    end
end)

-- State Bag Listeners for real-time updates
AddStateBagChangeHandler('spz:name', nil, function(bagName, key, value)
    local src = tonumber(bagName:gsub('player:', ''))
    if PlayerDataCache[src] then PlayerDataCache[src].lastUpdate = 0 end
end)

AddStateBagChangeHandler('spz:license', nil, function(bagName, key, value)
    local src = tonumber(bagName:gsub('player:', ''))
    if PlayerDataCache[src] then PlayerDataCache[src].lastUpdate = 0 end
end)

-- Debug Mode
if Config.Debug then
    CreateThread(function()
        while true do
            Wait(1000)
            print(string.format("[spz-nametag] Rendering %d tags", #ActiveNametags))
        end
    end)
end
