const container = document.getElementById('nametag-container');
const selfContainer = document.getElementById('self-nametag-container');
const nametags = new Map();
const editorScreen = document.getElementById('editor-screen');
const previewContainer = document.getElementById('editor-preview-container');

let currentData = null;
let previewElement = null;
let selfElement = null;

window.addEventListener('message', (event) => {
    const { action, payload, nametags: data, id } = event.data;

    if (action === 'update') {
        renderNametags(data);
    } else if (action === 'updateSelf') {
        renderSelfNametag(payload);
    } else if (action === 'clear') {
        clearAll();
    } else if (action === 'openEditor') {
        openEditor(payload);
    }
});

function openEditor(data) {
    currentData = data;
    document.getElementById('input-avatar').value = data.avatar || '';
    document.getElementById('input-banner').value = data.banner || '';
    
    editorScreen.style.display = 'flex';
    editorScreen.classList.add('active');
    
    updatePreview();
}

function updatePreview() {
    previewContainer.innerHTML = '';
    const tagData = {
        id: 'preview',
        x: 0, y: 0, scale: 1.0, opacity: 1,
        data: {
            ...currentData,
            avatar: document.getElementById('input-avatar').value,
            banner: document.getElementById('input-banner').value
        }
    };
    
    previewElement = createNametagElement('preview');
    previewContainer.appendChild(previewElement);
    updateNametagElement(previewElement, tagData, true);
}

// Input listeners for live preview
document.getElementById('input-avatar').addEventListener('input', updatePreview);
document.getElementById('input-banner').addEventListener('input', updatePreview);

document.getElementById('btn-fetch-discord').addEventListener('click', () => {
    fetch(`https://${GetParentResourceName()}/fetchDiscord`, {
        method: 'POST',
        body: JSON.stringify({})
    }).then(resp => resp.json()).then(data => {
        if (data.avatar) {
            document.getElementById('input-avatar').value = data.avatar;
            updatePreview();
        }
    });
});

document.getElementById('btn-save').addEventListener('click', () => {
    fetch(`https://${GetParentResourceName()}/saveNametag`, {
        method: 'POST',
        body: JSON.stringify({
            avatar: document.getElementById('input-avatar').value,
            banner: document.getElementById('input-banner').value
        })
    });
    closeEditor();
});

document.getElementById('btn-cancel').addEventListener('click', closeEditor);

function closeEditor() {
    editorScreen.style.display = 'none';
    editorScreen.classList.remove('active');
    fetch(`https://${GetParentResourceName()}/closeEditor`, { method: 'POST' });
}

function renderSelfNametag(data) {
    if (!data) {
        if (selfElement) {
            selfElement.remove();
            selfElement = null;
        }
        return;
    }

    if (!selfElement) {
        selfElement = createNametagElement('self');
        selfContainer.appendChild(selfElement);
    }

    const tagData = {
        id: 'self',
        x: 0, y: 0, scale: 1.0, opacity: 1,
        data: data
    };
    updateNametagElement(selfElement, tagData, true);
}

function renderNametags(data) {
    const activeIds = new Set();

    data.forEach((tag) => {
        activeIds.add(tag.id);
        let element = nametags.get(tag.id);

        if (!element) {
            element = createNametagElement(tag.id);
            nametags.set(tag.id, element);
            container.appendChild(element);
        }

        updateNametagElement(element, tag);
    });

    // Remove old nametags
    for (const [id, element] of nametags.entries()) {
        if (!activeIds.has(id)) {
            element.remove();
            nametags.delete(id);
        }
    }
}

function createNametagElement(id) {
    const el = document.createElement('div');
    el.className = id === 'self' ? '' : 'nametag';
    el.id = `nametag-${id}`;
    
    el.innerHTML = `
        <div class="nametag-card">
            <img class="nametag-banner" src="" style="display:none">
            <div class="nametag-content">
                <div class="nametag-avatar-container">
                    <img class="nametag-avatar" src="">
                    <div class="talking-indicator" style="display:none"></div>
                </div>
                <div class="nametag-details">
                    <div class="nametag-top">
                        <span class="nametag-crew"></span>
                        <span class="nametag-name"></span>
                    </div>
                    <div class="nametag-bottom">
                        <div class="nametag-license"></div>
                    </div>
                </div>
            </div>
            <div class="racing-glow" style="display:none"></div>
        </div>
    `;
    
    return el;
}
function updateNametagElement(el, tag, isStatic = false) {
    const { x, y, scale, opacity, data } = tag;

    if (!isStatic) {
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.opacity = opacity;
        el.style.transform = `translate(-50%, -100%) scale(${scale})`;
    }

    const nameEl = el.querySelector('.nametag-name');
    const crewEl = el.querySelector('.nametag-crew');
    const licenseEl = el.querySelector('.nametag-license');
    const avatarEl = el.querySelector('.nametag-avatar');
    const bannerImg = el.querySelector('.nametag-banner');
    const glow = el.querySelector('.racing-glow');
    const talking = el.querySelector('.talking-indicator');

    const nameValue = data.name || "Unknown";
    if (nameEl.textContent !== nameValue) nameEl.textContent = nameValue;
    
    if (data.crew) {
        crewEl.textContent = `[${data.crew}]`;
        crewEl.style.display = 'inline-block';
    } else {
        crewEl.style.display = 'none';
    }

    const licenseText = `${data.license || "D-5"}`;
    if (licenseEl.textContent !== licenseText) {
        licenseEl.textContent = licenseText;
        licenseEl.className = `nametag-license license-${data.licenseClass || "D"}`;
    }

    const avatarUrl = data.avatar || "https://i.imgur.com/8NzA8m8.png";
    if (avatarEl.src !== avatarUrl) avatarEl.src = avatarUrl;

    if (data.banner) {
        if (bannerImg.src !== data.banner) {
            bannerImg.src = data.banner;
            bannerImg.style.display = 'block';
        }
    } else {
        bannerImg.style.display = 'none';
    }

    if (talking) talking.style.display = tag.isTalking ? 'block' : 'none';
    glow.style.display = data.isRacing ? 'block' : 'none';
}

function clearAll() {
    nametags.forEach((el) => el.remove());
    nametags.clear();
    if (selfElement) {
        selfElement.remove();
        selfElement = null;
    }
}
