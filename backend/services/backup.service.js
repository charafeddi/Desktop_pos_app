const fs = require('fs');
const path = require('path');

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function formatTimestamp(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

function quoteSqlitePath(filePath) {
    // Use single quotes and escape internal single quotes by doubling
    return `'${filePath.replace(/'/g, "''")}'`;
}

function createBackupNow(db, dbPath, backupsDir) {
    ensureDirExists(backupsDir);
    const timestamp = formatTimestamp();
    const backupFile = path.join(backupsDir, `pos_backup_${timestamp}.db`);
    const quoted = quoteSqlitePath(backupFile);
    db.exec(`VACUUM INTO ${quoted}`);
    return backupFile;
}

function getExistingBackups(backupsDir) {
    if (!fs.existsSync(backupsDir)) return [];
    return fs.readdirSync(backupsDir)
        .filter(f => f.endsWith('.db'))
        .map(f => ({ file: f, fullPath: path.join(backupsDir, f), mtime: fs.statSync(path.join(backupsDir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime);
}

function pruneOldBackups(backupsDir, retentionCount) {
    const backups = getExistingBackups(backupsDir);
    const toDelete = backups.slice(retentionCount);
    for (const b of toDelete) {
        try { fs.unlinkSync(b.fullPath); } catch {}
    }
}

function didCreateBackupToday(backupsDir) {
    const backups = getExistingBackups(backupsDir);
    if (backups.length === 0) return false;
    const today = new Date();
    const latest = backups[0].mtime;
    return latest.getFullYear() === today.getFullYear() &&
           latest.getMonth() === today.getMonth() &&
           latest.getDate() === today.getDate();
}

function setupDatabaseBackups(db, dbPath, backupsDir, retentionCount = 7) {
    ensureDirExists(backupsDir);

    try {
        if (!didCreateBackupToday(backupsDir)) {
            const file = createBackupNow(db, dbPath, backupsDir);
            pruneOldBackups(backupsDir, retentionCount);
            console.log('Created daily database backup at startup:', file);
        }
    } catch (e) {
        console.error('Backup at startup failed:', e);
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    setInterval(() => {
        try {
            const file = createBackupNow(db, dbPath, backupsDir);
            pruneOldBackups(backupsDir, retentionCount);
            console.log('Created scheduled daily database backup:', file);
        } catch (e) {
            console.error('Scheduled backup failed:', e);
        }
    }, oneDayMs);

    return {
        createBackupNow: () => {
            const file = createBackupNow(db, dbPath, backupsDir);
            pruneOldBackups(backupsDir, retentionCount);
            return file;
        }
    };
}

module.exports = {
    setupDatabaseBackups,
    createBackupNow,
};


