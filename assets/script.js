// --- Configuración inicial ---
const APPS_STORAGE_KEY = 'installed_apps';

// Apps preinstaladas (ruta relativa a la carpeta /apps/)
const DEFAULT_APPS = [
    { id: 'calc', name: 'Calculadora', icon: '🧮', path: 'apps/calculadora.html' },
    { id: 'notes', name: 'Notas', icon: '📝', path: 'apps/notas.html' }
];

// Cargar apps desde almacenamiento o usar default
let installedApps = [];

function loadApps() {
    const stored = localStorage.getItem(APPS_STORAGE_KEY);
    if (stored) {
        try {
            installedApps = JSON.parse(stored);
        } catch(e) {
            installedApps = [...DEFAULT_APPS];
        }
    } else {
        installedApps = [...DEFAULT_APPS];
        saveApps();
    }
}

function saveApps() {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(installedApps));
}

// --- Renderizar escritorio ---
function renderDesktop() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';
    installedApps.forEach(app => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'app-icon';
        iconDiv.innerHTML = `
            <div class="icon-emoji">${app.icon}</div>
            <div class="app-name">${app.name}</div>
        `;
        iconDiv.onclick = () => launchApp(app.path);
        desktop.appendChild(iconDiv);
    });
}

// --- Lanzar app en iframe ---
function launchApp(path) {
    const win = document.getElementById('app-window');
    const frame = document.getElementById('app-frame');
    const title = document.getElementById('window-title');
    
    // Buscar nombre de la app para el título
    const app = installedApps.find(a => a.path === path);
    title.textContent = app ? app.name : 'Aplicación';
    
    frame.src = path;
    win.classList.remove('hidden');
}

function closeApp() {
    const win = document.getElementById('app-window');
    const frame = document.getElementById('app-frame');
    frame.src = ''; // Detener ejecución
    win.classList.add('hidden');
}

// --- Instalar nueva app desde archivo local ---
function openInstaller() {
    // Verificar soporte para File System Access API
    if (!('showOpenFilePicker' in window)) {
        alert('Tu navegador no soporta selección de archivos. Usa Chrome 86+ en Android.');
        return;
    }
    
    document.getElementById('file-input').click();
}

// Manejar selección de archivo
document.getElementById('file-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar extensión .html o .htm
    if (!file.name.match(/\.(html?)$/i)) {
        alert('Solo se permiten archivos HTML');
        return;
    }
    
    // Pedir nombre e icono al usuario
    const appName = prompt('Nombre de la aplicación:', file.name.replace(/\.html?$/i, ''));
    if (!appName) return;
    
    const appIcon = prompt('Emoji para el icono:', '📄');
    if (!appIcon) return;
    
    // Crear URL de objeto para el archivo (válida mientras la página esté abierta)
    const fileURL = URL.createObjectURL(file);
    
    // Añadir a la lista
    const newApp = {
        id: 'app_' + Date.now(),
        name: appName,
        icon: appIcon,
        path: fileURL,   // Guardamos la URL blob
        isBlob: true
    };
    
    installedApps.push(newApp);
    saveApps();
    renderDesktop();
    
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
});

// --- Reloj en barra de estado ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// --- Inicialización ---
loadApps();
renderDesktop();

// Cerrar app si se presiona botón atrás (en móvil)
window.addEventListener('popstate', (e) => {
    if (!document.getElementById('app-window').classList.contains('hidden')) {
        closeApp();
        history.pushState(null, null, location.href); // evitar salir de la página
    }
});
history.pushState(null, null, location.href);

