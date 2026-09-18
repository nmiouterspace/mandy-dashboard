Mandy English Google Drive Sync

This setup lets the GitHub Pages app read and write one shared JSON data file in your Google Drive.

Setup:

1. Open https://script.google.com/
2. Create a new project.
3. Copy everything from Code.gs into the Apps Script editor.
4. Change SYNC_PASSWORD to a private password only your staff should know.
5. Click Deploy > New deployment.
6. Choose type: Web app.
7. Execute as: Me.
8. Who has access: Anyone with the link.
9. Click Deploy, allow Google Drive permissions, then copy the Web App URL.
10. Open Mandy Dashboard > Dashboard > Google Drive Sync.
11. Paste the Web App URL and the same sync password.
12. Click Save sync settings.
13. In Apps Script, select the function installDailyBackupTrigger.
14. Click Run once and allow permissions. This installs the daily backup job.

Daily workflow:

- At the start of work: click Load from Drive.
- After editing important data: click Save to Drive.
- Before risky changes: ask admin to make an extra backup if needed.

Important:

- GitHub Pages stores the app/code.
- Google Drive stores the shared data file named mandy-dashboard-data.json.
- The sync password is saved only in each browser's local storage.
- Every Save to Drive creates a timestamped backup in the folder "Mandy English Dashboard Backups".
- The automatic backup job creates one extra backup every day around 04:00.
- Google Apps Script time triggers run near the selected hour, not always exactly at 04:00.
- Backups older than 365 days are moved to trash during Save to Drive or the daily backup job.
