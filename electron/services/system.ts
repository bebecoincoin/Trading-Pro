import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function registerSystemHandlers() {
  // -------- Avatar : choisir un fichier image --------
  ipcMain.handle('system:pick-avatar', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const result = await dialog.showOpenDialog(win!, {
      title: 'Choisir un avatar',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
      ],
    });
    if (result.canceled || !result.filePaths.length) {
      return { ok: false, canceled: true };
    }
    const filePath = result.filePaths[0];
    try {
      const buf = await fs.readFile(filePath);
      // Limite 5 MB brut
      if (buf.byteLength > 5 * 1024 * 1024) {
        return { ok: false, error: 'Image trop lourde (max 5 MB).' };
      }
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mime =
        ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'png'
            ? 'image/png'
            : ext === 'webp'
              ? 'image/webp'
              : ext === 'gif'
                ? 'image/gif'
                : 'application/octet-stream';
      const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      return { ok: true, dataUrl, fileName: path.basename(filePath) };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Lecture impossible.' };
    }
  });
}
