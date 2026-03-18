# Team To-Do App

Kollaborative To-Do Liste für Teams mit Prioritäten und Status-Tracking.

## Vercel Deployment

### 1. Repository auf GitHub pushen

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/team-todo-app.git
git push -u origin main
```

### 2. Auf Vercel importieren

1. Auf https://vercel.com mit GitHub einloggen
2. "Add New Project" → Repository auswählen
3. Import klicken

### 3. PostgreSQL Datenbank erstellen

1. Vercel Dashboard → **Storage** (oben im Menü)
2. **Create Database** klicken
3. **Neon Postgres** oder **Vercel Postgres** wählen
4. Region: Frankfurt (Europa) oder Washington (USA)
5. **Create** klicken

### 4. Datenbank verbinden

1. Nach der Erstellung: **Connect to Project**
2. Dein Projekt auswählen
3. Vercel fügt automatisch Umgebungsvariablen hinzu

### 5. WICHTIG: DATABASE_URL setzen

In Vercel:
1. **Settings** → **Environment Variables**
2. Suche nach `POSTGRES_PRISMA_URL`
3. Kopiere den Wert
4. Erstelle eine NEUE Variable:
   - Name: `DATABASE_URL`
   - Value: (kopierter Wert von `POSTGRES_PRISMA_URL`)
5. **Save**

### 6. Deploy!

Klicke auf **Deploy** und warte ca. 2-3 Minuten.

## Features

- ✅ Todos erstellen mit Titel und Beschreibung
- ✅ Priorität: Niedrig, Mittel, Hoch
- ✅ Status: ToDo, In Bearbeitung, Bugs, Komplett
- ✅ Klick auf Zeile zeigt Beschreibung
- ✅ Löschen mit Bestätigung
- ✅ Mobile-optimiert

## Lokale Entwicklung

```bash
npm install
npx prisma db push
npm run dev
```

## Probleme?

### "Fehler beim Erstellen des Todos"
- Prüfe ob `DATABASE_URL` korrekt gesetzt ist
- Der Wert muss mit `postgres://` oder `postgresql://` beginnen

### Build fehlerhaft?
- Prüfe die Build-Logs in Vercel
- Stelle sicher, dass alle Environment Variables gesetzt sind
