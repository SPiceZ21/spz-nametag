const container = document.getElementById('nametag-container');
const nametags = new Map();
const editorScreen = document.getElementById('editor-screen');
const previewContainer = document.getElementById('editor-preview-container');

let currentData = null;
let previewElement = null;

window.addEventListener('message', (event) => {
    const { action, nametags: data, payload } = event.data;

    if (action === 'update') {
        renderNametags(data);
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
        x: 50, y: 50, scale: 1.2, opacity: 1,
        data: {
            ...currentData,
            avatar: document.getElementById('input-avatar').value,
            banner: document.getElementById('input-banner').value
        }
    };
    
    previewElement = createNametagElement('preview');
    previewElement.style.position = 'relative';
    previewElement.style.left = '0';
    previewElement.style.top = '0';
    previewElement.style.transform = 'scale(1.2)';
    
    previewContainer.appendChild(previewElement);
    updateNametagElement(previewElement, tagData);
}

// Input listeners for live preview
document.getElementById('input-avatar').addEventListener('input', updatePreview);
document.getElementById('input-banner').addEventListener('input', updatePreview);

document.getElementById('btn-fetch-discord').addEventListener('click', () => {
    // Send request to client to get discord avatar
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
    el.className = 'nametag new';
    el.id = `nametag-${id}`;
    
    el.innerHTML = `
        <div class="nametag-wrapper">
            <img class="nametag-banner" src="" style="display:none">
            <img class="nametag-avatar" src="https://i.imgur.com/8NzA8m8.png">
            <div class="nametag-info">
                <div class="nametag-top">
                    <span class="nametag-name"></span>
                    <span class="nametag-crew"></span>
                </div>
                <span class="nametag-license"></span>
            </div>
            <div class="voice-indicator" style="display:none">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </div>
            <div class="racing-glow" style="display:none"></div>
        </div>
    `;
    
    return el;
}

function updateNametagElement(el, tag) {
    const { x, y, scale, opacity, data } = tag;

    // Position and scale
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.opacity = opacity;
    el.style.transform = `translate(-50%, -100%) scale(${scale})`;

    // Content
    const nameEl = el.querySelector('.nametag-name');
    const crewEl = el.querySelector('.nametag-crew');
    const licenseEl = el.querySelector('.nametag-license');
    const avatarEl = el.querySelector('.nametag-avatar');
    const bannerImg = el.querySelector('.nametag-banner');
    const glow = el.querySelector('.racing-glow');
    const voice = el.querySelector('.voice-indicator');

    if (nameEl.textContent !== data.name) nameEl.textContent = data.name;
    
    if (data.crew) {
        crewEl.textContent = data.crew;
        crewEl.style.display = 'block';
    } else {
        crewEl.style.display = 'none';
    }

    const licenseText = `${data.licenseClass} CLASS • ${data.license}`;
    if (licenseEl.textContent !== licenseText) {
        licenseEl.textContent = licenseText;
        licenseEl.className = `nametag-license license-${data.licenseClass}`;
    }

    if (avatarEl.src !== data.avatar) avatarEl.src = data.avatar;

    if (data.banner) {
        if (bannerImg.src !== data.banner) {
            bannerImg.src = data.banner;
            bannerImg.style.display = 'block';
        }
    } else {
        bannerImg.style.display = 'none';
    }

    voice.style.display = tag.isTalking ? 'flex' : 'none';
    glow.style.display = data.isRacing ? 'block' : 'none';
}

function clearAll() {
    nametags.forEach((el) => el.remove());
    nametags.clear();
}
