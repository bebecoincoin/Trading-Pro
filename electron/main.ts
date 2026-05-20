import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { registerAuthHandlers } from './services/auth';
import { registerMarketHandlers } from './services/markets';
import { registerPortfolioHandlers } from './services/portfolio';
import { registerPaperTradingHandlers } from './services/paperTrading';
import { registerSystemHandlers } from './services/system';
import { initDatabase } from './services/db';
import { loadEnv } from './services/env';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0a0d14',
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Liens externes ouverts dans le navigateur systeme
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  loadEnv();

  // Repertoire de donnees utilisateur
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

  await initDatabase(path.join(userDataPath, 'trading-pro.db'));

  registerAuthHandlers();
  registerMarketHandlers();
  registerPortfolioHandlers();
  registerPaperTradingHandlers();
  registerSystemHandlers();

  // Petits utilitaires IPC
  ipcMain.handle('app:open-external', (_e, url: string) => shell.openExternal(url));
  ipcMain.handle('app:version', () => app.getVersion());

  // Expose la config Supabase au renderer (lue depuis .env)
  ipcMain.handle('app:supabase-config', () => ({
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  }));

  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
