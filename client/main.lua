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
    local rawName = p['spz:name'] or GetPlayerName(serverId) or "Racer"
    if rawName == "**INVALID**" then rawName = GetPlayerName(serverId) or "Racer" end
    if rawName == "**INVALID**" then rawName = "Racer" end

    local data = {
        name = rawName,
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
    lib.notify({ description = string.format("Nametags: %s", ShowNametags and "ENABLED" or "DISABLED"), type = ShowNametags and "info" or "warning" })
end)

if Config.Keybind.enabled then
    RegisterKeyMapping(Config.Keybind.command, Config.Keybind.description, "keyboard", Config.Keybind.key)
end

-- Performance Cache & Throttling
local PlayerVisibilityCache = {}

local function GetPlayerVisibility(serverId, ped, myPed, dist)
    if dist <= 5.0 then return true end

    local now = GetGameTimer()
    local cached = PlayerVisibilityCache[serverId]
    if cached and (now - cached.lastCheck < (Config.RaycastThrottle or 200)) then
        return cached.visible
    end

    local isVisible = HasEntityClearLosToEntity(myPed, ped, 17)
    PlayerVisibilityCache[serverId] = {
        visible = isVisible,
        lastCheck = now
    }
    return isVisible
end

local function GetVehicleName(ped)
    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then return nil end
    local model = GetEntityModel(veh)
    local modelName = GetDisplayNameFromVehicleModel(model)
    local label = GetLabelText(modelName)
    if label == "NULL" then
        return modelName
    else
        return label
    end
end

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
                            -- Optimized Raycast check with throttling
                            local isVisible = GetPlayerVisibility(serverId, ped, myPed, dist)

                            if isVisible then
                                -- Project world to screen
                                local offset = IsPedInAnyVehicle(ped, false) and 1.2 or 1.0
                                local onScreen, x, y = GetScreenCoordFromWorldCoord(pos.x, pos.y, pos.z + offset)

                                if onScreen then
                                    local scale = math.max(Config.ScaleMin, Config.ScaleMax - (dist / Config.RenderDistance) * (Config.ScaleMax - Config.ScaleMin))
                                    local opacity = 1.0
                                    if dist > Config.FadeDistance then
                                        opacity = 1.0 - ((dist - Config.FadeDistance) / (Config.RenderDistance - Config.FadeDistance))
                                    end

                                    local isTalking = MumbleIsPlayerTalking(player)

                                    -- Fetch vehicle details if driving
                                    local vehicleName = nil
                                    if Config.ShowVehicleName and IsPedInAnyVehicle(ped, false) then
                                        vehicleName = GetVehicleName(ped)
                                    end

                                    table.insert(payload, {
                                        id = serverId,
                                        x = x * 100,
                                        y = y * 100,
                                        scale = scale,
                                        opacity = opacity,
                                        isTalking = isTalking,
                                        distance = Config.ShowDistance and math.floor(dist) or nil,
                                        vehicleName = vehicleName,
                                        data = data
                                    })
                                end
                            end
                        end
                    end
                end
            end

            -- Self Nametag Update
            local myState = LocalPlayer.state['spz:state'] or "IDLE"
            if myState == "IDLE" or myState == "FREEROAM" then
                local myData = GetPlayerData(MyId)
                if myData then
                    SendNUIMessage({
                        action = "updateSelf",
                        payload = myData
                    })
                end
            else
                SendNUIMessage({
                    action = "updateSelf",
                    payload = nil
                })
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
