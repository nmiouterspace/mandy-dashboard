const FILE_NAME = "mandy-dashboard-data.json";
const BACKUP_FOLDER_NAME = "Mandy English Dashboard Backups";
const SYNC_PASSWORD = "CHANGE_THIS_PASSWORD";
const BACKUP_RETENTION_DAYS = 90;

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || "{}");
    if (body.token !== SYNC_PASSWORD) {
      return jsonResponse({ ok: false, error: "Wrong sync password." });
    }

    if (body.action === "load") {
      return loadData();
    }

    if (body.action === "save") {
      return saveData(body.payload);
    }

    return jsonResponse({ ok: false, error: "Unknown sync action." });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function loadData() {
  const file = getMainFile();
  if (!file) {
    return jsonResponse({ ok: false, error: "No Mandy dashboard data file exists yet. Save to Drive first." });
  }

  const saved = JSON.parse(file.getBlob().getDataAsString("UTF-8"));
  return jsonResponse({
    ok: true,
    data: saved.data || saved,
    exportedAt: saved.exportedAt || "",
    updatedAt: file.getLastUpdated().toISOString()
  });
}

function saveData(payload) {
  if (!payload || !payload.data || !Array.isArray(payload.data.students) || !Array.isArray(payload.data.classes)) {
    return jsonResponse({ ok: false, error: "Invalid Mandy dashboard data." });
  }

  const file = getMainFile();
  const content = JSON.stringify(payload, null, 2);

  if (file) {
    createBackup(file);
    file.setContent(content);
  } else {
    DriveApp.createFile(FILE_NAME, content, MimeType.PLAIN_TEXT);
  }

  deleteOldBackups();
  return jsonResponse({
    ok: true,
    savedAt: new Date().toISOString()
  });
}

function getMainFile() {
  const files = DriveApp.getFilesByName(FILE_NAME);
  return files.hasNext() ? files.next() : null;
}

function getBackupFolder() {
  const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
}

function createBackup(file) {
  const folder = getBackupFolder();
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
  folder.createFile(`mandy-dashboard-backup-${stamp}.json`, file.getBlob().getDataAsString("UTF-8"), MimeType.PLAIN_TEXT);
}

function deleteOldBackups() {
  const folder = getBackupFolder();
  const cutoff = new Date(Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < cutoff) {
      file.setTrashed(true);
    }
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
