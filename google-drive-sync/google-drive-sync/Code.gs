const FILE_NAME = "mandy-dashboard-data.json";
const BACKUP_FOLDER_NAME = "Mandy English Dashboard Backups";
const SYNC_PASSWORD = "CHANGE_THIS_PASSWORD";
const BACKUP_RETENTION_DAYS = 365;
const DAILY_BACKUP_HOUR = 4;

function doPost(event) {
  let requestId = "";

  try {
    const body = parseRequestBody(event);
    requestId = body.requestId || "";

    if (body.token !== SYNC_PASSWORD) {
      return syncResponse({ ok: false, error: "Wrong sync password." }, requestId);
    }

    if (body.action === "load") {
      return loadData(requestId);
    }

    if (body.action === "save") {
      return saveData(body.payload, requestId);
    }

    return syncResponse({ ok: false, error: "Unknown sync action." }, requestId);
  } catch (error) {
    return syncResponse({ ok: false, error: String(error && error.message ? error.message : error) }, requestId);
  }
}

function parseRequestBody(event) {
  if (event && event.parameter && event.parameter.request) {
    return JSON.parse(event.parameter.request);
  }

  return JSON.parse((event && event.postData && event.postData.contents) || "{}");
}

function loadData(requestId) {
  const file = getMainFile();
  if (!file) {
    return syncResponse({ ok: false, error: "No Mandy dashboard data file exists yet. Save to Drive first." }, requestId);
  }

  const saved = JSON.parse(file.getBlob().getDataAsString("UTF-8"));
  return syncResponse({
    ok: true,
    data: saved.data || saved,
    exportedAt: saved.exportedAt || "",
    updatedAt: file.getLastUpdated().toISOString()
  }, requestId);
}

function saveData(payload, requestId) {
  if (!payload || !payload.data || !Array.isArray(payload.data.students) || !Array.isArray(payload.data.classes)) {
    return syncResponse({ ok: false, error: "Invalid Mandy dashboard data." }, requestId);
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
  return syncResponse({
    ok: true,
    savedAt: new Date().toISOString()
  }, requestId);
}

function runDailyBackup() {
  const file = getMainFile();
  if (!file) {
    return;
  }

  createBackup(file, "daily");
  deleteOldBackups();
}

function installDailyBackupTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === "runDailyBackup")
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("runDailyBackup")
    .timeBased()
    .everyDays(1)
    .atHour(DAILY_BACKUP_HOUR)
    .create();
}

function getMainFile() {
  const files = DriveApp.getFilesByName(FILE_NAME);
  return files.hasNext() ? files.next() : null;
}

function getBackupFolder() {
  const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
}

function createBackup(file, type) {
  const folder = getBackupFolder();
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
  const backupType = type ? `${type}-` : "";
  folder.createFile(`mandy-dashboard-${backupType}backup-${stamp}.json`, file.getBlob().getDataAsString("UTF-8"), MimeType.PLAIN_TEXT);
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

function syncResponse(payload, requestId) {
  if (!requestId) {
    return jsonResponse(payload);
  }

  return htmlResponse({
    source: "mandy-drive-sync",
    requestId,
    ...payload
  });
}

function htmlResponse(payload) {
  const message = JSON.stringify(payload).replace(/</g, "\\u003c");
  const html = `<!doctype html><html><body><script>window.parent.postMessage(${message}, "*");</script></body></html>`;

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
