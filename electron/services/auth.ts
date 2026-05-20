import { ipcMain, BrowserWindow, shell } from 'electron';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as http from 'node:http';
import * as crypto from 'node:crypto';
import { getDb } from './db';
import { sendVerificationEmail } from './mailer';
import { env } from './env';

function secret() {
  return env('JWT_SECRET', 'dev-insecure-secret-change-me-in-production');
}

function makeToken(userId: number) {
  return jwt.sign({ sub: userId, iat: Date.now() }, secret(), { expiresIn: '30d' });
}

function verifyToken(token: string): { sub: number } | null {
  try {
    const decoded = jwt.verify(token, secret()) as unknown as { sub: number };
    if (decoded && typeof decoded.sub === 'number') return decoded;
    return null;
  } catch {
    return null;
  }
}

function userToPublic(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    publicId: u.public_id,
    email: u.email,
    username: u.username,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    provider: u.provider,
    verified: !!u.verified,
    createdAt: u.created_at,
  };
}

export function getUserIdFromToken(token: string): number | null {
  const decoded = verifyToken(token);
  return decoded?.sub ?? null;
}

export function registerAuthHandlers() {
  // -------- Register --------
  ipcMain.handle('auth:register', async (_e, data: any) => {
    const { email, password, username } = data || {};
    if (!email || !password || !username) {
      return { ok: false, error: 'Champs requis manquants.' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'Mot de passe trop court (min. 8).' };
    }
    const db = getDb();
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return { ok: false, error: 'Cet email est deja utilise.' };

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = ('' + Math.floor(100000 + Math.random() * 900000));
    const publicId = crypto.randomUUID();
    const now = Date.now();
    const result = db
      .prepare(
        `INSERT INTO users (public_id, email, username, password_hash, provider, verified, verification_token, created_at)
         VALUES (?, ?, ?, ?, 'local', 0, ?, ?)`
      )
      .run(publicId, email, username, hash, verifyToken, now);

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (err) {
      console.error('mail error', err);
    }

    const token = makeToken(result.lastInsertRowid as number);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    return { ok: true, token, user: userToPublic(user) };
  });

  // -------- Login --------
  ipcMain.handle('auth:login', async (_e, data: any) => {
    const { email, password } = data || {};
    if (!email || !password) return { ok: false, error: 'Champs requis.' };
    const db = getDb();
    const u: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!u || !u.password_hash) return { ok: false, error: 'Identifiants invalides.' };
    const valid = await bcrypt.compare(password, u.password_hash);
    if (!valid) return { ok: false, error: 'Identifiants invalides.' };

    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(Date.now(), u.id);
    const token = makeToken(u.id);
    return { ok: true, token, user: userToPublic(u) };
  });

  // -------- Verify Email --------
  ipcMain.handle('auth:verify-email', async (_e, token: string) => {
    const db = getDb();
    const u: any = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
    if (!u) return { ok: false, error: 'Code invalide.' };
    db.prepare('UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?').run(u.id);
    return { ok: true };
  });

  // -------- Resend Verification --------
  ipcMain.handle('auth:resend-verification', async (_e, email: string) => {
    const db = getDb();
    const u: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!u) return { ok: false, error: 'Aucun utilisateur.' };
    if (u.verified) return { ok: false, error: 'Compte deja verifie.' };
    const newToken = ('' + Math.floor(100000 + Math.random() * 900000));
    db.prepare('UPDATE users SET verification_token = ? WHERE id = ?').run(newToken, u.id);
    await sendVerificationEmail(email, newToken);
    return { ok: true };
  });

  // -------- Me --------
  ipcMain.handle('auth:me', async (_e, token: string) => {
    const decoded = verifyToken(token);
    if (!decoded) return { ok: false };
    const db = getDb();
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.sub);
    if (!u) return { ok: false };
    return { ok: true, user: userToPublic(u) };
  });

  // -------- Update Profile --------
  ipcMain.handle('auth:update-profile', async (_e, payload: any) => {
    const { token, data } = payload || {};
    const decoded = verifyToken(token);
    if (!decoded) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    const fields: string[] = [];
    const values: any[] = [];
    if (data.username) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }
    if (data.bio !== undefined) {
      fields.push('bio = ?');
      values.push(data.bio);
    }
    if (!fields.length) return { ok: true };
    values.push(decoded.sub);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.sub);
    return { ok: true, user: userToPublic(u) };
  });

  // -------- Logout --------
  ipcMain.handle('auth:logout', async () => ({ ok: true }));

  // -------- Google OAuth --------
  ipcMain.handle('auth:google-signin', async () => {
    const clientId = env('GOOGLE_CLIENT_ID');
    const clientSecret = env('GOOGLE_CLIENT_SECRET');
    const redirectUri = env('GOOGLE_REDIRECT_URI', 'http://localhost:53682/oauth2callback');
    if (!clientId || !clientSecret) {
      return {
        ok: false,
        error:
          'Google OAuth non configure. Renseigne GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET dans .env.',
      };
    }

    return new Promise((resolve) => {
      const state = crypto.randomBytes(16).toString('hex');
      const server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url!, redirectUri);
          if (!url.pathname.startsWith('/oauth2callback')) {
            res.writeHead(404).end();
            return;
          }
          const code = url.searchParams.get('code');
          const stateBack = url.searchParams.get('state');
          if (!code || stateBack !== state) {
            res.writeHead(400).end('Bad state');
            return;
          }
          // Echange du code contre un token
          const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          });
          const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          const tokenJson: any = await tokenResp.json();
          const profileResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` },
          });
          const profile: any = await profileResp.json();

          const db = getDb();
          let u: any = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.email);
          if (!u) {
            const publicId = crypto.randomUUID();
            const r = db
              .prepare(
                `INSERT INTO users (public_id, email, username, provider, avatar_url, verified, created_at)
                 VALUES (?, ?, ?, 'google', ?, 1, ?)`
              )
              .run(publicId, profile.email, profile.name || profile.email.split('@')[0], profile.picture, Date.now());
            u = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid);
          } else {
            db.prepare('UPDATE users SET provider = ?, avatar_url = ?, verified = 1, last_login = ? WHERE id = ?')
              .run('google', profile.picture, Date.now(), u.id);
            u = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id);
          }
          const jwtToken = makeToken(u.id);

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html><body style="background:#0a0d14;color:#e6e9ef;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
              <div style="text-align:center"><h1 style="color:#22d3ee">Connecte!</h1><p>Tu peux fermer cet onglet et revenir dans Trading Pro.</p></div>
            </body></html>`);

          // Focus la fenetre principale
          const win = BrowserWindow.getAllWindows()[0];
          if (win) win.focus();
          server.close();
          resolve({ ok: true, token: jwtToken, user: userToPublic(u) });
        } catch (err: any) {
          res.writeHead(500).end('Error');
          server.close();
          resolve({ ok: false, error: err?.message || 'Erreur OAuth' });
        }
      });

      const portUrl = new URL(redirectUri);
      const port = portUrl.port ? parseInt(portUrl.port, 10) : 53682;
      server.listen(port, () => {
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'openid email profile');
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        shell.openExternal(authUrl.toString());
      });

      setTimeout(() => {
        try {
          server.close();
        } catch {}
        resolve({ ok: false, error: 'Timeout OAuth (2 min).' });
      }, 120000);
    });
  });
}
