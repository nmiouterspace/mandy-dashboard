const storageKey = "mandyEnglishStudentSystem";

const prePaymentHistoryBackupKey = "mandyEnglishStudentSystemBackupBeforePaymentHistory20260701";
const driveSyncSettingsKey = "mandyEnglishDriveSyncSettings";
const userAccountsKey = "mandyEnglishUserAccounts";
const activeUserKey = "mandyEnglishActiveUser";
const themePreferenceKey = "mandyEnglishThemePreference";
const sidebarCollapsedKey = "mandyEnglishSidebarCollapsed";
const preClassRenameBackupKey = "mandyEnglishStudentSystemBackupBeforeClassRename20260722";

const defaultUserAccounts = [
  { username: "nmi.outerspace", passwordHash: "3e5b730759f524643d2b17b78ffdfae836ae709d87b6a8a3e6d0594b52e6915c", role: "admin", mustResetPassword: false },
  { username: "PChau", passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", role: "teacher", mustResetPassword: true },
  { username: "NChau", passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", role: "staff", mustResetPassword: true }
];

const roleLabels = {
  admin: "Admin",
  teacher: "Teacher",
  staff: "Staff"
};

const rolePermissions = {
  admin: {
    tabs: ["scheduleTab", "dashboardTab", "financeTab", "studentsTab", "classesTab", "attendanceTab", "lessonLogTab", "studentProgressTab", "tuitionSlipTab"],
    actions: ["all"]
  },
  teacher: {
    tabs: ["scheduleTab", "attendanceTab", "lessonLogTab", "studentProgressTab"],
    actions: ["schedule.view", "schedule.teacher", "schedule.done", "attendance.view", "attendance.edit", "lessonLog.view", "lessonLog.edit", "studentProgress.view"]
  },
  staff: {
    tabs: ["scheduleTab", "dashboardTab", "studentsTab", "classesTab", "attendanceTab", "lessonLogTab", "studentProgressTab", "tuitionSlipTab"],
    actions: ["schedule.view", "schedule.teacher", "schedule.done", "students.view", "students.edit", "payments.edit", "classes.view", "classes.edit", "attendance.view", "attendance.note", "lessonLog.view", "lessonLog.edit", "studentProgress.view", "tuitionSlip.view", "tuitionSlip.edit", "drive.load", "drive.settings"]
  }
};

const starterData = {
  students: [
    {
      name: "Anna Nguyen",
      className: "Kids Starters",
      contact: "0901 234 567",
      paymentType: "Monthly",
      lessonsDone: 6,
      lastPaymentDate: "2026-06-01",
      nextDueDate: "2026-07-01",
      status: "Active"
    },
    {
      name: "Ben Tran",
      className: "Teen Speaking",
      contact: "0912 555 888",
      paymentType: "Course",
      lessonsDone: 22,
      lastPaymentDate: "2026-05-15",
      nextDueDate: "2026-07-15",
      status: "Temporary pause"
    },
    {
      name: "Linh Pham",
      className: "IELTS Foundation",
      contact: "linh@example.com",
      paymentType: "Monthly",
      lessonsDone: 8,
      lastPaymentDate: "2026-04-20",
      nextDueDate: "2026-05-20",
      status: "Stopped"
    }
  ],
  classes: [
    {
      name: "Kids Starters",
      students: "Anna Nguyen, Minh Do",
      schedule: "Mon, 18:00-19:00 | Wed, 18:00-19:00"
    },
    {
      name: "Teen Speaking",
      students: "Ben Tran, Nhi Le",
      schedule: "Tue, 19:00-20:00 | Thu, 19:00-20:00"
    },
    {
      name: "IELTS Foundation",
      students: "Linh Pham",
      schedule: "Sat, 09:00-10:00 | Sun, 09:00-10:00"
    }
  ]
};

backupLocalStorageDataOnce();
let data = loadData();
normalizeData();
let currentUser = loadActiveUser();
const recoveredTransferredAttendanceOnLoad = recoverTransferredStudentAttendance();
syncClassStudents();
applyUserRecordUpdates();
const recoveredTransferredAttendanceAfterUpdates = recoverTransferredStudentAttendance();
syncClassStudents();
if (recoveredTransferredAttendanceOnLoad || recoveredTransferredAttendanceAfterUpdates) saveData(false);
let editingStudentIndex = null;
let editingScheduleIndex = null;
let legacyTeachersRecovered = false;
const editingAttendanceRows = new Set();
const noteEditingAttendanceRows = new Set();
const attendanceCycleViews = new Map();
let isTuitionFollowupActive = false;

const studentRows = document.querySelector("#studentRows");
const classRows = document.querySelector("#classRows");
const stoppedClassRows = document.querySelector("#stoppedClassRows");
const weeklySchedule = document.querySelector("#weeklySchedule");
const attendanceBoard = document.querySelector("#attendanceBoard");
const classOptions = document.querySelector("#classOptions");
const filterClass = document.querySelector("#filterClass");
const classListFilter = document.querySelector("#classListFilter");
const attendanceClassFilter = document.querySelector("#attendanceClassFilter");
const filterStatus = document.querySelector("#filterStatus");
const tuitionFollowupButton = document.querySelector("#tuitionFollowupButton");
const activeCount = document.querySelector("#activeCount");
const activeClassCount = document.querySelector("#activeClassCount");
const pauseCount = document.querySelector("#pauseCount");
const stoppedCount = document.querySelector("#stoppedCount");
const financeViewMode = document.querySelector("#financeViewMode");
const financeDate = document.querySelector("#financeDate");
const financeStartField = document.querySelector("#financeStartField");
const financeEndField = document.querySelector("#financeEndField");
const financeStartDate = document.querySelector("#financeStartDate");
const financeEndDate = document.querySelector("#financeEndDate");
const financeToday = document.querySelector("#financeToday");
const financeRevenueLabel = document.querySelector("#financeRevenueLabel");
const financeCostLabel = document.querySelector("#financeCostLabel");
const financeProjectedLabel = document.querySelector("#financeProjectedLabel");
const financeDailyRevenue = document.querySelector("#financeDailyRevenue");
const financeDailyCost = document.querySelector("#financeDailyCost");
const financeNetProfit = document.querySelector("#financeNetProfit");
const financeCompletedLessons = document.querySelector("#financeCompletedLessons");
const financeProjectedRevenue = document.querySelector("#financeProjectedRevenue");
const navFinanceNetProfit = document.querySelector("#navFinanceNetProfit");
const financeDetailTitle = document.querySelector("#financeDetailTitle");
const financeProjectedTitle = document.querySelector("#financeProjectedTitle");
const financeClassFeeRows = document.querySelector("#financeClassFeeRows");
const financeRevenueRows = document.querySelector("#financeRevenueRows");
const financeProjectedRows = document.querySelector("#financeProjectedRows");
const assistantMessages = document.querySelector("#assistantMessages");
const assistantForm = document.querySelector("#assistantForm");
const assistantInput = document.querySelector("#assistantInput");
const toast = document.querySelector("#toast");
const mobileScheduleList = document.querySelector("#mobileScheduleList");
const exportBackup = document.querySelector("#exportBackup");
const importBackup = document.querySelector("#importBackup");
const importBackupFile = document.querySelector("#importBackupFile");
const loadDriveData = document.querySelector("#loadDriveData");
const saveDriveData = document.querySelector("#saveDriveData");
const loadDriveDataDashboard = document.querySelector("#loadDriveDataDashboard");
const saveDriveDataDashboard = document.querySelector("#saveDriveDataDashboard");
const saveDriveSettings = document.querySelector("#saveDriveSettings");
const driveSyncUrl = document.querySelector("#driveSyncUrl");
const driveSyncToken = document.querySelector("#driveSyncToken");
const driveSyncStatus = document.querySelector("#driveSyncStatus");
const themeToggle = document.querySelector("#themeToggle");
const currentUserPill = document.querySelector("#currentUserPill");
const resetOwnPassword = document.querySelector("#resetOwnPassword");
const signOut = document.querySelector("#signOut");
const authOverlay = document.querySelector("#authOverlay");
const loginForm = document.querySelector("#loginForm");
const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");
const passwordResetModal = document.querySelector("#passwordResetModal");
const passwordResetForm = document.querySelector("#passwordResetForm");
const newPassword = document.querySelector("#newPassword");
const confirmNewPassword = document.querySelector("#confirmNewPassword");
const passwordResetError = document.querySelector("#passwordResetError");
const studentModal = document.querySelector("#studentModal");
const studentForm = document.querySelector("#studentForm");
const newStudentClassSelect = document.querySelector("#newStudentClassSelect");
const newStudentClassNew = document.querySelector("#newStudentClassNew");
const newClassField = document.querySelector("#newClassField");
const newStudentPayment = document.querySelector("#newStudentPayment");
const newStudentDiscount = document.querySelector("#newStudentDiscount");
const newStudentTotalLessons = document.querySelector("#newStudentTotalLessons");
const newStudentPaidLessons = document.querySelector("#newStudentPaidLessons");
const discountField = document.querySelector("#discountField");
const deleteStudentModal = document.querySelector("#deleteStudentModal");
const paymentModal = document.querySelector("#paymentModal");
const paymentForm = document.querySelector("#paymentForm");
const paymentStudentSummary = document.querySelector("#paymentStudentSummary");
const paymentDate = document.querySelector("#paymentDate");
const paymentPackage = document.querySelector("#paymentPackage");
const paymentLessons = document.querySelector("#paymentLessons");
const paymentNote = document.querySelector("#paymentNote");
const paymentHistoryList = document.querySelector("#paymentHistoryList");
const scheduleModal = document.querySelector("#scheduleModal");
const scheduleForm = document.querySelector("#scheduleForm");
const scheduleRows = document.querySelector("#scheduleRows");
const attendanceDateModal = document.querySelector("#attendanceDateModal");
const attendanceDateInput = document.querySelector("#attendanceDateInput");
const lessonLogBoard = document.querySelector("#lessonLogBoard");
const lessonLogClassFilter = document.querySelector("#lessonLogClassFilter");
const lessonLogTeacherFilter = document.querySelector("#lessonLogTeacherFilter");
const lessonLogDateFilter = document.querySelector("#lessonLogDateFilter");
const lessonLogModal = document.querySelector("#lessonLogModal");
const lessonLogForm = document.querySelector("#lessonLogForm");
const lessonLogModalTitle = document.querySelector("#lessonLogModalTitle");
const lessonLogSessionSummary = document.querySelector("#lessonLogSessionSummary");
const lessonLogTaught = document.querySelector("#lessonLogTaught");
const lessonLogHomework = document.querySelector("#lessonLogHomework");
const lessonLogNote = document.querySelector("#lessonLogNote");
const lessonLogStudentNotes = document.querySelector("#lessonLogStudentNotes");
const progressStudentSelect = document.querySelector("#progressStudentSelect");
const progressRangeFilter = document.querySelector("#progressRangeFilter");
const progressPerformanceFilter = document.querySelector("#progressPerformanceFilter");
const studentProgressBoard = document.querySelector("#studentProgressBoard");
const copyParentDraft = document.querySelector("#copyParentDraft");
const tuitionStudentSelect = document.querySelector("#tuitionStudentSelect");
const tuitionStudentName = document.querySelector("#tuitionStudentName");
const tuitionCourseName = document.querySelector("#tuitionCourseName");
const tuitionPackage = document.querySelector("#tuitionPackage");
const tuitionStartDate = document.querySelector("#tuitionStartDate");
const tuitionEndDate = document.querySelector("#tuitionEndDate");
const tuitionCourseFee = document.querySelector("#tuitionCourseFee");
const tuitionDiscount = document.querySelector("#tuitionDiscount");
const tuitionTotalFee = document.querySelector("#tuitionTotalFee");
const tuitionDueDate = document.querySelector("#tuitionDueDate");
const tuitionComment = document.querySelector("#tuitionComment");
const printTuitionSlip = document.querySelector("#printTuitionSlip");
const slipStudentName = document.querySelector("#slipStudentName");
const slipCourseName = document.querySelector("#slipCourseName");
const slipPackage = document.querySelector("#slipPackage");
const slipStartDate = document.querySelector("#slipStartDate");
const slipEndDate = document.querySelector("#slipEndDate");
const slipCourseFee = document.querySelector("#slipCourseFee");
const slipDiscount = document.querySelector("#slipDiscount");
const slipTotalFee = document.querySelector("#slipTotalFee");
const slipDueDate = document.querySelector("#slipDueDate");
const slipComment = document.querySelector("#slipComment");
const slipQrPreview = document.querySelector("#slipQrPreview");
const scheduleWeekSelect = document.querySelector("#scheduleWeekSelect");
const scheduleWeekNote = document.querySelector("#scheduleWeekNote");
const previousWeek = document.querySelector("#previousWeek");
const nextWeek = document.querySelector("#nextWeek");
const currentWeek = document.querySelector("#currentWeek");
const mobileTabsToggle = document.querySelector("#mobileTabsToggle");
const mobileAccountToggle = document.querySelector("#mobileAccountToggle");
const sidebarToggle = document.querySelector("#sidebarToggle");
const accountDropdown = document.querySelector("#accountDropdown");
const mobileNav = document.createElement("nav");
const mobileMoreSheet = document.createElement("div");
const mobileHomePanel = document.createElement("section");
let selectedWeekStart = getWeekStart(new Date());
let mobileScheduleDayIndex = null;
let editingAttendanceCell = null;
let pendingLessonLogSession = null;
let editingPaymentStudentIndex = null;

applyTheme(getSavedTheme());
applySidebarState(getSavedSidebarState());

document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    showTab(button.dataset.tab);
    closeMobileMenus();
  });
});

mobileTabsToggle.addEventListener("click", () => toggleMobileMenu("tabs"));
mobileAccountToggle.addEventListener("click", () => toggleMobileMenu("account"));
sidebarToggle.addEventListener("click", toggleSidebar);
themeToggle.addEventListener("click", toggleTheme);
currentUserPill.addEventListener("click", event => {
  event.stopPropagation();
  toggleAccountMenu();
});
accountDropdown.addEventListener("click", event => {
  if (event.target.closest("button")) closeAccountMenu();
});
mobileNav.className = "mobile-bottom-nav";
mobileNav.setAttribute("aria-label", "Mobile navigation");
mobileMoreSheet.className = "mobile-more-sheet";
mobileMoreSheet.setAttribute("aria-hidden", "true");
mobileHomePanel.id = "mobileHomeTab";
mobileHomePanel.className = "mobile-home-panel tab-panel";
mobileHomePanel.setAttribute("aria-label", "Mobile home setup board");
document.querySelector("main")?.append(mobileHomePanel);
document.body.append(mobileNav, mobileMoreSheet);
document.addEventListener("click", event => {
  if (document.body.classList.contains("account-menu-open") && !event.target.closest(".account-menu")) {
    closeAccountMenu();
  }

  if (!document.body.classList.contains("mobile-more-open")) return;
  if (mobileMoreSheet.contains(event.target) || mobileNav.contains(event.target)) return;
  closeMobileMore();
});

document.querySelector("#addStudent").addEventListener("click", () => openStudentModal());
document.querySelector("#clearFilters").addEventListener("click", clearStudentFilters);
document.querySelector("#printSchedule").addEventListener("click", () => {
  showTab("scheduleTab");
  window.print();
});
document.querySelector("#exportScheduleCsv").addEventListener("click", exportScheduleCsv);
scheduleWeekSelect.addEventListener("change", event => {
  selectedWeekStart = parseDateValue(event.target.value);
  mobileScheduleDayIndex = null;
  renderWeeklySchedule();
  renderAttendanceBoard();
});
scheduleWeekNote.addEventListener("input", saveScheduleWeekNote);
previousWeek.addEventListener("click", () => shiftSelectedWeek(-1));
nextWeek.addEventListener("click", () => shiftSelectedWeek(1));
currentWeek.addEventListener("click", () => {
  selectedWeekStart = getWeekStart(new Date());
  mobileScheduleDayIndex = null;
  renderWeekOptions();
  renderWeeklySchedule();
  renderAttendanceBoard();
});
financeDate.value = formatDateValue(new Date());
financeStartDate.value = formatDateValue(getWeekStart(new Date()));
financeEndDate.value = formatDateValue(new Date());
financeViewMode.addEventListener("change", () => {
  updateFinanceRangeFields();
  renderFinance();
});
[financeDate, financeStartDate, financeEndDate].forEach(input => {
  input.addEventListener("change", renderFinance);
});
financeToday.addEventListener("click", () => {
  applyFinanceQuickRange("today");
});
document.querySelectorAll("[data-finance-range]").forEach(button => {
  button.addEventListener("click", () => applyFinanceQuickRange(button.dataset.financeRange));
});
document.querySelector("#closeStudentModal").addEventListener("click", closeStudentModal);
document.querySelector("#cancelStudentModal").addEventListener("click", closeStudentModal);
deleteStudentModal.addEventListener("click", deleteEditingStudent);
studentModal.addEventListener("click", event => {
  if (event.target === studentModal) closeStudentModal();
});
document.querySelector("#closePaymentModal").addEventListener("click", closePaymentModal);
document.querySelector("#cancelPaymentModal").addEventListener("click", closePaymentModal);
paymentModal.addEventListener("click", event => {
  if (event.target === paymentModal) closePaymentModal();
});
paymentPackage.addEventListener("change", updatePaymentLessonDefault);
document.querySelector("#closeScheduleModal").addEventListener("click", closeScheduleModal);
document.querySelector("#cancelScheduleModal").addEventListener("click", closeScheduleModal);
document.querySelector("#addScheduleSlot").addEventListener("click", () => addSchedulePickerRow());
document.querySelector("#stopClassSchedule").addEventListener("click", stopEditingClass);
scheduleModal.addEventListener("click", event => {
  if (event.target === scheduleModal) closeScheduleModal();
});
document.querySelector("#closeAttendanceDateModal").addEventListener("click", closeAttendanceDateModal);
document.querySelector("#cancelAttendanceDate").addEventListener("click", closeAttendanceDateModal);
document.querySelector("#applyAttendanceDate").addEventListener("click", applyAttendanceDateFromModal);
document.querySelector("#clearAttendanceDate").addEventListener("click", clearAttendanceDateFromModal);
attendanceDateModal.addEventListener("click", event => {
  if (event.target === attendanceDateModal) closeAttendanceDateModal();
});
document.querySelector("#closeLessonLogModal").addEventListener("click", closeLessonLogModal);
document.querySelector("#cancelLessonLogModal").addEventListener("click", closeLessonLogModal);
lessonLogModal.addEventListener("click", event => {
  if (event.target === lessonLogModal) closeLessonLogModal();
});

studentForm.addEventListener("submit", event => {
  event.preventDefault();
  addStudentFromForm();
});

scheduleForm.addEventListener("submit", event => {
  event.preventDefault();
  saveScheduleFromPicker();
});

newStudentClassSelect.addEventListener("change", updateNewClassField);
newStudentPayment.addEventListener("change", () => {
  updateDiscountField();
  updateLessonDefaults(false);
});
[filterClass, filterStatus].forEach(filter => {
  filter.addEventListener("input", renderStudents);
  filter.addEventListener("change", renderStudents);
});
tuitionFollowupButton.addEventListener("click", toggleTuitionFollowup);
classListFilter.addEventListener("change", renderClasses);
attendanceClassFilter.addEventListener("change", renderAttendanceBoard);
[lessonLogClassFilter, lessonLogTeacherFilter, lessonLogDateFilter].forEach(filter => {
  filter.addEventListener("input", renderLessonLogs);
  filter.addEventListener("change", renderLessonLogs);
});
document.querySelector("#clearLessonLogFilters").addEventListener("click", clearLessonLogFilters);
[progressStudentSelect, progressRangeFilter, progressPerformanceFilter].forEach(filter => {
  filter.addEventListener("change", renderStudentProgress);
});
copyParentDraft.addEventListener("click", copyCurrentParentDraft);
tuitionStudentSelect.addEventListener("change", () => renderTuitionSlip(true));
[tuitionStudentName, tuitionCourseName, tuitionPackage, tuitionStartDate, tuitionEndDate, tuitionCourseFee, tuitionDiscount, tuitionTotalFee, tuitionDueDate, tuitionComment].forEach(input => {
  input.addEventListener("input", () => renderTuitionSlip(false));
});
[tuitionCourseName, tuitionPackage, tuitionStartDate].forEach(input => {
  input.addEventListener("change", () => {
    const student = data.students[Number(tuitionStudentSelect.value)];
    applyTuitionAutoFields(student, { updateEndDate: true, updateFees: true });
    renderTuitionSlip(false);
  });
});
[tuitionCourseFee, tuitionDiscount].forEach(input => {
  input.addEventListener("change", () => {
    applyTuitionTotalFromFee();
    renderTuitionSlip(false);
  });
});
printTuitionSlip.addEventListener("click", printTuitionSlipPreview);
assistantForm.addEventListener("submit", event => {
  event.preventDefault();
  handleAssistantMessage();
});

lessonLogForm.addEventListener("submit", event => {
  event.preventDefault();
  saveLessonLogAndCompleteSession();
});

paymentForm.addEventListener("submit", event => {
  event.preventDefault();
  saveStudentPayment();
});

document.querySelector("#saveData").addEventListener("click", () => saveData(true));
exportBackup.addEventListener("click", exportDataBackup);
importBackup.addEventListener("click", () => importBackupFile.click());
importBackupFile.addEventListener("change", importDataBackup);
loadDriveData.addEventListener("click", loadDataFromDrive);
saveDriveData.addEventListener("click", saveDataToDrive);
loadDriveDataDashboard.addEventListener("click", loadDataFromDrive);
saveDriveDataDashboard.addEventListener("click", saveDataToDrive);
saveDriveSettings.addEventListener("click", saveDriveSyncSettings);
loginForm.addEventListener("submit", event => {
  event.preventDefault();
  signInUser();
});
signOut.addEventListener("click", signOutUser);
resetOwnPassword.addEventListener("click", () => openPasswordResetModal(false));
passwordResetForm.addEventListener("submit", event => {
  event.preventDefault();
  saveOwnPassword();
});

document.querySelector("#resetData").addEventListener("click", () => {
  const confirmed = window.confirm("Reset all data to the original sample data?");
  if (!confirmed) return;
  data = structuredClone(starterData);
  normalizeData();
  syncClassStudents();
  saveData(true);
  render();
});

function getUserAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(userAccountsKey) || "null");
    if (Array.isArray(saved) && saved.length) {
      const accounts = migrateUserAccounts(normalizeUserAccounts(saved));
      localStorage.setItem(userAccountsKey, JSON.stringify(accounts));
      return accounts;
    }
  } catch {
    // Fall through to default accounts.
  }

  const accounts = normalizeUserAccounts(defaultUserAccounts);
  localStorage.setItem(userAccountsKey, JSON.stringify(accounts));
  return accounts;
}

function normalizeUserAccounts(accounts) {
  return accounts
    .map(account => ({
      username: String(account.username || "").trim(),
      password: account.password === undefined ? "" : String(account.password),
      passwordHash: String(account.passwordHash || ""),
      role: rolePermissions[account.role] ? account.role : "staff",
      mustResetPassword: account.mustResetPassword !== false
    }))
    .filter(account => account.username);
}

function migrateUserAccounts(accounts) {
  const adminAccount = defaultUserAccounts[0];
  const cleanedAccounts = accounts.filter(account => normalizeSearchText(account.username) !== "minh");
  const existingAdmin = cleanedAccounts.find(account => normalizeSearchText(account.username) === normalizeSearchText(adminAccount.username));

  if (existingAdmin) {
    existingAdmin.password = "";
    existingAdmin.passwordHash = adminAccount.passwordHash;
    existingAdmin.role = "admin";
    existingAdmin.mustResetPassword = false;
  } else {
    cleanedAccounts.unshift({ ...adminAccount });
  }

  return normalizeUserAccounts(cleanedAccounts);
}

function saveUserAccounts(accounts) {
  localStorage.setItem(userAccountsKey, JSON.stringify(normalizeUserAccounts(accounts)));
}

function loadActiveUser() {
  try {
    const username = localStorage.getItem(activeUserKey);
    if (!username) return null;
    const account = findUserAccount(username);
    return account ? { username: account.username, role: account.role } : null;
  } catch {
    return null;
  }
}

function findUserAccount(username) {
  const normalizedUsername = normalizeSearchText(username);
  return getUserAccounts().find(account => normalizeSearchText(account.username) === normalizedUsername) || null;
}

async function signInUser() {
  const account = findUserAccount(loginUsername.value);
  const isPasswordValid = account ? await verifyAccountPassword(account, loginPassword.value) : false;

  if (!account || !isPasswordValid) {
    loginError.textContent = "Wrong account or password.";
    return;
  }

  currentUser = { username: account.username, role: account.role };
  localStorage.setItem(activeUserKey, account.username);
  loginPassword.value = "";
  loginError.textContent = "";
  render();
  showTab(window.matchMedia?.("(max-width: 760px)").matches ? getInitialMobileTabForRole() : getInitialTabForRole());
  showToast(`Signed in as ${account.username}`);

  if (account.mustResetPassword || account.password === "123") {
    openPasswordResetModal(true);
  }
}

async function verifyAccountPassword(account, password) {
  if (account.passwordHash) {
    return account.passwordHash === await hashPassword(password);
  }

  return account.password === password;
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function signOutUser() {
  currentUser = null;
  localStorage.removeItem(activeUserKey);
  closeAccountMenu();
  applyRoleUi();
  closeAllModals();
}

function openPasswordResetModal(isRequired) {
  passwordResetModal.dataset.required = isRequired ? "true" : "false";
  passwordResetModal.classList.add("open");
  passwordResetModal.setAttribute("aria-hidden", "false");
  passwordResetError.textContent = "";
  newPassword.value = "";
  confirmNewPassword.value = "";
  newPassword.focus();
}

function closePasswordResetModal() {
  passwordResetModal.classList.remove("open");
  passwordResetModal.setAttribute("aria-hidden", "true");
  passwordResetModal.dataset.required = "false";
}

function saveOwnPassword() {
  if (!currentUser) return;
  const password = newPassword.value.trim();
  const confirmedPassword = confirmNewPassword.value.trim();

  if (password.length < 4) {
    passwordResetError.textContent = "Password must have at least 4 characters.";
    return;
  }

  if (password === "123") {
    passwordResetError.textContent = "Please choose a password different from 123.";
    return;
  }

  if (password !== confirmedPassword) {
    passwordResetError.textContent = "Passwords do not match.";
    return;
  }

  const accounts = getUserAccounts();
  const account = accounts.find(user => normalizeSearchText(user.username) === normalizeSearchText(currentUser.username));
  if (!account) return;

  account.password = password;
  account.passwordHash = "";
  account.mustResetPassword = false;
  saveUserAccounts(accounts);
  closePasswordResetModal();
  showToast("Password updated");
}

function can(action) {
  if (!currentUser) return false;
  const permissions = rolePermissions[currentUser.role]?.actions || [];
  return permissions.includes("all") || permissions.includes(action);
}

function canOpenTab(tabId) {
  if (!currentUser) return false;
  return (rolePermissions[currentUser.role]?.tabs || []).includes(tabId);
}

function getInitialTabForRole() {
  return rolePermissions[currentUser?.role]?.tabs?.[0] || "scheduleTab";
}

function getInitialMobileTabForRole() {
  return canOpenTab("scheduleTab") ? "scheduleTab" : getInitialTabForRole();
}

function applyRoleUi() {
  const isSignedIn = Boolean(currentUser);
  authOverlay.classList.toggle("open", !isSignedIn);
  authOverlay.setAttribute("aria-hidden", isSignedIn ? "true" : "false");

  currentUserPill.hidden = !isSignedIn;
  resetOwnPassword.classList.toggle("role-hidden", !isSignedIn);
  signOut.classList.toggle("role-hidden", !isSignedIn);

  if (isSignedIn) {
    currentUserPill.innerHTML = `${currentUser.username}<span>${roleLabels[currentUser.role] || currentUser.role}</span>`;
  }

  document.querySelectorAll(".tab-button").forEach(button => {
    button.classList.toggle("role-hidden", !canOpenTab(button.dataset.tab));
  });

  setActionVisible("#saveData", can("all"));
  const canUseDriveSync = can("drive.load") || can("drive.save") || can("drive.settings") || can("all");

  setActionVisible("#importBackup", false);
  setActionVisible("#exportBackup", can("all"));
  setActionVisible("#loadDriveData", can("drive.load") || can("all"));
  setActionVisible("#saveDriveData", can("drive.save") || can("all"));
  setActionVisible("#saveDriveSettings", can("drive.settings") || can("all"));
  setActionVisible("#loadDriveDataDashboard", can("drive.load") || can("all"));
  setActionVisible("#saveDriveDataDashboard", can("drive.save") || can("all"));
  setActionVisible(".drive-sync-panel", canUseDriveSync);
  setActionVisible("#addStudent", can("students.edit"));
  setActionVisible("#deleteStudentModal", can("all"));
  setActionVisible("#stopClassSchedule", can("classes.edit") || can("all"));

  if (isSignedIn) {
    const activePanel = document.querySelector(".tab-panel.active");
    const isMobileHome = activePanel?.id === "mobileHomeTab";
    const isMobile = window.matchMedia?.("(max-width: 760px)").matches;
    if (isMobile && (!activePanel || !activePanel.classList.contains("active"))) {
      showTab(getInitialMobileTabForRole());
    } else if (!activePanel || (!isMobileHome && !canOpenTab(activePanel.id))) {
      showTab(isMobile ? getInitialMobileTabForRole() : getInitialTabForRole());
    }
  } else {
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  }

  renderMobileNavigation();
}

function setActionVisible(selector, isVisible) {
  document.querySelectorAll(selector).forEach(element => {
    element.classList.toggle("role-hidden", !isVisible);
  });
}

function closeAllModals() {
  document.querySelectorAll(".modal-backdrop.open").forEach(modal => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
}

function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(starterData);

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(starterData);
  }
}

function backupLocalStorageDataOnce() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved || localStorage.getItem(prePaymentHistoryBackupKey)) return;
    localStorage.setItem(prePaymentHistoryBackupKey, saved);
  } catch {
    // Backup is best-effort; the app should still open if localStorage is restricted.
  }
}

function backupBeforeClassRenameOnce() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved || localStorage.getItem(preClassRenameBackupKey)) return;
    localStorage.setItem(preClassRenameBackupKey, saved);
  } catch {
    // Backup is best-effort; renaming should still work if localStorage is restricted.
  }
}

function normalizeData() {
  data.students = (data.students || []).map(student => {
    const paymentType = normalizePaymentType(student.paymentType);

    return {
      name: repairVietnameseText(student.name || ""),
      className: repairVietnameseText(student.className || ""),
      contact: repairVietnameseText(student.contact || ""),
      paymentType,
      discountPercent: normalizeDiscountPercent(student.discountPercent),
      lessonsDone: Number.isFinite(Number(student.lessonsDone)) ? Number(student.lessonsDone) : 0,
      totalLessons: normalizeTotalLessons(student.totalLessons, paymentType),
      paidLessons: normalizePaidLessons(student.paidLessons, student.totalLessons, paymentType),
      lastPaymentDate: student.lastPaymentDate || "",
      nextDueDate: student.nextDueDate || "",
      status: student.status || "Active",
      paymentHistory: normalizePaymentHistory(student.paymentHistory)
    };
  });

  data.classes = (data.classes || []).map(classItem => ({
    name: repairVietnameseText(classItem.name || ""),
    students: repairVietnameseText(classItem.students || ""),
    schedule: normalizeSchedule(repairVietnameseText(classItem.schedule || "")),
    status: classItem.status === "Stopped" ? "Stopped" : "Active",
    statusHistory: normalizeClassStatusHistory(classItem.statusHistory)
  }));

  data.teachers = data.teachers && typeof data.teachers === "object" ? data.teachers : {};
  data.attendance = data.attendance && typeof data.attendance === "object" ? data.attendance : {};
  data.attendanceNotes = data.attendanceNotes && typeof data.attendanceNotes === "object" ? normalizeAttendanceNotes(data.attendanceNotes) : {};
  data.completedSessions = data.completedSessions && typeof data.completedSessions === "object" ? data.completedSessions : {};
  data.lessonLogs = Array.isArray(data.lessonLogs) ? data.lessonLogs.map(normalizeLessonLog).filter(Boolean) : [];
  data.migrations = data.migrations && typeof data.migrations === "object" ? data.migrations : {};
  data.scheduleHistory = data.scheduleHistory && typeof data.scheduleHistory === "object" ? data.scheduleHistory : {};
  data.scheduleNotes = data.scheduleNotes && typeof data.scheduleNotes === "object" ? normalizeScheduleNotes(data.scheduleNotes) : {};
  data.tuitionSlip = data.tuitionSlip && typeof data.tuitionSlip === "object" ? data.tuitionSlip : {};
  data.tuitionSlip.qrImage = typeof data.tuitionSlip.qrImage === "string" ? data.tuitionSlip.qrImage : "";
  data.finance = data.finance && typeof data.finance === "object" ? data.finance : {};
  data.finance.classFees = data.finance.classFees && typeof data.finance.classFees === "object" ? normalizeMoneyMap(data.finance.classFees) : {};
  data.finance.sessionCosts = data.finance.sessionCosts && typeof data.finance.sessionCosts === "object" ? normalizeMoneyMap(data.finance.sessionCosts) : {};
  data.finance.sessionStudents = data.finance.sessionStudents && typeof data.finance.sessionStudents === "object" ? normalizeFinanceSessionStudents(data.finance.sessionStudents) : {};
}

function normalizeMoneyMap(source) {
  return Object.entries(source || {}).reduce((normalized, [key, value]) => {
    const amount = parseMoneyValue(value);
    if (amount > 0) normalized[key] = amount;
    return normalized;
  }, {});
}

function normalizeFinanceSessionStudents(source) {
  return Object.entries(source || {}).reduce((normalized, [sessionKey, students]) => {
    if (!Array.isArray(students)) return normalized;

    const cleanStudents = students
      .map(student => ({
        name: repairVietnameseText(student.name || ""),
        paymentType: normalizePaymentType(student.paymentType || "Monthly")
      }))
      .filter(student => student.name);

    if (cleanStudents.length) normalized[sessionKey] = cleanStudents;
    return normalized;
  }, {});
}

function normalizeAttendanceNotes(notes) {
  return Object.entries(notes || {}).reduce((normalizedNotes, [key, value]) => {
    const text = repairVietnameseText(String(value || "").trim());
    if (text) normalizedNotes[key] = text;
    return normalizedNotes;
  }, {});
}

function normalizeScheduleNotes(notes) {
  return Object.entries(notes || {}).reduce((normalizedNotes, [weekValue, value]) => {
    const normalizedWeek = normalizeDateInput(weekValue);
    if (!normalizedWeek) return normalizedNotes;

    const text = repairVietnameseText(String(value || "").trim());
    if (text) normalizedNotes[normalizedWeek] = text;
    return normalizedNotes;
  }, {});
}

function recoverTransferredStudentAttendance() {
  const studentNameCounts = data.students.reduce((counts, student) => {
    const key = normalizeSearchText(student.name);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
  let recovered = false;

  data.students.forEach(student => {
    const normalizedName = normalizeSearchText(student.name);
    if (!normalizedName || studentNameCounts.get(normalizedName) !== 1) return;

    const oldClassNames = getAttendanceClassesForStudentName(student.name)
      .filter(className => normalizeSearchText(className) !== normalizeSearchText(student.className));

    oldClassNames.forEach(oldClassName => {
      migrateStudentLinkedRecords(
        { name: student.name, className: oldClassName },
        student
      );
      recovered = true;
    });
  });

  return recovered;
}

function getAttendanceClassesForStudentName(studentName) {
  const normalizedStudentName = normalizeSearchText(studentName);
  const classNames = new Set();

  Object.keys(data.attendance || {}).forEach(key => {
    const parts = key.split("|");
    if (parts.length < 6) return;
    if (normalizeSearchText(parts[4]) !== normalizedStudentName) return;
    if (parts[1]) classNames.add(parts[1]);
  });

  Object.keys(data.attendanceNotes || {}).forEach(key => {
    const parts = key.split("|");
    if (parts.length < 3) return;
    if (normalizeSearchText(parts[1]) !== normalizedStudentName) return;
    if (parts[0]) classNames.add(parts[0]);
  });

  return [...classNames];
}

function normalizeLessonLog(log) {
  if (!log || typeof log !== "object") return null;
  const sessionKey = String(log.sessionKey || "").trim();
  const className = repairVietnameseText(log.className || "");
  const date = log.date || "";

  if (!sessionKey || !className || !date) return null;

  return {
    sessionKey,
    date,
    className,
    day: log.day || "",
    startTime: log.startTime || "",
    endTime: log.endTime || "",
    teacher: repairVietnameseText(log.teacher || ""),
    taught: repairVietnameseText(log.taught || ""),
    homework: repairVietnameseText(log.homework || ""),
    note: repairVietnameseText(log.note || ""),
    studentNotes: Array.isArray(log.studentNotes)
      ? log.studentNotes.map(note => ({
        studentName: repairVietnameseText(note.studentName || ""),
        performance: note.performance || "Good",
        note: repairVietnameseText(note.note || "")
      })).filter(note => note.studentName)
      : [],
    createdAt: log.createdAt || date,
    updatedAt: log.updatedAt || log.createdAt || date
  };
}

function normalizePaymentHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map((record, index) => {
      if (!record || typeof record !== "object") return null;
      const packageName = record.package || record.paymentType || "Monthly";
      const lessons = normalizePaymentRecordLessons(record.lessons, packageName);
      return {
        date: record.date || "",
        package: packageName,
        cycleIndex: Number.isFinite(Number(record.cycleIndex)) ? Number(record.cycleIndex) : index,
        lessons,
        note: repairVietnameseText(record.note || ""),
        createdAt: record.createdAt || ""
      };
    })
    .filter(record => record && record.date);
}

function normalizePaymentRecordLessons(value, packageName) {
  const lessons = Math.floor(Number(value));
  if (Number.isFinite(lessons) && lessons > 0) return lessons;
  if (packageName === "Course" || packageName === "Course Dis (%)") return 24;
  return 8;
}

function normalizeClassStatusHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(entry => entry && entry.effectiveFrom)
    .map(entry => ({
      effectiveFrom: entry.effectiveFrom,
      status: entry.status === "Stopped" ? "Stopped" : "Active"
    }))
    .sort((first, second) => first.effectiveFrom.localeCompare(second.effectiveFrom));
}

function saveData(showMessage) {
  localStorage.setItem(storageKey, JSON.stringify(data));
  if (showMessage) showToast();
}

function loadDriveSyncSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(driveSyncSettingsKey) || "{}");
    driveSyncUrl.value = saved.url || "";
    driveSyncToken.value = saved.token || "";
    updateDriveSyncStatus(saved.lastSyncAt ? `Last sync: ${formatShortDateTime(saved.lastSyncAt)}` : "Ready to connect");
  } catch {
    updateDriveSyncStatus("Local data only");
  }
}

function getDriveSyncSettings() {
  return {
    url: driveSyncUrl.value.trim(),
    token: driveSyncToken.value.trim()
  };
}

function saveDriveSyncSettings() {
  if (!can("drive.settings") && !can("all")) {
    window.alert("Your account cannot update Drive sync settings.");
    return;
  }

  const settings = getDriveSyncSettings();
  if (!settings.url || !settings.token) {
    window.alert("Please enter both the Google Apps Script URL and sync password.");
    return;
  }

  localStorage.setItem(driveSyncSettingsKey, JSON.stringify(settings));
  updateDriveSyncStatus("Sync settings saved");
  showToast("Drive sync settings saved");
}

async function loadDataFromDrive() {
  if (!can("drive.load") && !can("all")) {
    window.alert("Your account cannot load data from Drive.");
    return;
  }

  const settings = getDriveSyncSettings();
  if (!ensureDriveSyncSettings(settings)) return;

  const confirmed = window.confirm(
    "Load data from Google Drive?\n\nThis will replace the current data in this browser. A local safety backup will be kept before importing."
  );
  if (!confirmed) return;

  try {
    setDriveButtonsBusy(true);
    updateDriveSyncStatus("Loading from Drive...");
    const response = await sendDriveSyncRequest(settings, { action: "load" });
    const importedData = response?.data;

    if (!isValidBackupData(importedData)) {
      window.alert("The Google Drive file does not look like Mandy English data.");
      updateDriveSyncStatus("Drive data is not valid");
      return;
    }

    backupCurrentDataBeforeImport();
    data = importedData;
    normalizeData();
    syncClassStudents();
    saveData(false);
    render();
    rememberDriveSync(settings);
    updateDriveSyncStatus(`Loaded: ${formatShortDateTime(new Date().toISOString())}`);
    showToast("Loaded from Drive");
  } catch (error) {
    window.alert(`Cannot load from Google Drive.\n\n${error.message || "Please check the Web App URL and sync password."}`);
    updateDriveSyncStatus("Load failed");
  } finally {
    setDriveButtonsBusy(false);
  }
}

async function saveDataToDrive() {
  if (!can("drive.save") && !can("all")) {
    window.alert("Your account cannot save shared data to Drive.");
    return;
  }

  const settings = getDriveSyncSettings();
  if (!ensureDriveSyncSettings(settings)) return;

  const confirmed = window.confirm(
    "Save current data to Google Drive?\n\nThis will overwrite the shared Mandy English data file on Drive."
  );
  if (!confirmed) return;

  try {
    setDriveButtonsBusy(true);
    updateDriveSyncStatus("Saving to Drive...");
    await sendDriveSyncRequest(settings, {
      action: "save",
      payload: {
        app: "Mandy English Student Management",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        storageKey,
        data
      }
    });
    rememberDriveSync(settings);
    updateDriveSyncStatus(`Saved: ${formatShortDateTime(new Date().toISOString())}`);
    showToast("Saved to Drive");
  } catch (error) {
    window.alert(`Cannot save to Google Drive.\n\n${error.message || "Please check the Web App URL and sync password."}`);
    updateDriveSyncStatus("Save failed");
  } finally {
    setDriveButtonsBusy(false);
  }
}

function ensureDriveSyncSettings(settings) {
  if (!settings.url || !settings.token) {
    window.alert("Please enter the Google Apps Script URL and sync password in Dashboard > Google Drive Sync first.");
    showTab("dashboardTab");
    driveSyncUrl.focus();
    return false;
  }

  localStorage.setItem(driveSyncSettingsKey, JSON.stringify(settings));
  return true;
}

async function sendDriveSyncRequest(settings, body) {
  if (body.action === "load") {
    return loadDriveDataWithJsonp(settings, body);
  }

  if (body.action === "save") {
    return saveDriveDataWithoutCors(settings, body);
  }

  throw new Error("Unknown Drive sync action.");
}

async function loadDriveDataWithJsonp(settings, body) {
  return new Promise((resolve, reject) => {
    const requestId = `drive-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const callbackName = `mandyDriveSync${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      settled = true;
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Drive sync timed out. Please check that the Apps Script code is updated and deployed as a Web App."));
    }, 45000);

    window[callbackName] = response => {
      if (!response || response.requestId !== requestId || settled) return;

      cleanup();
      if (!response.ok) {
        reject(new Error(response.error || "Drive sync request failed."));
        return;
      }

      resolve(response);
    };

    const request = JSON.stringify({
      requestId,
      callback: callbackName,
      token: settings.token,
      ...body
    });
    const separator = settings.url.includes("?") ? "&" : "?";
    script.src = `${settings.url}${separator}request=${encodeURIComponent(request)}`;
    script.async = true;

    document.body.append(script);
  });
}

async function saveDriveDataWithoutCors(settings, body) {
  const request = JSON.stringify({
    requestId: `drive-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    token: settings.token,
    ...body
  });
  const formData = new URLSearchParams();
  formData.set("request", request);

  await fetch(settings.url, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: formData.toString()
  });

  return {
    ok: true,
    savedAt: new Date().toISOString()
  };
}

function rememberDriveSync(settings) {
  localStorage.setItem(driveSyncSettingsKey, JSON.stringify({
    ...settings,
    lastSyncAt: new Date().toISOString()
  }));
}

function setDriveButtonsBusy(isBusy) {
  [loadDriveData, saveDriveData, loadDriveDataDashboard, saveDriveDataDashboard, saveDriveSettings].forEach(button => {
    button.disabled = isBusy;
  });
}

function updateDriveSyncStatus(message) {
  if (driveSyncStatus) driveSyncStatus.textContent = message;
}

function formatShortDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatShortDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function exportDataBackup() {
  if (!can("all")) {
    window.alert("Your account cannot export backups.");
    return;
  }

  const payload = {
    app: "Mandy English Student Management",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    storageKey,
    data
  };
  const fileName = `mandy-english-backup-${formatDateTimeForFileName(new Date())}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exported");
}

function importDataBackup(event) {
  if (!can("backup.import") && !can("all")) {
    window.alert("Your account cannot import backups.");
    importBackupFile.value = "";
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result || ""));
      const importedData = imported?.data && typeof imported.data === "object" ? imported.data : imported;
      if (!isValidBackupData(importedData)) {
        window.alert("This backup file does not look like Mandy English data.");
        return;
      }

      const confirmed = window.confirm(
        "Import this backup?\n\nThis will replace all current students, classes, schedule, attendance, lesson logs, and finance data in this browser. Please make sure you selected the correct backup file."
      );
      if (!confirmed) return;

      backupCurrentDataBeforeImport();
      data = importedData;
      normalizeData();
      syncClassStudents();
      saveData(false);
      render();
      showToast("Backup imported");
    } catch {
      window.alert("Cannot import this file. Please choose a valid Mandy English backup JSON file.");
    } finally {
      importBackupFile.value = "";
    }
  };
  reader.readAsText(file);
}

function isValidBackupData(value) {
  return value
    && typeof value === "object"
    && Array.isArray(value.students)
    && Array.isArray(value.classes);
}

function backupCurrentDataBeforeImport() {
  try {
    localStorage.setItem(`mandyEnglishBackupBeforeImport-${formatDateTimeForFileName(new Date())}`, JSON.stringify(data));
  } catch {
    // Import should still work if this safety backup cannot be written.
  }
}

function formatDateTimeForFileName(date) {
  const pad = value => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-") + `_${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

function render() {
  syncClassStudents();
  recoverLegacyTeachersForCurrentWeek();
  renderClassOptions();
  renderFilterClassOptions();
  renderClassListFilterOptions();
  renderAttendanceClassFilterOptions();
  renderLessonLogClassFilterOptions();
  renderProgressStudentOptions();
  renderTuitionStudentOptions();
  renderStudentModalClassChoices();
  updateTuitionFollowupButton();
  renderStudents();
  renderClasses();
  renderWeekOptions();
  renderWeeklySchedule();
  renderAttendanceBoard();
  renderLessonLogs();
  renderStudentProgress();
  renderTuitionSlip(true);
  renderFinance();
  updateDashboard();
  applyRoleUi();
}

function applyUserRecordUpdates() {
  applyTuyetAttendanceUpdate();
  applyThaiOneOnOneAttendanceUpdate();
  applyThaiStageFiveReset();
  applyGaoFlyersAttendanceUpdate();
  applyKateOneOnOneAttendanceUpdate();
  applyHHoangStageSixAttendanceUpdate();
  applyMNhatStageFourAttendanceUpdate();
}

function applyTuyetAttendanceUpdate() {
  const migrationKey = "tuyet-attendance-96-lessons-2026-06-28";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isTuyetStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "Tuyáº¿t",
      className: "1on1 Tuyáº¿t",
      contact: "",
      paymentType: "Course",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 12,
      paidLessons: 96,
      lastPaymentDate: "2026-03-25",
      nextDueDate: "",
      status: "Active"
    };

  student.name = repairVietnameseText(student.name || "Tuyáº¿t");
  student.className = repairVietnameseText(student.className || "1on1 Tuyáº¿t");
  student.paymentType = "Course";
  student.lessonsDone = 45;
  student.totalLessons = 12;
  student.paidLessons = 96;
  student.lastPaymentDate = "2026-03-25";
  student.nextDueDate = "";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getTuyetAttendanceCycles().forEach((cycleDates, cycleIndex) => {
    cycleDates.forEach((dateValue, lessonIndex) => {
      const attendanceSession = {
        className: student.className,
        startTime: "",
        endTime: "",
        date: parseDateValue(dateValue)
      };

      data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, cycleIndex)] = true;
    });
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isTuyetStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("tuyet")
    || normalizedClass.includes("1on1 tuyet")
    || normalizedClass.includes("1on1 tuy")
    || (normalizedName.includes("tuy") && normalizedClass.includes("1on1"));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase()
    .trim();
}

function removeStudentAttendanceRecords(studentName, className = "") {
  const normalizedStudentName = normalizeSearchText(studentName);
  const normalizedClassName = normalizeSearchText(className);

  Object.keys(data.attendance).forEach(key => {
    const parts = key.split("|");
    const keyClassName = parts[1] || "";
    const keyStudentName = parts[4] || "";
    const sameStudent = normalizeSearchText(keyStudentName) === normalizedStudentName;
    const sameClass = !normalizedClassName || normalizeSearchText(keyClassName) === normalizedClassName;

    if (sameStudent && sameClass) {
      delete data.attendance[key];
    }
  });
}

function getTuyetAttendanceCycles() {
  return [
    [
      "2025-09-03",
      "2025-09-04",
      "2025-09-05",
      "2025-09-10",
      "2025-09-12",
      "2025-09-17",
      "2025-09-18",
      "2025-09-19",
      "2025-09-25",
      "2025-10-01",
      "2025-10-03",
      "2025-10-08"
    ],
    [
      "2025-10-10",
      "2025-10-16",
      "2025-10-22",
      "2025-10-24",
      "2025-10-29",
      "2025-10-31",
      "2025-11-05",
      "2025-11-07",
      "2025-11-12",
      "2025-11-13",
      "2025-11-15",
      "2025-11-17"
    ],
    [
      "2025-11-19",
      "2025-11-21",
      "2025-11-26",
      "2025-12-03",
      "2025-12-18",
      "2026-01-09",
      "2026-01-21",
      "2026-01-30",
      "2026-03-04",
      "2026-03-06",
      "2026-03-10",
      "2026-03-18"
    ],
    [
      "2026-03-25",
      "2026-03-27",
      "2026-04-15",
      "2026-04-17",
      "2026-04-24",
      "2026-05-06",
      "2026-05-13",
      "2026-06-23",
      "2026-06-27"
    ]
  ];
}

function applyThaiOneOnOneAttendanceUpdate() {
  const migrationKey = "thai-1on1-attendance-12-lessons-2026-06-29";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isThaiOneOnOneStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "ThÃ¡i",
      className: "1on1 ThÃ¡i",
      contact: "",
      paymentType: "Monthly",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 12,
      paidLessons: 12,
      lastPaymentDate: "2026-04-22",
      nextDueDate: "",
      status: "Active"
    };

  student.name = repairVietnameseText(student.name || "ThÃ¡i");
  student.className = repairVietnameseText(student.className || "1on1 ThÃ¡i");
  student.totalLessons = 12;
  student.paidLessons = Math.max(Number(student.paidLessons) || 0, 12);
  student.lessonsDone = 9;
  student.lastPaymentDate = student.lastPaymentDate || "2026-04-22";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getThaiOneOnOneAttendanceDates().forEach((dateValue, overallLessonIndex) => {
    const totalLessons = getStudentCycleLessons(student);
    const cycleIndex = Math.floor(overallLessonIndex / totalLessons);
    const lessonIndex = overallLessonIndex % totalLessons;
    const attendanceSession = {
      className: student.className,
      startTime: "",
      endTime: "",
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, cycleIndex)] = true;
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isThaiOneOnOneStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("thai")
    && (normalizedClass.includes("1on1 thai") || normalizedClass.includes("1on1"));
}

function getThaiOneOnOneAttendanceDates() {
  return [
    "2026-04-22",
    "2026-04-29",
    "2026-05-06",
    "2026-05-08",
    "2026-05-14",
    "2026-05-15",
    "2026-05-19",
    "2026-05-26",
    "2026-05-29"
  ];
}

function applyThaiStageFiveReset() {
  const migrationKey = "thai-stage-5-reset-like-t-anh-stage-6-2026-06-29";
  if (data.migrations[migrationKey]) return;

  const thaiIndex = data.students.findIndex(student => isThaiStageFiveStudent(student));
  if (thaiIndex < 0) {
    data.migrations[migrationKey] = true;
    saveData(false);
    return;
  }

  const referenceStudent = data.students.find(student => isTAnhStageSixStudent(student));
  const thaiStudent = data.students[thaiIndex];

  thaiStudent.paymentType = referenceStudent?.paymentType || "Monthly";
  thaiStudent.discountPercent = referenceStudent?.discountPercent || 0;
  thaiStudent.lessonsDone = Number(referenceStudent?.lessonsDone) || 0;
  thaiStudent.totalLessons = getStudentCycleLessons(referenceStudent || { paymentType: "Monthly", totalLessons: 8 });
  thaiStudent.paidLessons = getStudentPaidLessons(referenceStudent || { paymentType: "Monthly", totalLessons: 8, paidLessons: 8 });
  thaiStudent.lastPaymentDate = referenceStudent?.lastPaymentDate || "";
  thaiStudent.nextDueDate = referenceStudent?.nextDueDate || "";
  thaiStudent.status = referenceStudent?.status || "Active";

  removeStudentAttendanceRecords(thaiStudent.name, thaiStudent.className);
  data.students[thaiIndex] = thaiStudent;
  data.migrations[migrationKey] = true;
  saveData(false);
}

function isThaiStageFiveStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("thai") && normalizedClass === "stage 5";
}

function isTAnhStageSixStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return (normalizedName.includes("t anh") || normalizedName.includes("tanh")) && normalizedClass === "stage 6";
}

function applyGaoFlyersAttendanceUpdate() {
  const migrationKey = "gao-flyers-attendance-24-lessons-2026-06-29";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isGaoFlyersStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "Gáº¡o",
      className: "Flyers",
      contact: "",
      paymentType: "Course",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 24,
      paidLessons: 24,
      lastPaymentDate: "2026-05-06",
      nextDueDate: "",
      status: "Active"
    };

  student.name = repairVietnameseText(student.name || "Gáº¡o");
  student.className = "Flyers";
  student.paymentType = "Course";
  student.totalLessons = 24;
  student.paidLessons = Math.max(Number(student.paidLessons) || 0, 24);
  student.lessonsDone = 12;
  student.lastPaymentDate = "2026-05-06";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getGaoFlyersAttendanceDates().forEach((dateValue, lessonIndex) => {
    const attendanceSession = {
      className: student.className,
      startTime: "",
      endTime: "",
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, 0)] = true;
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isGaoFlyersStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("gao") && normalizedClass === "flyers";
}

function getGaoFlyersAttendanceDates() {
  return [
    "2026-05-06",
    "2026-05-08",
    "2026-05-13",
    "2026-05-15",
    "2026-05-20",
    "2026-05-22",
    "2026-05-27",
    "2026-05-29",
    "2026-06-17",
    "2026-06-19",
    "2026-06-24",
    "2026-06-26"
  ];
}

function applyKateOneOnOneAttendanceUpdate() {
  const migrationKey = "kate-1on1-attendance-8-lessons-2026-06-29";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isKateOneOnOneStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "Kate",
      className: "1on1 Kate",
      contact: "",
      paymentType: "Monthly",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 8,
      paidLessons: 8,
      lastPaymentDate: "2026-04-20",
      nextDueDate: "",
      status: "Active"
    };

  student.name = repairVietnameseText(student.name || "Kate");
  student.className = "1on1 Kate";
  student.paymentType = "Monthly";
  student.totalLessons = 8;
  student.paidLessons = Math.max(Number(student.paidLessons) || 0, 8);
  student.lessonsDone = 7;
  student.lastPaymentDate = "2026-04-20";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getKateOneOnOneAttendanceDates().forEach((dateValue, lessonIndex) => {
    const attendanceSession = {
      className: student.className,
      startTime: "",
      endTime: "",
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, 0)] = true;
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isKateOneOnOneStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("kate") && (normalizedClass.includes("1on1 kate") || normalizedClass.includes("1on1"));
}

function getKateOneOnOneAttendanceDates() {
  return [
    "2026-04-20",
    "2026-04-22",
    "2026-05-06",
    "2026-05-13",
    "2026-05-20",
    "2026-05-27",
    "2026-06-27"
  ];
}

function applyHHoangStageSixAttendanceUpdate() {
  const migrationKey = "h-hoang-stage-6-attendance-20-lessons-2026-06-29";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isHHoangStageSixStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "H. Hoang",
      className: "Stage 6",
      contact: "",
      paymentType: "Course",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 24,
      paidLessons: 24,
      lastPaymentDate: "2026-03-05",
      nextDueDate: "",
      status: "Active"
    };

  student.name = "H. Hoang";
  student.className = "Stage 6";
  student.paymentType = "Course";
  student.totalLessons = 24;
  student.paidLessons = Math.max(Number(student.paidLessons) || 0, 24);
  student.lessonsDone = 20;
  student.lastPaymentDate = "2026-03-05";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getHHoangStageSixAttendanceDates().forEach((dateValue, lessonIndex) => {
    const attendanceSession = {
      className: student.className,
      startTime: "",
      endTime: "",
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, 0)] = true;
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isHHoangStageSixStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("hoang") && normalizedClass === "stage 6";
}

function getHHoangStageSixAttendanceDates() {
  return [
    "2026-03-05",
    "2026-03-10",
    "2026-03-12",
    "2026-03-17",
    "2026-03-19",
    "2026-03-24",
    "2026-03-26",
    "2026-03-31",
    "2026-04-02",
    "2026-04-07",
    "2026-04-09",
    "2026-04-14",
    "2026-04-16",
    "2026-04-21",
    "2026-04-23",
    "2026-05-05",
    "2026-05-14",
    "2026-05-19",
    "2026-05-21",
    "2026-05-26"
  ];
}

function applyMNhatStageFourAttendanceUpdate() {
  const migrationKey = "m-nhat-stage-4-attendance-2-lessons-2026-06-30";
  if (data.migrations[migrationKey]) return;

  const studentIndex = data.students.findIndex(student => isMNhatStageFourStudent(student));
  const student = studentIndex >= 0
    ? data.students[studentIndex]
    : {
      name: "M. Nhật",
      className: "Stage 4",
      contact: "",
      paymentType: "Monthly",
      discountPercent: 0,
      lessonsDone: 0,
      totalLessons: 8,
      paidLessons: 8,
      lastPaymentDate: "2026-06-29",
      nextDueDate: "",
      status: "Active"
    };

  student.name = "M. Nhật";
  student.className = "Stage 4";
  student.paymentType = "Monthly";
  student.discountPercent = 0;
  student.totalLessons = 8;
  student.paidLessons = 8;
  student.lessonsDone = 2;
  student.lastPaymentDate = "2026-06-29";
  student.nextDueDate = student.nextDueDate || "";
  student.status = "Active";

  if (studentIndex >= 0) {
    data.students[studentIndex] = student;
  } else {
    data.students.push(student);
  }

  removeStudentAttendanceRecords(student.name, student.className);
  getMNhatStageFourAttendanceDates().forEach((dateValue, lessonIndex) => {
    const attendanceSession = {
      className: student.className,
      startTime: "",
      endTime: "",
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, 0)] = true;
  });

  data.migrations[migrationKey] = true;
  saveData(false);
}

function isMNhatStageFourStudent(student) {
  const normalizedName = normalizeSearchText(student.name);
  const normalizedClass = normalizeSearchText(student.className);
  return normalizedName.includes("m. nhat") && normalizedClass === "stage 4";
}

function getMNhatStageFourAttendanceDates() {
  return [
    "2026-06-29",
    "2026-06-30"
  ];
}

function recoverLegacyTeachersForCurrentWeek() {
  if (legacyTeachersRecovered) return;

  const currentWeekDates = getCurrentWeekDates();
  let recovered = false;

  data.classes.forEach(classItem => {
    parseScheduleSlots(classItem.schedule).forEach(slot => {
      const classSlot = {
        className: classItem.name,
        startTime: slot.startTime,
        endTime: slot.endTime
      };
      const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(slot.day);
      const legacyKey = getLegacyTeacherKey(slot.day, classSlot);
      const dateKey = getTeacherKey(slot.day, classSlot, currentWeekDates[dayIndex]);

      if (data.teachers[legacyKey] && !data.teachers[dateKey]) {
        data.teachers[dateKey] = data.teachers[legacyKey];
        recovered = true;
      }
    });
  });

  legacyTeachersRecovered = true;
  if (recovered) saveData(false);
}

function renderStudents() {
  studentRows.innerHTML = "";
  updateTuitionFollowupButton();

  const entries = getFilteredStudentEntries();

  if (!entries.length) {
    appendStudentGroupRow("No students found.");
    return;
  }

  let currentGroup = "";

  entries.forEach(({ student, index }, displayIndex) => {
    const groupName = getStudentDisplayGroup(student);
    if (groupName !== currentGroup) {
      appendStudentGroupRow(groupName);
      currentGroup = groupName;
    }

    const row = document.createElement("tr");

    row.append(createPlainCell(displayIndex + 1, "stt-cell"));
    row.append(createPlainCell(student.name, "plain-cell"));
    row.append(createPlainCell(student.className, "plain-cell"));
    row.append(createPlainCell(student.contact || "-", "plain-cell muted-cell"));
    row.append(createPlainCell(formatPaymentType(student), "plain-cell"));
    row.append(createPlainCell(student.lessonsDone, "plain-cell"));
    row.append(createReminderCell(student));
    row.append(createPlainCell(student.lastPaymentDate || "-", "plain-cell muted-cell"));
    row.append(createPlainCell(student.nextDueDate || "-", "plain-cell muted-cell"));
    row.append(createPlainCell(student.status, "plain-cell"));
    row.append(createStudentActionCell(index));

    studentRows.append(row);
  });
}

function renderClasses() {
  classRows.innerHTML = "";
  stoppedClassRows.innerHTML = "";

  const activeClassEntries = getFilteredClassEntries()
    .filter(({ classItem }) => !isStoppedClass(classItem));
  const stoppedClassEntries = getFilteredClassEntries()
    .filter(({ classItem }) => isStoppedClass(classItem));

  renderClassEntryGroups(activeClassEntries, classRows, !classListFilter.value);
  renderClassEntryGroups(stoppedClassEntries, stoppedClassRows, false);

  if (!stoppedClassRows.children.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted-cell";
    cell.textContent = "No stopped classes.";
    row.append(cell);
    stoppedClassRows.append(row);
  }
}

function renderClassEntryGroups(entries, targetBody, showEmptyGroups) {
  const groups = getClassDisplayGroups(entries);

  groups.forEach(group => {
    if (!group.entries.length && !showEmptyGroups) return;
    appendClassGroupRow(targetBody, group.label);

    if (!group.entries.length) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 4;
      emptyCell.className = "muted-cell";
      emptyCell.textContent = "No classes in this group.";
      emptyRow.append(emptyCell);
      targetBody.append(emptyRow);
      return;
    }

    group.entries.forEach(({ classItem, index }) => {
    const row = document.createElement("tr");

    row.append(createPlainCell(classItem.name, "readonly-cell"));
    row.append(createAutomaticStudentCell(classItem));
    row.append(createScheduleCell(classItem, index));
    row.append(createClassActionCell(classItem, index));

      targetBody.append(row);
    });
  });
}

function appendStudentGroupRow(label) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 11;
  cell.className = "table-group-row";
  cell.textContent = label;
  row.append(cell);
  studentRows.append(row);
}

function appendClassGroupRow(targetBody, label) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.className = "table-group-row";
  cell.textContent = label;
  row.append(cell);
  targetBody.append(row);
}

function createPlainCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function createInputCell(value, onChange, type = "text") {
  const cell = document.createElement("td");
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.addEventListener("input", event => onChange(event.target.value));
  cell.append(input);
  return cell;
}

function createScheduleCell(classItem, index) {
  const cell = document.createElement("td");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "schedule-button";
  button.textContent = getClassScheduleForWeek(classItem, selectedWeekStart) || classItem.schedule || "Choose schedule";
  button.disabled = isStoppedClass(classItem) || (!can("classes.edit") && !can("all"));
  button.addEventListener("click", () => openScheduleModal(index));
  cell.append(button);
  return cell;
}

function createClassActionCell(classItem, index) {
  const cell = document.createElement("td");
  const actions = document.createElement("div");
  const renameButton = document.createElement("button");
  const statusButton = document.createElement("button");

  actions.className = "class-action-cell";
  if (!can("classes.edit") && !can("all")) {
    cell.textContent = "-";
    return cell;
  }

  renameButton.type = "button";
  renameButton.className = "rename-class-button";
  renameButton.textContent = "Rename";
  renameButton.addEventListener("click", () => renameClass(index));

  statusButton.type = "button";
  statusButton.className = isStoppedClass(classItem) ? "restore-class-button" : "stop-class-button";
  statusButton.textContent = isStoppedClass(classItem) ? "Reactivate" : "Stop from week";
  statusButton.addEventListener("click", () => {
    if (isStoppedClass(classItem)) {
      reactivateClass(index);
    } else {
      stopClass(index);
    }
  });
  actions.append(renameButton, statusButton);
  cell.append(actions);
  return cell;
}

function createLessonsCell(value, onChange) {
  const cell = document.createElement("td");
  const input = document.createElement("input");
  input.type = "number";
  input.value = value;
  input.classList.add("lesson-input");
  input.min = "0";
  input.step = "1";
  input.addEventListener("input", event => onChange(event.target.value));
  input.addEventListener("change", () => renderStudents());
  cell.append(input);
  return cell;
}

function createClassInputCell(value, onChange) {
  const cell = createInputCell(value, onChange);
  const input = cell.querySelector("input");
  input.setAttribute("list", "classOptions");
  input.addEventListener("change", event => {
    ensureClassExists(event.target.value);
    syncClassStudents();
    saveData(false);
    render();
  });
  return cell;
}

function createReminderCell(student) {
  const cell = document.createElement("td");
  const reminder = getPaymentReminder(student);
  cell.className = `reminder-cell ${reminder.className}`;
  cell.textContent = reminder.text;
  return cell;
}

function createAutomaticStudentCell(classItem) {
  const cell = document.createElement("td");
  const list = document.createElement("div");
  const studentNames = String(classItem.students || "")
    .split(",")
    .map(name => name.trim())
    .filter(Boolean);

  cell.className = "auto-cell";

  if (!studentNames.length) {
    cell.classList.add("empty-auto-cell");
    cell.textContent = "No students yet";
    return cell;
  }

  list.className = "class-student-tags";
  studentNames.forEach(name => {
    const tag = document.createElement("span");
    const student = findStudentByNameAndClass(name, classItem.name);
    tag.className = student?.status === "Temporary pause" ? "class-student-tag paused-class-student" : "class-student-tag";
    tag.textContent = name;
    if (student?.status === "Temporary pause") tag.title = "Temporary pause";
    list.append(tag);
  });

  cell.append(list);
  return cell;
}

function findStudentByNameAndClass(name, className) {
  return data.students.find(student =>
    normalizeSearchText(student.name) === normalizeSearchText(name)
    && normalizeSearchText(student.className) === normalizeSearchText(className)
  );
}

function createSelectCell(value, options, onChange) {
  const cell = document.createElement("td");
  const select = document.createElement("select");

  options.forEach(optionText => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    select.append(option);
  });

  select.value = value;
  select.addEventListener("change", event => onChange(event.target.value));
  cell.append(select);
  return cell;
}

function createStatusCell(value, onChange) {
  const cell = createSelectCell(value, ["Active", "Temporary pause", "Stopped"], newValue => {
    onChange(newValue);
    render();
  });
  const select = cell.querySelector("select");
  select.classList.add("status-select");
  applyStatusStyle(select, value);
  select.addEventListener("change", event => applyStatusStyle(event.target, event.target.value));
  return cell;
}

function createDeleteCell(onDelete) {
  const cell = document.createElement("td");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "delete-button";
  button.textContent = "x";
  button.title = "Delete row";
  button.addEventListener("click", onDelete);
  cell.className = "action-cell";
  cell.append(button);
  return cell;
}

function createEditCell(index) {
  const cell = document.createElement("td");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "edit-button";
  button.textContent = "Edit";
  button.addEventListener("click", () => openStudentModal(index));
  cell.className = "action-cell";
  cell.append(button);
  return cell;
}

function createStudentActionCell(index) {
  const cell = document.createElement("td");
  const paymentButton = document.createElement("button");
  const editButton = document.createElement("button");

  cell.className = "student-action-cell";
  paymentButton.type = "button";
  paymentButton.className = "payment-button";
  paymentButton.textContent = "Payment";
  paymentButton.addEventListener("click", () => openPaymentModal(index));

  editButton.type = "button";
  editButton.className = "edit-button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => openStudentModal(index));

  if (can("payments.edit") || can("all")) cell.append(paymentButton);
  if (can("students.edit") || can("all")) cell.append(editButton);
  if (!cell.children.length) cell.textContent = "-";
  return cell;
}

function applyStatusStyle(select, status) {
  select.classList.remove("status-active", "status-pause", "status-stopped");

  if (status === "Active") select.classList.add("status-active");
  if (status === "Temporary pause") select.classList.add("status-pause");
  if (status === "Stopped") select.classList.add("status-stopped");
}

function updateStudent(index, key, value) {
  if (!can("students.edit") && !can("all")) return;

  const previousStudent = { ...data.students[index] };
  data.students[index][key] = key === "lessonsDone" ? Math.max(0, Number(value) || 0) : value;
  if (key === "name" || key === "className") {
    migrateStudentLinkedRecords(previousStudent, data.students[index]);
    syncClassStudents();
    renderClasses();
    renderClassOptions();
  }
  if (key === "paymentType") {
    renderStudents();
  }
  saveData(false);
  updateDashboard();
}

function updateClass(index, key, value) {
  if (!can("classes.edit") && !can("all")) return;

  data.classes[index][key] = value;
  saveData(false);
}

function stopEditingClass() {
  if (!can("classes.edit") && !can("all")) {
    window.alert("Your account cannot stop classes.");
    return;
  }

  if (editingScheduleIndex === null) return;
  stopClass(editingScheduleIndex);
  closeScheduleModal();
}

function stopClass(index) {
  if (!can("classes.edit") && !can("all")) {
    window.alert("Your account cannot stop classes.");
    return;
  }

  const classItem = data.classes[index];
  const weekLabel = formatStoredDate(formatDateValue(selectedWeekStart));
  const confirmed = window.confirm(`Stop ${classItem.name} from week ${weekLabel}? Past schedules will stay unchanged.`);
  if (!confirmed) return;

  setClassStatusFromSelectedWeek(data.classes[index], "Stopped");
  saveData(true);
  renderClasses();
  renderWeeklySchedule();
  renderAttendanceBoard();
  updateDashboard();
}

function reactivateClass(index) {
  if (!can("classes.edit") && !can("all")) {
    window.alert("Your account cannot reactivate classes.");
    return;
  }

  const classItem = data.classes[index];
  const weekLabel = formatStoredDate(formatDateValue(selectedWeekStart));
  const confirmed = window.confirm(`Reactivate ${classItem.name} from week ${weekLabel}? Past off weeks will stay unchanged.`);
  if (!confirmed) return;

  setClassStatusFromSelectedWeek(data.classes[index], "Active");
  saveData(true);
  renderClasses();
  renderWeeklySchedule();
  renderAttendanceBoard();
  updateDashboard();
}

function renameClass(index) {
  if (!can("classes.edit") && !can("all")) {
    window.alert("Your account cannot rename classes.");
    return;
  }

  const classItem = data.classes[index];
  if (!classItem) return;

  const oldName = String(classItem.name || "").trim();
  const typedName = window.prompt("Enter the new class name:", oldName);
  if (typedName === null) return;

  const newName = repairVietnameseText(typedName).trim();
  if (!newName) {
    window.alert("Class name cannot be empty.");
    return;
  }

  if (normalizeSearchText(newName) === normalizeSearchText(oldName)) {
    if (newName !== oldName) {
      backupBeforeClassRenameOnce();
      renameClassEverywhere(oldName, newName);
      saveData(true);
      render();
    }
    return;
  }

  const duplicate = data.classes.some((item, itemIndex) =>
    itemIndex !== index && normalizeSearchText(item.name) === normalizeSearchText(newName)
  );
  if (duplicate) {
    window.alert("This class name already exists. Please choose a different name.");
    return;
  }

  const confirmed = window.confirm(`Rename "${oldName}" to "${newName}" everywhere in Mandy English?`);
  if (!confirmed) return;

  backupBeforeClassRenameOnce();
  renameClassEverywhere(oldName, newName);
  saveData(true);
  render();
}

function renameClassEverywhere(oldName, newName) {
  const oldSearch = normalizeSearchText(oldName);

  data.classes.forEach(classItem => {
    if (normalizeSearchText(classItem.name) === oldSearch) {
      classItem.name = newName;
    }
  });

  data.students.forEach(student => {
    if (normalizeSearchText(student.className) === oldSearch) {
      student.className = newName;
    }
  });

  renameScheduleHistoryKey(oldName, newName);
  data.teachers = renameClassInTeacherKeys(data.teachers, oldName, newName);
  data.completedSessions = renameClassInPipeKeys(data.completedSessions, oldName, newName, 1);
  data.finance.sessionCosts = renameClassInPipeKeys(data.finance?.sessionCosts, oldName, newName, 1);
  data.finance.sessionStudents = renameClassInPipeKeys(data.finance?.sessionStudents, oldName, newName, 1);
  data.attendance = renameClassInPipeKeys(data.attendance, oldName, newName, 1);
  data.attendanceNotes = renameClassInPipeKeys(data.attendanceNotes, oldName, newName, 0);
  renameFinanceClassFee(oldName, newName);
  data.lessonLogs = data.lessonLogs.map(log => {
    const nextLog = { ...log };
    if (normalizeSearchText(nextLog.className) === oldSearch) nextLog.className = newName;
    nextLog.sessionKey = renameClassInPipeKey(nextLog.sessionKey, oldName, newName, 1);
    return nextLog;
  });

  if (classListFilter.value && normalizeSearchText(classListFilter.value) === oldSearch) classListFilter.value = newName;
  if (filterClass.value && normalizeSearchText(filterClass.value) === oldSearch) filterClass.value = newName;
  if (attendanceClassFilter.value && normalizeSearchText(attendanceClassFilter.value) === oldSearch) attendanceClassFilter.value = newName;
  if (lessonLogClassFilter.value && normalizeSearchText(lessonLogClassFilter.value) === oldSearch) lessonLogClassFilter.value = newName;

  attendanceCycleViews.clear();
  syncClassStudents();
  normalizeData();
}

function renameFinanceClassFee(oldName, newName) {
  const oldKey = getFinanceClassKey(oldName);
  const newKey = getFinanceClassKey(newName);
  if (!data.finance?.classFees || !Object.prototype.hasOwnProperty.call(data.finance.classFees, oldKey)) return;

  data.finance.classFees[newKey] = data.finance.classFees[oldKey];
  if (oldKey !== newKey) delete data.finance.classFees[oldKey];
}

function renameScheduleHistoryKey(oldName, newName) {
  const oldKey = getScheduleHistoryKey(oldName);
  const newKey = getScheduleHistoryKey(newName);
  const oldHistory = Array.isArray(data.scheduleHistory[oldKey]) ? data.scheduleHistory[oldKey] : [];
  const newHistory = Array.isArray(data.scheduleHistory[newKey]) ? data.scheduleHistory[newKey] : [];

  if (!oldHistory.length && !newHistory.length) return;

  data.scheduleHistory[newKey] = normalizeScheduleHistory([...newHistory, ...oldHistory]);
  if (oldKey !== newKey) delete data.scheduleHistory[oldKey];
}

function normalizeScheduleHistory(history) {
  const byWeek = new Map();

  history
    .filter(entry => entry && entry.effectiveFrom && typeof entry.schedule === "string")
    .forEach(entry => {
      byWeek.set(entry.effectiveFrom, {
        effectiveFrom: entry.effectiveFrom,
        schedule: normalizeSchedule(entry.schedule)
      });
    });

  return [...byWeek.values()].sort((first, second) => first.effectiveFrom.localeCompare(second.effectiveFrom));
}

function renameClassInTeacherKeys(source, oldName, newName) {
  return Object.entries(source || {}).reduce((renamed, [key, value]) => {
    const parts = key.split("|");
    const classPartIndex = parts.length === 4 ? 1 : parts.length === 5 ? 2 : -1;
    const nextKey = classPartIndex >= 0 ? renameClassInPipeKey(key, oldName, newName, classPartIndex) : key;
    renamed[nextKey] = value;
    return renamed;
  }, {});
}

function renameClassInPipeKeys(source, oldName, newName, classPartIndex) {
  return Object.entries(source || {}).reduce((renamed, [key, value]) => {
    const nextKey = renameClassInPipeKey(key, oldName, newName, classPartIndex);
    renamed[nextKey] = value;
    return renamed;
  }, {});
}

function renameClassInPipeKey(key, oldName, newName, classPartIndex) {
  const parts = String(key || "").split("|");
  if (parts.length <= classPartIndex) return key;
  if (normalizeSearchText(parts[classPartIndex]) !== normalizeSearchText(oldName)) return key;

  parts[classPartIndex] = newName;
  return parts.join("|");
}

function migrateStudentLinkedRecords(oldStudent, newStudent) {
  if (!oldStudent || !newStudent) return;

  const oldClassName = String(oldStudent.className || "").trim();
  const oldStudentName = String(oldStudent.name || "").trim();
  const newClassName = String(newStudent.className || "").trim();
  const newStudentName = String(newStudent.name || "").trim();

  if (!oldClassName || !oldStudentName || !newClassName || !newStudentName) return;
  if (
    normalizeSearchText(oldClassName) === normalizeSearchText(newClassName)
    && normalizeSearchText(oldStudentName) === normalizeSearchText(newStudentName)
  ) return;

  data.attendance = migrateStudentAttendanceKeys(data.attendance, oldStudent, newStudent);
  data.attendanceNotes = migrateStudentAttendanceNoteKeys(data.attendanceNotes, oldStudent, newStudent);
  data.lessonLogs = data.lessonLogs.map(log => ({
    ...log,
    studentNotes: log.studentNotes.map(note => (
      normalizeSearchText(note.studentName) === normalizeSearchText(oldStudentName)
        ? { ...note, studentName: newStudentName }
        : note
    ))
  }));
}

function migrateStudentAttendanceKeys(source, oldStudent, newStudent) {
  return Object.entries(source || {}).reduce((renamed, [key, value]) => {
    const parts = key.split("|");

    if (parts.length >= 6
      && normalizeSearchText(parts[1]) === normalizeSearchText(oldStudent.className)
      && normalizeSearchText(parts[4]) === normalizeSearchText(oldStudent.name)) {
      const historicalParts = [...parts];
      historicalParts[4] = newStudent.name;
      renamed[historicalParts.join("|")] = value;
      return renamed;
    }

    renamed[key] = value;
    return renamed;
  }, {});
}

function migrateStudentAttendanceNoteKeys(source, oldStudent, newStudent) {
  return Object.entries(source || {}).reduce((renamed, [key, value]) => {
    const parts = key.split("|");
    const classChanged = normalizeSearchText(oldStudent.className) !== normalizeSearchText(newStudent.className);

    if (parts.length >= 3
      && normalizeSearchText(parts[0]) === normalizeSearchText(oldStudent.className)
      && normalizeSearchText(parts[1]) === normalizeSearchText(oldStudent.name)) {
      const historicalParts = [...parts];
      historicalParts[1] = newStudent.name;
      renamed[historicalParts.join("|")] = value;

      if (classChanged) {
        const currentClassParts = [...parts];
        currentClassParts[0] = newStudent.className;
        currentClassParts[1] = newStudent.name;
        renamed[currentClassParts.join("|")] = value;
      }
      return renamed;
    }

    renamed[key] = value;
    return renamed;
  }, {});
}

function isStoppedClass(classItem) {
  return getClassStatusForWeek(classItem, selectedWeekStart) === "Stopped";
}

function setClassStatusFromSelectedWeek(classItem, status) {
  const effectiveFrom = formatDateValue(selectedWeekStart);
  const history = getClassStatusHistory(classItem);
  const previousStatus = getClassStatusForWeek(classItem, addDays(selectedWeekStart, -7));

  if (!history.length) {
    history.push({
      effectiveFrom: "1900-01-01",
      status: previousStatus
    });
  }

  const existingIndex = history.findIndex(entry => entry.effectiveFrom === effectiveFrom);
  if (existingIndex >= 0) {
    history[existingIndex].status = status;
  } else {
    history.push({
      effectiveFrom,
      status
    });
  }

  classItem.statusHistory = normalizeClassStatusHistory(history);
  classItem.status = getLatestClassStatus(classItem.statusHistory) || status;
}

function getClassStatusForWeek(classItem, weekStart) {
  const history = getClassStatusHistory(classItem);
  const weekValue = formatDateValue(weekStart);
  const effectiveEntry = history
    .filter(entry => entry.effectiveFrom <= weekValue)
    .sort((first, second) => second.effectiveFrom.localeCompare(first.effectiveFrom))[0];

  return effectiveEntry ? effectiveEntry.status : classItem.status === "Stopped" ? "Stopped" : "Active";
}

function getClassStatusHistory(classItem) {
  return normalizeClassStatusHistory(classItem.statusHistory);
}

function getLatestClassStatus(history) {
  const latestEntry = [...history].sort((first, second) => second.effectiveFrom.localeCompare(first.effectiveFrom))[0];
  return latestEntry ? latestEntry.status : "";
}

function openScheduleModal(index) {
  if (!can("classes.edit") && !can("all")) {
    window.alert("Your account cannot edit class schedules.");
    return;
  }

  editingScheduleIndex = index;
  scheduleRows.innerHTML = "";
  document.querySelector("#scheduleModalTitle").textContent = data.classes[index].name;
  document.querySelector('input[name="scheduleApplyScope"][value="from-week"]').checked = true;

  const slots = parseScheduleSlots(getClassScheduleForWeek(data.classes[index], selectedWeekStart));
  if (slots.length) {
    slots.forEach(slot => addSchedulePickerRow(slot.day, slot.startTime, slot.endTime));
  } else {
    addSchedulePickerRow();
  }

  scheduleModal.classList.add("open");
  scheduleModal.setAttribute("aria-hidden", "false");
}

function closeScheduleModal() {
  scheduleModal.classList.remove("open");
  scheduleModal.setAttribute("aria-hidden", "true");
  editingScheduleIndex = null;
}

function addSchedulePickerRow(day = "Mon", startTime = "18:00", endTime = "19:00") {
  const row = document.createElement("div");
  const [startHour = "18", startMinute = "00"] = startTime.split(":");
  const [endHour = "19", endMinute = "00"] = endTime.split(":");
  row.className = "schedule-row";
  row.innerHTML = `
    <select class="schedule-day">
      <option value="Mon">Mon</option>
      <option value="Tue">Tue</option>
      <option value="Wed">Wed</option>
      <option value="Thu">Thu</option>
      <option value="Fri">Fri</option>
      <option value="Sat">Sat</option>
      <option value="Sun">Sun</option>
    </select>
    <select class="schedule-start-hour" aria-label="Start hour"></select>
    <select class="schedule-start-minute" aria-label="Start minute"></select>
    <select class="schedule-end-hour" aria-label="End hour"></select>
    <select class="schedule-end-minute" aria-label="End minute"></select>
    <button class="schedule-remove" type="button" aria-label="Remove time">x</button>
  `;

  row.querySelector(".schedule-day").value = day;
  fillNumberSelect(row.querySelector(".schedule-start-hour"), 0, 23, startHour);
  fillNumberSelect(row.querySelector(".schedule-start-minute"), 0, 55, startMinute, 5);
  fillNumberSelect(row.querySelector(".schedule-end-hour"), 0, 23, endHour);
  fillNumberSelect(row.querySelector(".schedule-end-minute"), 0, 55, endMinute, 5);
  row.querySelector(".schedule-remove").addEventListener("click", () => {
    if (scheduleRows.children.length > 1) row.remove();
  });
  scheduleRows.append(row);
}

function saveScheduleFromPicker() {
  if (!can("classes.edit") && !can("all")) return;
  if (editingScheduleIndex === null) return;

  const classItem = data.classes[editingScheduleIndex];
  const applyScope = document.querySelector('input[name="scheduleApplyScope"]:checked')?.value || "from-week";
  const slots = [...scheduleRows.querySelectorAll(".schedule-row")]
    .map(row => ({
      day: row.querySelector(".schedule-day").value,
      startTime: `${row.querySelector(".schedule-start-hour").value}:${row.querySelector(".schedule-start-minute").value}`,
      endTime: `${row.querySelector(".schedule-end-hour").value}:${row.querySelector(".schedule-end-minute").value}`
    }))
    .filter(slot => slot.day && slot.startTime && slot.endTime);

  const newSchedule = slots.map(slot => `${slot.day}, ${slot.startTime}-${slot.endTime}`).join(" | ");

  if (applyScope === "all-weeks") {
    applyScheduleToAllWeeks(classItem, newSchedule);
  } else {
    applyScheduleFromSelectedWeek(classItem, newSchedule);
  }

  saveData(true);
  renderClasses();
  renderWeeklySchedule();
  renderAttendanceBoard();
  closeScheduleModal();
}

function applyScheduleToAllWeeks(classItem, newSchedule) {
  classItem.schedule = normalizeSchedule(newSchedule);
  data.scheduleHistory[getScheduleHistoryKey(classItem.name)] = [
    {
      effectiveFrom: "1900-01-01",
      schedule: classItem.schedule
    }
  ];
}

function applyScheduleFromSelectedWeek(classItem, newSchedule) {
  const historyKey = getScheduleHistoryKey(classItem.name);
  const effectiveFrom = formatDateValue(selectedWeekStart);
  const previousSchedule = getClassScheduleForWeek(classItem, addDays(selectedWeekStart, -7)) || classItem.schedule || "";
  const normalizedSchedule = normalizeSchedule(newSchedule);
  const history = getScheduleHistory(classItem.name);

  if (!history.length) {
    history.push({
      effectiveFrom: "1900-01-01",
      schedule: normalizeSchedule(previousSchedule)
    });
  }

  const existingIndex = history.findIndex(entry => entry.effectiveFrom === effectiveFrom);
  if (existingIndex >= 0) {
    history[existingIndex].schedule = normalizedSchedule;
  } else {
    history.push({
      effectiveFrom,
      schedule: normalizedSchedule
    });
  }

  history.sort((first, second) => first.effectiveFrom.localeCompare(second.effectiveFrom));
  data.scheduleHistory[historyKey] = history;
  classItem.schedule = getLatestScheduleFromHistory(history) || normalizedSchedule;
}

function getClassScheduleForWeek(classItem, weekStart) {
  const history = getScheduleHistory(classItem.name);
  const weekValue = formatDateValue(weekStart);
  const effectiveEntry = history
    .filter(entry => entry.effectiveFrom <= weekValue)
    .sort((first, second) => second.effectiveFrom.localeCompare(first.effectiveFrom))[0];

  return effectiveEntry ? effectiveEntry.schedule : classItem.schedule || "";
}

function getScheduleHistory(className) {
  const history = data.scheduleHistory[getScheduleHistoryKey(className)];
  if (!Array.isArray(history)) return [];

  return history
    .filter(entry => entry && entry.effectiveFrom && typeof entry.schedule === "string")
    .map(entry => ({
      effectiveFrom: entry.effectiveFrom,
      schedule: normalizeSchedule(entry.schedule)
    }));
}

function getLatestScheduleFromHistory(history) {
  const latestEntry = [...history].sort((first, second) => second.effectiveFrom.localeCompare(first.effectiveFrom))[0];
  return latestEntry ? latestEntry.schedule : "";
}

function getScheduleHistoryKey(className) {
  return String(className || "").trim();
}

function parseScheduleSlots(schedule) {
  return schedule
    .split("|")
    .map(slot => slot.trim())
    .filter(Boolean)
    .map(slot => {
      const [dayPart, timePart] = slot.split(",").map(part => part.trim());
      const [startTime, endTime] = normalizeTimeRange(timePart || "18:00");
      return { day: dayPart || "Mon", startTime, endTime };
    });
}

function normalizeTimeRange(timeText) {
  const cleanTime = timeText.replace(".", ":");
  const [startTime = "18:00", endTime] = cleanTime.split("-").map(part => part.trim());
  return [startTime, endTime || addOneHour(startTime)];
}

function addOneHour(timeText) {
  const [hourText = "18", minuteText = "00"] = timeText.split(":");
  const hour = (Number(hourText) + 1) % 24;
  return `${String(hour).padStart(2, "0")}:${minuteText.padStart(2, "0")}`;
}

function fillNumberSelect(select, min, max, selectedValue, step = 1) {
  select.innerHTML = "";

  for (let number = min; number <= max; number += step) {
    const value = String(number).padStart(2, "0");
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }

  select.value = String(Number(selectedValue) || 0).padStart(2, "0");
}


function getClassesForDay(day) {
  return getClassesForDayForWeek(day, selectedWeekStart);
}

function getClassesForDayForWeek(day, weekStart) {
  return data.classes
    .filter(classItem => getClassStatusForWeek(classItem, weekStart) !== "Stopped")
    .flatMap(classItem => parseScheduleSlots(getClassScheduleForWeek(classItem, weekStart))
      .filter(slot => slot.day === day)
      .map(slot => ({ className: classItem.name, startTime: slot.startTime, endTime: slot.endTime })))
    .sort((first, second) => first.startTime.localeCompare(second.startTime));
}

function getTeacherKey(day, classSlot, date) {
  return [formatDateValue(date), day, classSlot.className, classSlot.startTime, classSlot.endTime].join("|");
}

function getLegacyTeacherKey(day, classSlot) {
  return [day, classSlot.className, classSlot.startTime, classSlot.endTime].join("|");
}

function getCurrentWeekLegacyTeacher(legacyTeacherKey) {
  return getLegacyTeacherForWeek(legacyTeacherKey, selectedWeekStart);
}

function getLegacyTeacherForWeek(legacyTeacherKey, weekStart) {
  if (!isSameDate(weekStart, getWeekStart(new Date()))) return "";
  return data.teachers[legacyTeacherKey] || "";
}

function updateTeacherName(key, value) {
  if (!can("schedule.teacher") && !can("all")) return;

  const teacherName = value.trim();
  if (teacherName) {
    data.teachers[key] = teacherName;
  } else {
    delete data.teachers[key];
  }
  saveData(false);
}

function isOffTeacher(teacher) {
  return String(teacher || "").trim().toLowerCase() === "off";
}

function toggleSessionDone(day, classSlot, date) {
  if (!can("schedule.done") && !can("all")) {
    window.alert("Your account cannot mark classes as Done.");
    return;
  }

  const session = {
    ...classSlot,
    date,
    day
  };
  const sessionKey = getSessionKey(session);
  const teacherKey = getTeacherKey(day, classSlot, date);
  const legacyTeacherKey = getLegacyTeacherKey(day, classSlot);
  const teacher = data.teachers[teacherKey] || getCurrentWeekLegacyTeacher(legacyTeacherKey);

  if (!data.completedSessions[sessionKey] && !isTeachingTeacher(teacher)) {
    window.alert("Please enter a teacher name before marking this class as Done.");
    return;
  }

  if (data.completedSessions[sessionKey]) {
    const confirmed = window.confirm(
      `Remove Done for ${session.className} on ${formatStoredDate(formatDateValue(session.date))}?\n\nThis will remove the attendance date for every active student in this class and delete this lesson log.`
    );
    if (!confirmed) return;

    delete data.completedSessions[sessionKey];
    deleteFinanceSessionSnapshot(sessionKey);
    removeSessionAttendance(session);
    removeLessonLog(sessionKey);
    normalizeData();
    saveData(true);
    renderStudents();
    renderWeeklySchedule();
    renderAttendanceBoard();
    renderLessonLogs();
    renderStudentProgress();
    renderFinance();
  } else {
    openLessonLogModal({ ...session, teacher });
  }
}

function clearCompletedSession(session) {
  const sessionKey = getSessionKey(session);
  if (!data.completedSessions[sessionKey]) return false;

  delete data.completedSessions[sessionKey];
  deleteFinanceSessionSnapshot(sessionKey);
  removeSessionAttendance(session);
  removeLessonLog(sessionKey);
  normalizeData();
  return true;
}

function openLessonLogModal(session) {
  pendingLessonLogSession = {
    ...session,
    date: parseDateValue(formatDateValue(session.date))
  };
  const existingLog = getLessonLogBySessionKey(getSessionKey(pendingLessonLogSession));
  const students = getStudentsByClass(session.className);

  lessonLogModal.classList.add("open");
  lessonLogModal.setAttribute("aria-hidden", "false");
  lessonLogModalTitle.textContent = `Lesson Log - ${session.className}`;
  lessonLogSessionSummary.innerHTML = `
    <strong>${session.className}</strong>
    <span>${formatStoredDate(formatDateValue(session.date))} | ${session.startTime}-${session.endTime} | ${session.teacher}</span>
  `;
  lessonLogTaught.value = existingLog ? existingLog.taught : "";
  lessonLogHomework.value = existingLog ? existingLog.homework : "";
  lessonLogNote.value = existingLog ? existingLog.note : "";
  lessonLogStudentNotes.innerHTML = "";

  if (!students.length) {
    const empty = document.createElement("p");
    empty.className = "attendance-empty inline";
    empty.textContent = "No active students in this class.";
    lessonLogStudentNotes.append(empty);
  }

  students.forEach(({ student }) => {
    const savedNote = existingLog
      ? existingLog.studentNotes.find(note => normalizeSearchText(note.studentName) === normalizeSearchText(student.name))
      : null;

    lessonLogStudentNotes.append(createStudentLessonNoteRow(student, savedNote));
  });

  lessonLogTaught.focus();
}

function createStudentLessonNoteRow(student, savedNote) {
  const row = document.createElement("div");
  const name = document.createElement("strong");
  const select = document.createElement("select");
  const note = document.createElement("textarea");

  row.className = "student-note-row";
  row.dataset.studentName = student.name;
  name.textContent = student.name;
  select.className = "student-performance";
  ["Excellent", "Good", "Improving", "Needs Practice", "Absent"].forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.value = savedNote ? savedNote.performance : "Good";
  note.className = "student-note-input";
  note.rows = 2;
  note.placeholder = "Student note";
  note.value = savedNote ? savedNote.note : "";

  row.append(name, select, note);
  return row;
}

function closeLessonLogModal() {
  pendingLessonLogSession = null;
  lessonLogModal.classList.remove("open");
  lessonLogModal.setAttribute("aria-hidden", "true");
  lessonLogForm.reset();
  lessonLogStudentNotes.innerHTML = "";
}

function saveLessonLogAndCompleteSession() {
  if (!can("lessonLog.edit") && !can("all")) {
    window.alert("Your account cannot save lesson logs.");
    return;
  }

  if (!pendingLessonLogSession) return;

  const session = pendingLessonLogSession;
  const sessionKey = getSessionKey(session);
  const studentNotes = [...lessonLogStudentNotes.querySelectorAll(".student-note-row")].map(row => ({
    studentName: row.dataset.studentName,
    performance: row.querySelector(".student-performance").value,
    note: row.querySelector(".student-note-input").value.trim()
  }));
  const existingLog = getLessonLogBySessionKey(sessionKey);
  const now = new Date().toISOString();
  const log = {
    sessionKey,
    date: formatDateValue(session.date),
    className: session.className,
    day: session.day,
    startTime: session.startTime,
    endTime: session.endTime,
    teacher: session.teacher,
    taught: lessonLogTaught.value.trim(),
    homework: lessonLogHomework.value.trim(),
    note: lessonLogNote.value.trim(),
    studentNotes,
    createdAt: existingLog ? existingLog.createdAt : now,
    updatedAt: now
  };

  upsertLessonLog(log);
  data.completedSessions[sessionKey] = true;
  completeSessionAttendance(session);
  normalizeData();
  saveData(true);
  closeLessonLogModal();
  renderStudents();
  renderWeeklySchedule();
  renderAttendanceBoard();
  renderLessonLogs();
  renderStudentProgress();
  renderFinance();
}

function upsertLessonLog(log) {
  const index = data.lessonLogs.findIndex(existingLog => existingLog.sessionKey === log.sessionKey);
  if (index >= 0) {
    data.lessonLogs[index] = log;
  } else {
    data.lessonLogs.push(log);
  }
}

function getLessonLogBySessionKey(sessionKey) {
  return data.lessonLogs.find(log => log.sessionKey === sessionKey);
}

function removeLessonLog(sessionKey) {
  data.lessonLogs = data.lessonLogs.filter(log => log.sessionKey !== sessionKey);
}

function completeSessionAttendance(session) {
  const students = getStudentsByClass(session.className);
  setFinanceSessionStudentSnapshot(session, students.map(({ student }) => student));

  students.forEach(({ student, index }) => {
    const existingKey = findSessionAttendanceKey(session, student);
    if (existingKey) return;

    const lessonIndex = getNextLessonIndex(student);
    const cycleIndex = getNextLessonCycleIndex(student);
    data.attendance[getAttendanceKey(session, student, lessonIndex, cycleIndex)] = true;
    data.students[index].lessonsDone = Math.max(0, Number(data.students[index].lessonsDone || 0)) + 1;
  });
}

function removeSessionAttendance(session) {
  getStudentsByClass(session.className).forEach(({ student, index }) => {
    const existingKey = findSessionAttendanceKey(session, student);
    if (!existingKey) return;

    delete data.attendance[existingKey];
    data.students[index].lessonsDone = Math.max(0, Number(data.students[index].lessonsDone || 0) - 1);
  });
}

function findSessionAttendanceKey(session, student) {
  const prefix = getSessionAttendancePrefix(session, student);
  return Object.keys(data.attendance).find(key => key.startsWith(prefix));
}

function getSessionAttendancePrefix(session, student) {
  return [formatDateValue(session.date), session.className, session.startTime, session.endTime, student.name].join("|") + "|";
}

function getNextLessonIndex(student) {
  const cycleIndex = getNextLessonCycleIndex(student);
  const totalLessons = getStudentCycleLessons(student, cycleIndex);
  return getCompletedLessonsBeforeNextLesson(student, cycleIndex, totalLessons);
}

function getNextLessonCycleIndex(student) {
  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);
  if (!lessonsDone) return 0;

  let remainingLessons = lessonsDone;
  let cycleIndex = 0;

  while (remainingLessons >= getStudentCycleLessons(student, cycleIndex)) {
    remainingLessons -= getStudentCycleLessons(student, cycleIndex);
    cycleIndex += 1;
    if (cycleIndex > 200) break;
  }

  return cycleIndex;
}

function getSessionKey(session) {
  return [formatDateValue(session.date), session.className, session.startTime, session.endTime].join("|");
}

function isTeachingTeacher(teacher) {
  const cleanTeacher = String(teacher || "").trim().toLowerCase();
  return cleanTeacher !== "" && cleanTeacher !== "off";
}

function renderAttendanceBoard() {
  attendanceBoard.innerHTML = "";
  const sessions = getAttendanceSessions();
  const sessionGroups = getFilteredAttendanceGroups(groupAttendanceSessionsByClass(sessions));

  if (!sessionGroups.length) {
    const empty = document.createElement("div");
    empty.className = "attendance-empty";
    empty.textContent = attendanceClassFilter.value
      ? "No attendance sheet for this class this week."
      : "Add teacher names in Schedule to create attendance sheets for this week.";
    attendanceBoard.append(empty);
    return;
  }

  let currentGroup = "";

  sessionGroups.forEach(group => {
    const groupLabel = getClassCategoryLabel(group.className);
    if (groupLabel !== currentGroup) {
      const heading = document.createElement("h3");
      heading.className = "attendance-group-heading";
      heading.textContent = groupLabel;
      attendanceBoard.append(heading);
      currentGroup = groupLabel;
    }

    const session = getClassAttendanceSession(group);
    const card = document.createElement("article");
    const header = document.createElement("div");
    const headerText = document.createElement("div");
    const classTitle = document.createElement("strong");
    const sessionText = document.createElement("span");
    const roster = document.createElement("div");
    const students = getAttendanceStudentsByClass(session.className);

    card.className = "attendance-card";
    header.className = "attendance-card-header";
    headerText.className = "attendance-card-title";
    classTitle.textContent = session.className;
    sessionText.textContent = formatAttendanceGroupSchedule(group);
    headerText.append(classTitle, sessionText);
    header.append(headerText);
    roster.className = "attendance-roster";

    if (!students.length) {
      const emptyClass = document.createElement("p");
      emptyClass.className = "attendance-empty inline";
      emptyClass.textContent = "No students in this class.";
      roster.append(emptyClass);
    }

    students.forEach(({ student, index }) => {
      roster.append(createAttendanceRow(student, session, index));
    });

    card.append(header, roster);
    attendanceBoard.append(card);
  });
}

function groupAttendanceSessionsByClass(sessions) {
  const groups = new Map();

  sessions.forEach(session => {
    const key = session.className.trim();
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        className: session.className,
        sessions: []
      });
    }

    groups.get(key).sessions.push(session);
  });

  return [...groups.values()];
}

function getClassAttendanceSession(group) {
  const firstSession = group.sessions[0];

  return {
    ...firstSession,
    date: selectedWeekStart,
    startTime: "",
    endTime: "",
    teacher: group.sessions.map(session => session.teacher).filter(Boolean).join(", ")
  };
}

function formatAttendanceGroupSchedule(group) {
  return getLatestAttendanceSessions(group.sessions, 2)
    .map(session => `${session.dayLabel.slice(0, 3)} ${formatShortDate(session.date)} | ${session.startTime}-${session.endTime} | ${session.teacher}`)
    .join("  /  ");
}

function getLatestAttendanceSessions(sessions, limit) {
  return [...sessions]
    .sort((first, second) => {
      const firstTime = first.date.getTime() + timeToMinutes(first.startTime);
      const secondTime = second.date.getTime() + timeToMinutes(second.startTime);
      return secondTime - firstTime;
    })
    .slice(0, limit);
}

function createAttendanceRow(student, session, studentIndex) {
  const row = document.createElement("div");
  const nameBlock = document.createElement("div");
  const name = document.createElement("strong");
  const meta = document.createElement("span");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const noteButton = document.createElement("button");
  const exportButton = document.createElement("button");
  const rowKey = getAttendanceRowKey(session, studentIndex);
  const isEditing = editingAttendanceRows.has(rowKey);
  const isNoteEditing = noteEditingAttendanceRows.has(rowKey);
  const selectedCycleIndex = getSelectedAttendanceCycle(rowKey, student);
  const progress = createAttendanceProgress(student, session, isEditing, selectedCycleIndex);
  const cycleTabs = createAttendanceCycleTabs(rowKey, student, selectedCycleIndex);
  const noteBlock = createAttendanceNoteField(student, selectedCycleIndex, isEditing || isNoteEditing);

  row.className = student.status === "Temporary pause" ? "attendance-row paused-student" : "attendance-row";
  row.dataset.attendanceRowKey = rowKey;
  nameBlock.className = "attendance-student";
  actions.className = "attendance-actions";
  name.textContent = student.name;
  meta.textContent = student.status === "Temporary pause"
    ? `Temporary pause | ${getAttendanceCycleRangeText(student, session, selectedCycleIndex)}`
    : getAttendanceCycleRangeText(student, session, selectedCycleIndex);
  editButton.type = "button";
  editButton.className = isEditing ? "save-attendance-button" : "edit-attendance-button";
  editButton.textContent = isEditing ? "Save" : "Edit";
  editButton.classList.toggle("role-hidden", !can("attendance.edit") && !can("all"));
  editButton.addEventListener("click", () => {
    if (isEditing) {
      saveAttendanceEdit(row, student, studentIndex, session, rowKey);
    } else {
      editingAttendanceRows.add(rowKey);
      noteEditingAttendanceRows.delete(rowKey);
      renderAttendanceBoard();
    }
  });
  noteButton.type = "button";
  noteButton.className = isNoteEditing ? "save-attendance-button" : "note-attendance-button";
  noteButton.textContent = isNoteEditing ? "Save note" : "Note";
  noteButton.classList.toggle("role-hidden", (!can("attendance.note") && !can("attendance.edit") && !can("all")) || isEditing);
  noteButton.addEventListener("click", () => {
    if (isNoteEditing) {
      saveAttendanceNoteOnly(row, student, selectedCycleIndex, rowKey);
    } else {
      noteEditingAttendanceRows.add(rowKey);
      renderAttendanceBoard();
    }
  });
  exportButton.type = "button";
  exportButton.className = "export-attendance-button";
  exportButton.textContent = "Export CSV";
  exportButton.addEventListener("click", () => exportStudentAttendanceCsv(student));

  nameBlock.append(name, cycleTabs, meta);
  actions.append(editButton, noteButton, exportButton);
  row.append(nameBlock, progress, noteBlock, actions);
  return row;
}

function createAttendanceNoteField(student, cycleIndex, isEditing) {
  const wrapper = document.createElement("label");
  const label = document.createElement("span");
  const textarea = document.createElement("textarea");
  const note = getAttendanceCycleNote(student, cycleIndex);

  wrapper.className = "attendance-note-field";
  label.textContent = "Note";
  textarea.className = "attendance-note-input";
  textarea.value = note;
  textarea.placeholder = "Make-up class, schedule change, payment note...";
  textarea.rows = 2;
  textarea.readOnly = !isEditing;

  if (!isEditing && !note) {
    textarea.placeholder = "No note";
  }

  wrapper.append(label, textarea);
  return wrapper;
}

function createAttendanceProgress(student, session, isEditing, selectedCycleIndex) {
  const totalLessons = getStudentCycleLessons(student, selectedCycleIndex);
  const cycleIndex = getCurrentCycleIndex(student);
  const completedLessons = getCompletedLessonsForCycle(student, selectedCycleIndex);
  const wrapper = document.createElement("div");

  wrapper.className = `attendance-progress ${totalLessons === 24 ? "course-attendance" : "monthly-attendance"}`;
  wrapper.dataset.preserveDoneCount = completedLessons;

  for (let index = 0; index < totalLessons; index += 1) {
    const button = document.createElement("button");
    const dateValue = getAttendanceDateValue(session, student, index, selectedCycleIndex);
    const checked = selectedCycleIndex === cycleIndex
      ? index < completedLessons || Boolean(dateValue)
      : Boolean(dateValue);
    const dateLabel = dateValue ? formatShortDate(parseDateValue(dateValue)) : "";

    button.type = "button";
    button.className = checked ? "attendance-dot checked" : "attendance-dot";
    button.dataset.lessonIndex = index;
    button.dataset.date = dateValue;
    button.setAttribute("aria-label", `Lesson ${index + 1}`);
    if (dateLabel) {
      button.textContent = dateLabel;
      button.title = `Lesson ${index + 1}: ${dateLabel}`;
    }
    button.disabled = !isEditing;
    if (isEditing) {
      button.classList.add("editable");
      button.addEventListener("click", () => editAttendanceCell(button, index));
    }
    wrapper.append(button);
  }

  const cycle = document.createElement("span");
  cycle.className = "attendance-cycle";
  cycle.textContent = getCycleLetter(selectedCycleIndex);
  wrapper.append(cycle);
  return wrapper;
}

function createAttendanceCycleTabs(rowKey, student, selectedCycleIndex) {
  const tabs = document.createElement("div");
  const hasManualCycleView = attendanceCycleViews.has(rowKey);
  const maxCycleCount = getAttendanceCycleCount(student);

  tabs.className = "attendance-cycle-tabs";

  const currentButton = createAttendanceCycleButton("Current", !hasManualCycleView, () => {
    attendanceCycleViews.delete(rowKey);
    renderAttendanceBoard();
  });
  tabs.append(currentButton);

  for (let cycleIndex = 0; cycleIndex < maxCycleCount; cycleIndex += 1) {
    const button = createAttendanceCycleButton(getCycleLetter(cycleIndex), hasManualCycleView && selectedCycleIndex === cycleIndex, () => {
      attendanceCycleViews.set(rowKey, cycleIndex);
      renderAttendanceBoard();
    });
    tabs.append(button);
  }

  return tabs;
}

function createAttendanceCycleButton(label, isActive, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = isActive ? "cycle-tab active" : "cycle-tab";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function getSelectedAttendanceCycle(rowKey, student) {
  if (attendanceCycleViews.has(rowKey)) return attendanceCycleViews.get(rowKey);
  return getCurrentCycleIndex(student);
}

function getAttendanceRowKey(session, studentIndex) {
  return [session.className, studentIndex].join("|");
}

function getAttendanceNoteKey(student, cycleIndex) {
  return [student.className, student.name, Number(cycleIndex) || 0].join("|");
}

function getAttendanceCycleNote(student, cycleIndex) {
  return data.attendanceNotes?.[getAttendanceNoteKey(student, cycleIndex)] || "";
}

function saveAttendanceCycleNote(student, cycleIndex, note) {
  const key = getAttendanceNoteKey(student, cycleIndex);
  const cleanNote = repairVietnameseText(String(note || "").trim());

  data.attendanceNotes = data.attendanceNotes && typeof data.attendanceNotes === "object" ? data.attendanceNotes : {};
  if (cleanNote) {
    data.attendanceNotes[key] = cleanNote;
  } else {
    delete data.attendanceNotes[key];
  }
}

function getAttendanceCycleRangeText(student, session, cycleIndex) {
  const totalLessons = getStudentCycleLessons(student, cycleIndex);
  const completedLessons = getCompletedLessonsForCycle(student, cycleIndex);
  const startDate = getAttendanceCycleStartDate(student, session, cycleIndex);
  const endDate = completedLessons === totalLessons
    ? getAttendanceDateLabel(session, student, totalLessons - 1, cycleIndex) || "..."
    : "...";
  const paymentStatus = getCyclePaymentStatus(student, cycleIndex);

  return `${getCycleLetter(cycleIndex)}: ${completedLessons}/${totalLessons} | ${paymentStatus} | ${startDate || "..."} - ${endDate}`;
}

function getAttendanceCycleStartDate(student, session, cycleIndex) {
  const paymentRecord = getPaymentRecordForCycle(student, cycleIndex);
  if (paymentRecord?.date) return formatStoredDate(paymentRecord.date);

  const firstLessonDate = getAttendanceDateLabel(session, student, 0, cycleIndex);
  if (firstLessonDate) return firstLessonDate;

  const currentCycleIndex = getCurrentCycleIndex(student);
  if (cycleIndex === currentCycleIndex) return formatStoredDate(student.lastPaymentDate);

  return "";
}

function getAttendanceCycleCount(student) {
  return Math.max(
    getCurrentCycleIndex(student) + 1,
    getPaidCycleCount(student),
    1
  );
}

function getPaidCycleCount(student) {
  const history = normalizePaymentHistory(student.paymentHistory);
  if (history.length) {
    return Math.max(...history.map(record => record.cycleIndex)) + 1;
  }
  return Math.ceil(getStudentPaidLessons(student) / getStudentCycleLessons(student));
}

function getCyclePaymentStatus(student, cycleIndex) {
  const record = getPaymentRecordForCycle(student, cycleIndex);
  if (record) return `Paid ${formatStoredDate(record.date)}`;
  return cycleIndex < getPaidCycleCount(student) ? "Paid" : "Pending payment";
}

function getPaymentRecordForCycle(student, cycleIndex) {
  return normalizePaymentHistory(student.paymentHistory)
    .find(record => Number(record.cycleIndex) === Number(cycleIndex));
}

function getAttendanceCycleDateCount(student, cycleIndex) {
  const totalLessons = getStudentCycleLessons(student, cycleIndex);
  let count = 0;

  for (let lessonIndex = 0; lessonIndex < totalLessons; lessonIndex += 1) {
    if (getAttendanceDateValue(null, student, lessonIndex, cycleIndex)) count += 1;
  }

  return count;
}

function getCompletedLessonsInCurrentCycle(student, totalLessons) {
  if (normalizePaymentHistory(student.paymentHistory).length) {
    return getCompletedLessonsForCycle(student, getCurrentCycleIndex(student));
  }

  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);
  if (!lessonsDone) return 0;

  const completedLessons = lessonsDone % totalLessons;
  return completedLessons === 0 ? totalLessons : completedLessons;
}

function getCurrentCycleIndex(student, totalLessons) {
  const normalizedTotalLessons = totalLessons || getStudentCycleLessons(student);
  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);
  if (!lessonsDone) return 0;
  const history = normalizePaymentHistory(student.paymentHistory);

  if (history.length) {
    let remainingLessons = lessonsDone;
    const maxCycleIndex = Math.max(...history.map(record => record.cycleIndex), 0);

    for (let cycleIndex = 0; cycleIndex <= maxCycleIndex; cycleIndex += 1) {
      const cycleLessons = getStudentCycleLessons(student, cycleIndex);
      if (remainingLessons <= cycleLessons) return cycleIndex;
      remainingLessons -= cycleLessons;
    }

    const fallbackLessons = getStudentCycleLessons(student);
    return maxCycleIndex + Math.floor((remainingLessons - 1) / fallbackLessons) + 1;
  }

  return Math.floor((lessonsDone - 1) / normalizedTotalLessons);
}

function getCompletedLessonsForCycle(student, cycleIndex) {
  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);
  if (!lessonsDone) return 0;

  const remainingLessons = lessonsDone - getCompletedLessonsBeforeCycle(student, cycleIndex);

  if (remainingLessons <= 0) return 0;
  return Math.min(remainingLessons, getStudentCycleLessons(student, cycleIndex));
}

function getCompletedLessonsBeforeCycle(student, cycleIndex) {
  let completedBeforeCycle = 0;

  for (let index = 0; index < cycleIndex; index += 1) {
    completedBeforeCycle += getStudentCycleLessons(student, index);
  }

  return completedBeforeCycle;
}

function getCompletedLessonsBeforeNextLesson(student, cycleIndex, totalLessons) {
  const completedLessons = getCompletedLessonsForCycle(student, cycleIndex);
  return completedLessons >= totalLessons ? 0 : completedLessons;
}

function toggleAttendanceDot(attendanceKey) {
  if (data.attendance[attendanceKey]) {
    delete data.attendance[attendanceKey];
  } else {
    data.attendance[attendanceKey] = true;
  }

  saveData(false);
  renderAttendanceBoard();
  renderFinance();
}

function editAttendanceCell(button, lessonIndex) {
  editingAttendanceCell = {
    button,
    lessonIndex
  };
  attendanceDateInput.value = button.dataset.date || "";
  attendanceDateModal.classList.add("open");
  attendanceDateModal.setAttribute("aria-hidden", "false");
  attendanceDateInput.focus();
  if (typeof attendanceDateInput.showPicker === "function") {
    attendanceDateInput.showPicker();
  }
}

function setAttendanceCellDate(button, lessonIndex, dateValue) {
  const normalizedDate = normalizeDateInput(dateValue);
  if (!normalizedDate) return;

  button.dataset.date = normalizedDate;
  button.textContent = formatShortDate(parseDateValue(normalizedDate));
  button.title = `Lesson ${lessonIndex + 1}: ${button.textContent}`;
  button.classList.add("checked");
}

function clearAttendanceCellDate(button, lessonIndex) {
  button.dataset.date = "";
  button.textContent = "";
  button.title = `Lesson ${lessonIndex + 1}`;
  button.classList.remove("checked");
}

function applyAttendanceDateFromModal() {
  if (!editingAttendanceCell) return;

  setAttendanceCellDate(editingAttendanceCell.button, editingAttendanceCell.lessonIndex, attendanceDateInput.value);
  closeAttendanceDateModal();
}

function clearAttendanceDateFromModal() {
  if (!editingAttendanceCell) return;

  clearAttendanceCellDate(editingAttendanceCell.button, editingAttendanceCell.lessonIndex);
  closeAttendanceDateModal();
}

function closeAttendanceDateModal() {
  attendanceDateModal.classList.remove("open");
  attendanceDateModal.setAttribute("aria-hidden", "true");
  editingAttendanceCell = null;
}

function saveAttendanceEdit(row, student, studentIndex, session, rowKey) {
  const cycleIndex = getSelectedAttendanceCycle(rowKey, student);
  const currentCycleIndex = getCurrentCycleIndex(student);
  const noteInput = row.querySelector(".attendance-note-input");
  let datedLessons = 0;

  row.querySelectorAll(".attendance-dot").forEach(button => {
    const lessonIndex = Number(button.dataset.lessonIndex);
    const dateValue = button.dataset.date || "";

    removeAttendanceLessonDate(student, lessonIndex, cycleIndex);

    if (!dateValue) return;

    const attendanceSession = {
      ...session,
      date: parseDateValue(dateValue)
    };

    data.attendance[getAttendanceKey(attendanceSession, student, lessonIndex, cycleIndex)] = true;
    datedLessons += 1;
  });

  if (cycleIndex === currentCycleIndex) {
    data.students[studentIndex].lessonsDone = getCompletedLessonsBeforeCycle(student, cycleIndex) + datedLessons;
  }

  saveAttendanceCycleNote(student, cycleIndex, noteInput?.value || "");
  editingAttendanceRows.delete(rowKey);
  noteEditingAttendanceRows.delete(rowKey);
  saveData(true);
  renderStudents();
  renderAttendanceBoard();
  renderFinance();
}

function saveAttendanceNoteOnly(row, student, cycleIndex, rowKey) {
  if (!can("attendance.note") && !can("attendance.edit") && !can("all")) return;

  const noteInput = row.querySelector(".attendance-note-input");
  saveAttendanceCycleNote(student, cycleIndex, noteInput?.value || "");
  noteEditingAttendanceRows.delete(rowKey);
  saveData(true);
  renderAttendanceBoard();
}

function removeAttendanceLessonDate(student, lessonIndex, cycleIndex) {
  Object.keys(data.attendance).forEach(key => {
    if (isAttendanceKeyForStudentLesson(key, student, lessonIndex, cycleIndex)) delete data.attendance[key];
  });
}

function removeAttendanceCycle(student, cycleIndex) {
  Object.keys(data.attendance).forEach(key => {
    const parts = key.split("|");
    const keyStudentName = parts[4] || "";
    const keyCycleIndex = parts.length >= 7 ? Number(parts[5]) : 0;

    if (
      normalizeSearchText(keyStudentName) === normalizeSearchText(student.name)
      && keyCycleIndex === Number(cycleIndex)
    ) {
      delete data.attendance[key];
    }
  });
}

function removeAttendanceCycleNote(student, cycleIndex) {
  if (!data.attendanceNotes) return;
  delete data.attendanceNotes[getAttendanceNoteKey(student, cycleIndex)];
}

function getAttendanceDateLabel(session, student, lessonIndex, cycleIndex = getCurrentCycleIndex(student, getStudentCycleLessons(student))) {
  const dateValue = getAttendanceDateValue(session, student, lessonIndex, cycleIndex);
  return dateValue ? formatShortDate(parseDateValue(dateValue)) : "";
}

function getAttendanceDateValue(session, student, lessonIndex, cycleIndex = getCurrentCycleIndex(student, getStudentCycleLessons(student))) {
  if (session) {
    const exactKey = getAttendanceKey(session, student, lessonIndex, cycleIndex);
    if (data.attendance[exactKey]) return formatDateValue(session.date);

    const legacyExactKey = getLegacyAttendanceKey(session, student, lessonIndex);
    if (data.attendance[legacyExactKey]) return formatDateValue(session.date);
  }

  const matchingKey = Object.keys(data.attendance)
    .find(key => isAttendanceKeyForStudentLesson(key, student, lessonIndex, cycleIndex))
    || Object.keys(data.attendance)
      .find(key => isAttendanceKeyForStudentLessonAnyClass(key, student, lessonIndex, cycleIndex));
  if (!matchingKey) return "";

  const [dateValue] = matchingKey.split("|");
  return dateValue;
}

function isAttendanceKeyForStudentLesson(key, student, lessonIndex, cycleIndex) {
  const parts = key.split("|");
  if (parts.length < 6) return false;

  const keyClassName = parts[1] || "";
  const keyStudentName = parts[4] || "";
  const keyCycleIndex = parts.length >= 7 ? Number(parts[5]) : 0;
  const keyLessonIndex = Number(parts.length >= 7 ? parts[6] : parts[5]);

  return normalizeSearchText(keyClassName) === normalizeSearchText(student.className)
    && normalizeSearchText(keyStudentName) === normalizeSearchText(student.name)
    && keyCycleIndex === Number(cycleIndex)
    && keyLessonIndex === Number(lessonIndex);
}

function isAttendanceKeyForStudentLessonAnyClass(key, student, lessonIndex, cycleIndex) {
  const parts = key.split("|");
  if (parts.length < 6) return false;

  const keyStudentName = parts[4] || "";
  const keyCycleIndex = parts.length >= 7 ? Number(parts[5]) : 0;
  const keyLessonIndex = Number(parts.length >= 7 ? parts[6] : parts[5]);

  return normalizeSearchText(keyStudentName) === normalizeSearchText(student.name)
    && keyCycleIndex === Number(cycleIndex)
    && keyLessonIndex === Number(lessonIndex);
}

function exportStudentAttendanceCsv(student) {
  const cycleCount = getAttendanceCycleCount(student);
  const rows = [
    ["Student Name", student.name],
    ["Class", student.className],
    ["Payment Type", formatPaymentType(student)],
    ["Lessons Done", student.lessonsDone],
    ["Current Cycle Lessons", getStudentCycleLessons(student, getCurrentCycleIndex(student))],
    ["Paid Lessons", getStudentPaidLessons(student)],
    [],
    ["Cycle", "Payment", "Lesson", "Date", "Status"]
  ];

  for (let cycleIndex = 0; cycleIndex < cycleCount; cycleIndex += 1) {
    const totalLessons = getStudentCycleLessons(student, cycleIndex);
    for (let lessonIndex = 0; lessonIndex < totalLessons; lessonIndex += 1) {
      const dateValue = getAttendanceDateValue(null, student, lessonIndex, cycleIndex);
      rows.push([
        getCycleLetter(cycleIndex),
        getCyclePaymentStatus(student, cycleIndex),
        lessonIndex + 1,
        dateValue || "",
        dateValue ? "Done" : ""
      ]);
    }
  }

  downloadCsv(
    rows,
    `mandy-english-attendance-${slugifyFileName(student.name)}-${slugifyFileName(student.className)}.csv`
  );
}

function downloadCsv(rows, fileName) {
  const csv = rows.map(row => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function slugifyFileName(value) {
  const slug = normalizeSearchText(value).replace(/\s+/g, "-");
  return slug || "student";
}

function getAttendanceSessions() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayLabels = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  };
  const weekDates = getSelectedWeekDates();

  return days.flatMap((day, dayIndex) => getClassesForDay(day).map(classSlot => {
    const date = weekDates[dayIndex];
    const teacherKey = getTeacherKey(day, classSlot, date);
    const legacyTeacherKey = getLegacyTeacherKey(day, classSlot);
    const teacher = data.teachers[teacherKey] || getCurrentWeekLegacyTeacher(legacyTeacherKey);

    return {
      ...classSlot,
      date,
      day,
      dayLabel: dayLabels[day],
      teacher
    };
  })).filter(session => {
    const teacher = String(session.teacher || "").trim().toLowerCase();
    return teacher && teacher !== "off";
  });
}

function getStudentsByClass(className) {
  return data.students
    .map((student, index) => ({ student, index }))
    .filter(({ student }) => student.className.trim() === className.trim() && student.status === "Active");
}

function getAttendanceStudentsByClass(className) {
  return data.students
    .map((student, index) => ({ student, index }))
    .filter(({ student }) => {
      const sameClass = student.className.trim() === className.trim();
      const visibleStatus = student.status === "Active" || student.status === "Temporary pause";
      return sameClass && visibleStatus;
    });
}

function getPaidActiveStudentsByClass(className) {
  return getStudentsByClass(className)
    .filter(({ student }) => normalizePaymentType(student.paymentType) !== "Free");
}

function renderFinance() {
  updateFinanceRangeFields();
  renderFinanceClassFees();
  renderFinanceProjection();
  renderFinanceRevenue();
  renderNavFinanceNetProfit();
}

function renderNavFinanceNetProfit() {
  if (!navFinanceNetProfit) return;
  const now = new Date();
  const start = formatDateValue(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = formatDateValue(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const rows = getFinanceRevenueRows({ start, end });
  const totals = rows.reduce((summary, row) => {
    summary.revenue += row.revenue;
    summary.cost += row.cost;
    return summary;
  }, { revenue: 0, cost: 0 });
  navFinanceNetProfit.textContent = formatCurrency(totals.revenue - totals.cost);
}

function renderFinanceClassFees() {
  financeClassFeeRows.innerHTML = "";
  const entries = getSortedClassEntries(data.classes.map((classItem, index) => ({ classItem, index })));

  if (!entries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted-cell";
    cell.textContent = "No classes yet.";
    row.append(cell);
    financeClassFeeRows.append(row);
    return;
  }

  entries.forEach(({ classItem }) => {
    const row = document.createElement("tr");
    const paidStudents = getPaidActiveStudentsByClass(classItem.name);
    const fee = getClassFeePerLesson(classItem.name);

    row.append(createPlainCell(classItem.name, "readonly-cell"));
    row.append(createPlainCell(paidStudents.length, "plain-cell finance-number-cell"));
    row.append(createFinanceFeeInputCell(classItem.name, fee));
    row.append(createPlainCell(formatCurrency(paidStudents.length * fee), "plain-cell finance-money-cell"));
    financeClassFeeRows.append(row);
  });
}

function renderFinanceProjection() {
  const range = getFinanceDateRange();
  const rows = getFinanceProjectionRows(range);
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);

  financeProjectedLabel.textContent = `${range.label} Scheduled Revenue`;
  financeProjectedTitle.textContent = `${range.label} Scheduled Revenue Estimate`;
  financeProjectedRevenue.textContent = formatCurrency(total);
  financeProjectedRows.innerHTML = "";

  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "muted-cell";
    cell.textContent = "No scheduled lessons for this period.";
    row.append(cell);
    financeProjectedRows.append(row);
    return;
  }

  rows.forEach(item => {
    const row = document.createElement("tr");
    row.append(createPlainCell(formatStoredDate(item.dateValue), "plain-cell"));
    row.append(createPlainCell(item.className, "plain-cell"));
    row.append(createPlainCell(`${item.startTime}-${item.endTime}`, "plain-cell"));
    row.append(createPlainCell(item.teacher || "-", "plain-cell muted-cell"));
    row.append(createFinanceProjectedStudentsCell(item.paidStudents));
    row.append(createPlainCell(item.feePerLesson ? formatCurrency(item.revenue) : "Missing fee", item.feePerLesson ? "plain-cell finance-money-cell" : "plain-cell reminder-due"));
    financeProjectedRows.append(row);
  });
}

function createFinanceProjectedStudentsCell(students) {
  const cell = createPlainCell(students.length, "plain-cell finance-number-cell");
  const names = students.map(student => student.name).filter(Boolean).join(", ");
  if (names) cell.title = names;
  return cell;
}

function getFinanceProjectionRows(range) {
  const rows = [];

  getDateValuesInRange(range.start, range.end).forEach(dateValue => {
    const date = parseDateValue(dateValue);
    const day = getDayCodeFromDate(date);
    const weekStart = getWeekStart(date);

    getClassesForDayForWeek(day, weekStart).forEach(classSlot => {
      const teacherKey = getTeacherKey(day, classSlot, date);
      const legacyTeacherKey = getLegacyTeacherKey(day, classSlot);
      const teacher = data.teachers[teacherKey] || getLegacyTeacherForWeek(legacyTeacherKey, weekStart);
      if (isOffTeacher(teacher)) return;

      const paidStudents = getPaidActiveStudentsByClass(classSlot.className).map(({ student }) => student);
      const feePerLesson = getClassFeePerLesson(classSlot.className);

      rows.push({
        dateValue,
        className: classSlot.className,
        startTime: classSlot.startTime,
        endTime: classSlot.endTime,
        teacher,
        paidStudents,
        feePerLesson,
        revenue: paidStudents.length * feePerLesson
      });
    });
  });

  return rows.sort((first, second) => `${first.dateValue} ${first.startTime} ${first.className}`.localeCompare(`${second.dateValue} ${second.startTime} ${second.className}`));
}

function getDateValuesInRange(startValue, endValue) {
  const dates = [];
  let cursor = parseDateValue(startValue);
  const endDate = parseDateValue(endValue);

  while (cursor <= endDate) {
    dates.push(formatDateValue(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function setFinanceSessionStudentSnapshot(session, students) {
  const sessionKey = getSessionKey(session);
  data.finance = data.finance && typeof data.finance === "object" ? data.finance : {};
  data.finance.sessionStudents = data.finance.sessionStudents && typeof data.finance.sessionStudents === "object" ? data.finance.sessionStudents : {};
  data.finance.sessionStudents[sessionKey] = students.map(student => ({
    name: student.name,
    paymentType: normalizePaymentType(student.paymentType)
  }));
}

function deleteFinanceSessionSnapshot(sessionKey) {
  if (data.finance?.sessionStudents) delete data.finance.sessionStudents[sessionKey];
}

function createFinanceFeeInputCell(className, value) {
  const cell = document.createElement("td");
  const input = document.createElement("input");

  input.type = "text";
  input.inputMode = "numeric";
  input.value = value ? formatMoneyInput(value) : "";
  input.placeholder = "Example: 200000";
  input.addEventListener("change", event => {
    setClassFeePerLesson(className, event.target.value);
    saveData(false);
    renderFinance();
  });

  cell.append(input);
  return cell;
}

function renderFinanceRevenue() {
  const range = getFinanceDateRange();
  const rows = getFinanceRevenueRows(range);
  const totals = rows.reduce((summary, row) => {
    summary.revenue += row.revenue;
    summary.cost += row.cost;
    return summary;
  }, { revenue: 0, cost: 0 });

  financeRevenueLabel.textContent = `${range.label} Revenue`;
  financeCostLabel.textContent = `${range.label} Cost`;
  financeDetailTitle.textContent = `${range.label} Revenue Detail`;
  financeDailyRevenue.textContent = formatCurrency(totals.revenue);
  financeDailyCost.textContent = formatCurrency(totals.cost);
  financeNetProfit.textContent = formatCurrency(totals.revenue - totals.cost);
  financeCompletedLessons.textContent = rows.length;
  financeRevenueRows.innerHTML = "";

  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.className = "muted-cell";
    cell.textContent = "No Done lessons for this period.";
    row.append(cell);
    financeRevenueRows.append(row);
    return;
  }

  rows.forEach(item => {
    const row = document.createElement("tr");
    row.append(createPlainCell(formatStoredDate(item.dateValue), "plain-cell"));
    row.append(createPlainCell(item.className, "plain-cell"));
    row.append(createPlainCell(`${item.startTime}-${item.endTime}`, "plain-cell"));
    row.append(createPlainCell(item.teacher || "-", "plain-cell muted-cell"));
    row.append(createFinancePaidStudentsCell(item.paidStudents));
    row.append(createPlainCell(item.feePerLesson ? formatCurrency(item.revenue) : "Missing fee", item.feePerLesson ? "plain-cell finance-money-cell" : "plain-cell reminder-due"));
    row.append(createFinanceCostInputCell(item));
    row.append(createPlainCell(formatCurrency(item.revenue - item.cost), "plain-cell finance-money-cell"));
    financeRevenueRows.append(row);
  });
}

function createFinancePaidStudentsCell(records) {
  const cell = createPlainCell(records.length, "plain-cell finance-number-cell");
  const names = records.map(record => record.studentName).filter(Boolean).join(", ");
  if (names) cell.title = names;
  return cell;
}

function createFinanceCostInputCell(item) {
  const cell = document.createElement("td");
  const input = document.createElement("input");

  input.type = "text";
  input.inputMode = "numeric";
  input.value = item.cost ? formatMoneyInput(item.cost) : "";
  input.placeholder = "0";
  input.addEventListener("change", event => {
    setSessionCost(item.sessionKey, event.target.value);
    saveData(false);
    renderFinanceRevenue();
  });

  cell.append(input);
  return cell;
}

function getFinanceRevenueRows(range) {
  return getCompletedFinanceSessions()
    .filter(session => session.dateValue >= range.start && session.dateValue <= range.end)
    .map(session => {
      const paidStudents = getFinancePaidAttendanceRecords(session);
      const feePerLesson = getClassFeePerLesson(session.className);
      const revenue = paidStudents.length * feePerLesson;
      const cost = getSessionCost(session.sessionKey);

      return {
        ...session,
        teacher: getFinanceTeacherName(session),
        paidStudents,
        feePerLesson,
        revenue,
        cost
      };
    })
    .sort((first, second) => `${first.dateValue} ${first.startTime} ${first.className}`.localeCompare(`${second.dateValue} ${second.startTime} ${second.className}`));
}

function getFinancePaidAttendanceRecords(session) {
  const records = getFinanceAttendanceRecordsForSession(session);
  const snapshot = getFinanceSessionStudentSnapshot(session.sessionKey);
  const uniqueByStudent = new Map();

  records.forEach(record => {
    const studentKey = normalizeSearchText(record.studentName);
    if (!studentKey || uniqueByStudent.has(studentKey)) return;
    if (isFreeAttendanceStudent(record.studentName, snapshot)) return;
    uniqueByStudent.set(studentKey, record);
  });

  return [...uniqueByStudent.values()];
}

function getFinanceSessionStudentSnapshot(sessionKey) {
  const snapshot = data.finance?.sessionStudents?.[sessionKey];
  return Array.isArray(snapshot) ? snapshot : [];
}

function getFinanceAttendanceRecordsForSession(session) {
  const exactRecords = [];
  const legacyRecords = [];

  Object.keys(data.attendance || {})
    .map(parseAttendanceRecord)
    .filter(Boolean)
    .forEach(record => {
      const sameDateAndClass = record.dateValue === session.dateValue
        && normalizeSearchText(record.className) === normalizeSearchText(session.className);

      if (!sameDateAndClass) return;

      if (record.startTime === session.startTime && record.endTime === session.endTime) {
        exactRecords.push(record);
        return;
      }

      if (!record.startTime && !record.endTime) {
        legacyRecords.push(record);
      }
    });

  if (!legacyRecords.length) return exactRecords;

  const exactStudentKeys = new Set(exactRecords.map(record => normalizeSearchText(record.studentName)));
  return [
    ...exactRecords,
    ...legacyRecords.filter(record => !exactStudentKeys.has(normalizeSearchText(record.studentName)))
  ];
}

function parseAttendanceRecord(key) {
  const parts = key.split("|");
  if (parts.length < 6) return null;

  return {
    key,
    dateValue: parts[0] || "",
    className: parts[1] || "",
    startTime: parts[2] || "",
    endTime: parts[3] || "",
    studentName: parts[4] || "",
    cycleIndex: parts.length >= 7 ? Number(parts[5]) : 0,
    lessonIndex: Number(parts.length >= 7 ? parts[6] : parts[5])
  };
}

function isFreeAttendanceStudent(studentName, sessionSnapshot = []) {
  const snapshotStudent = sessionSnapshot.find(item => normalizeSearchText(item.name) === normalizeSearchText(studentName));
  if (snapshotStudent) return normalizePaymentType(snapshotStudent.paymentType) === "Free";

  const student = data.students.find(item => normalizeSearchText(item.name) === normalizeSearchText(studentName));
  return student ? normalizePaymentType(student.paymentType) === "Free" : false;
}

function getCompletedFinanceSessions() {
  return Object.entries(data.completedSessions || {})
    .filter(([, isDone]) => Boolean(isDone))
    .map(([sessionKey]) => {
      const [dateValue = "", className = "", startTime = "", endTime = ""] = sessionKey.split("|");
      if (!dateValue || !className) return null;
      return { sessionKey, dateValue, className, startTime, endTime };
    })
    .filter(Boolean);
}

function getFinanceTeacherName(session) {
  const date = parseDateValue(session.dateValue);
  const day = getDayCodeFromDate(date);
  const classSlot = {
    className: session.className,
    startTime: session.startTime,
    endTime: session.endTime
  };
  return data.teachers[getTeacherKey(day, classSlot, date)] || data.teachers[getLegacyTeacherKey(day, classSlot)] || "";
}

function getDayCodeFromDate(date) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()] || "Mon";
}

function updateFinanceRangeFields() {
  const isCustom = financeViewMode.value === "custom";
  financeDate.closest("label").classList.toggle("hidden-field", isCustom);
  financeStartField.classList.toggle("show", isCustom);
  financeEndField.classList.toggle("show", isCustom);
}

function applyFinanceQuickRange(rangeName) {
  const today = new Date();

  if (rangeName === "today") {
    setFinanceDay(today);
    return;
  }

  if (rangeName === "yesterday") {
    setFinanceDay(addDays(today, -1));
    return;
  }

  if (rangeName === "this-week") {
    const weekStart = getWeekStart(today);
    setFinanceCustomRange(weekStart, addDays(weekStart, 6));
    return;
  }

  if (rangeName === "last-week") {
    const weekStart = addDays(getWeekStart(today), -7);
    setFinanceCustomRange(weekStart, addDays(weekStart, 6));
    return;
  }

  if (rangeName === "this-month") {
    setFinanceCustomRange(getMonthStart(today), getMonthEnd(today));
    return;
  }

  if (rangeName === "last-month") {
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    setFinanceCustomRange(getMonthStart(lastMonthDate), getMonthEnd(lastMonthDate));
  }
}

function setFinanceDay(date) {
  financeViewMode.value = "day";
  financeDate.value = formatDateValue(date);
  updateFinanceRangeFields();
  renderFinance();
}

function setFinanceCustomRange(startDate, endDate) {
  financeViewMode.value = "custom";
  financeStartDate.value = formatDateValue(startDate);
  financeEndDate.value = formatDateValue(endDate);
  updateFinanceRangeFields();
  renderFinance();
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getFinanceDateRange() {
  if (financeViewMode.value === "custom") {
    const start = normalizeDateInput(financeStartDate.value) || formatDateValue(getWeekStart(new Date()));
    const end = normalizeDateInput(financeEndDate.value) || start;
    const orderedStart = start <= end ? start : end;
    const orderedEnd = start <= end ? end : start;

    return {
      start: orderedStart,
      end: orderedEnd,
      label: `${formatStoredDate(orderedStart)} - ${formatStoredDate(orderedEnd)}`
    };
  }

  const dateValue = normalizeDateInput(financeDate.value) || formatDateValue(new Date());
  return {
    start: dateValue,
    end: dateValue,
    label: formatStoredDate(dateValue)
  };
}

function getClassFeePerLesson(className) {
  return parseMoneyValue(data.finance?.classFees?.[getFinanceClassKey(className)]);
}

function setClassFeePerLesson(className, value) {
  data.finance = data.finance && typeof data.finance === "object" ? data.finance : {};
  data.finance.classFees = data.finance.classFees && typeof data.finance.classFees === "object" ? data.finance.classFees : {};
  const key = getFinanceClassKey(className);
  const amount = parseMoneyValue(value);

  if (amount > 0) {
    data.finance.classFees[key] = amount;
  } else {
    delete data.finance.classFees[key];
  }
}

function getSessionCost(sessionKey) {
  return parseMoneyValue(data.finance?.sessionCosts?.[sessionKey]);
}

function setSessionCost(sessionKey, value) {
  data.finance = data.finance && typeof data.finance === "object" ? data.finance : {};
  data.finance.sessionCosts = data.finance.sessionCosts && typeof data.finance.sessionCosts === "object" ? data.finance.sessionCosts : {};
  const amount = parseMoneyValue(value);

  if (amount > 0) {
    data.finance.sessionCosts[sessionKey] = amount;
  } else {
    delete data.finance.sessionCosts[sessionKey];
  }
}

function getFinanceClassKey(className) {
  return String(className || "").trim();
}

function parseMoneyValue(value) {
  const amount = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatMoneyInput(value) {
  return String(Math.round(parseMoneyValue(value)));
}

function formatCurrency(value) {
  const amount = Math.round(Number(value) || 0);
  return `${amount.toLocaleString("vi-VN")} VND`;
}

function getAttendanceKey(session, student, lessonIndex, cycleIndex = getCurrentCycleIndex(student, getStudentCycleLessons(student))) {
  return [formatDateValue(session.date), session.className, session.startTime, session.endTime, student.name, cycleIndex, lessonIndex].join("|");
}

function getLegacyAttendanceKey(session, student, lessonIndex) {
  return [formatDateValue(session.date), session.className, session.startTime, session.endTime, student.name, lessonIndex].join("|");
}

function getCycleLetter(index) {
  return String.fromCharCode(65 + Math.max(0, index % 26));
}

function exportScheduleCsv() {
  const rows = getScheduleCsvRows();
  const csv = rows.map(row => row.map(csvEscape).join(",")).join("\r\n");
  const weekDates = getSelectedWeekDates();
  const fileName = `mandy-english-schedule-${formatDateValue(weekDates[0])}_to_${formatDateValue(weekDates[6])}.csv`;
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getScheduleCsvRows() {
  const headers = ["Week Start", "Week End", "Date", "Day", "Shift", "Class", "Start Time", "End Time", "Teacher", "Completed"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayLabels = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  };
  const weekDates = getSelectedWeekDates();
  const weekStart = formatDateValue(weekDates[0]);
  const weekEnd = formatDateValue(weekDates[6]);
  const rows = [headers];

  days.forEach((day, dayIndex) => {
    const date = weekDates[dayIndex];
    getClassesForDay(day).forEach(classSlot => {
      const teacherKey = getTeacherKey(day, classSlot, date);
      const legacyTeacherKey = getLegacyTeacherKey(day, classSlot);
      const teacher = data.teachers[teacherKey] || getCurrentWeekLegacyTeacher(legacyTeacherKey);
      const sessionKey = getSessionKey({ date, className: classSlot.className, startTime: classSlot.startTime, endTime: classSlot.endTime });

      rows.push([
        weekStart,
        weekEnd,
        formatDateValue(date),
        dayLabels[day],
        formatShiftName(classSlot.startTime),
        classSlot.className,
        classSlot.startTime,
        classSlot.endTime,
        teacher,
        data.completedSessions[sessionKey] ? "Yes" : "No"
      ]);
    });
  });

  return rows;
}

function formatShiftName(startTime) {
  const shiftKey = getShiftKey(startTime);
  if (shiftKey === "morning") return "Morning";
  if (shiftKey === "midday") return "Afternoon";
  return "Evening";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function renderWeeklySchedule() {
  renderScheduleWeekNote();
  renderMobileScheduleList();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shifts = [
    { key: "morning", label: "Morning" },
    { key: "midday", label: "Afternoon" },
    { key: "evening", label: "Evening" }
  ];
  const dayLabels = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  };
  const weekDates = getSelectedWeekDates();

  weeklySchedule.innerHTML = "";
  weeklySchedule.className = "weekly-schedule schedule-matrix";

  const emptyHeader = document.createElement("div");
  emptyHeader.className = "schedule-corner";
  weeklySchedule.append(emptyHeader);

  days.forEach((day, index) => {
    const header = document.createElement("div");
    const label = document.createElement("strong");
    const dateLabel = document.createElement("span");

    header.className = "schedule-day-header";
    label.textContent = dayLabels[day];
    dateLabel.className = "day-date";
    dateLabel.textContent = formatShortDate(weekDates[index]);
    header.append(label, dateLabel);
    weeklySchedule.append(header);
  });

  shifts.forEach(shift => {
    const shiftHeader = document.createElement("div");
    shiftHeader.className = "schedule-shift-header";
    shiftHeader.innerHTML = `<strong>${shift.label}</strong>`;
    weeklySchedule.append(shiftHeader);

    days.forEach((day, dayIndex) => {
      const cell = document.createElement("div");
      const classesForDay = getClassesForDay(day);
      const shiftClasses = classesForDay.filter(item => getShiftKey(item.startTime) === shift.key);

      cell.className = "schedule-matrix-cell";

      if (!shiftClasses.length) {
        const empty = document.createElement("p");
        empty.className = "empty-day";
        empty.textContent = "...";
        cell.append(empty);
      }

      shiftClasses.forEach(item => {
        const card = document.createElement("article");
        const details = document.createElement("div");
        const className = document.createElement("strong");
        const time = document.createElement("span");
        const side = document.createElement("div");
        const teacherInput = document.createElement("textarea");
        const doneButton = document.createElement("button");
        const date = weekDates[dayIndex];
        const teacherKey = getTeacherKey(day, item, weekDates[dayIndex]);
        const legacyTeacherKey = getLegacyTeacherKey(day, item);
        const sessionKey = getSessionKey({
          date,
          className: item.className,
          startTime: item.startTime,
          endTime: item.endTime
        });
        const isDone = Boolean(data.completedSessions[sessionKey]);
        const teacherName = data.teachers[teacherKey] || getCurrentWeekLegacyTeacher(legacyTeacherKey);

        card.className = "schedule-card";
        if (isDone) card.classList.add("done-session");
        if (isOffTeacher(teacherName)) card.classList.add("off-session");
        details.className = "schedule-card-main";
        side.className = "schedule-card-side";
        className.textContent = item.className;
        time.textContent = `${item.startTime}-${item.endTime}`;
        teacherInput.className = "teacher-input";
        teacherInput.placeholder = "Teacher";
        teacherInput.value = teacherName;
        teacherInput.rows = 2;
        teacherInput.spellcheck = false;
        teacherInput.disabled = !can("schedule.teacher") && !can("all");
        teacherInput.setAttribute("aria-label", `Teacher for ${item.className}`);
        teacherInput.addEventListener("input", event => {
          const session = {
            date,
            day,
            className: item.className,
            startTime: item.startTime,
            endTime: item.endTime
          };

          updateTeacherName(teacherKey, event.target.value);
          card.classList.toggle("off-session", isOffTeacher(event.target.value));
          renderAttendanceBoard();
          renderFinance();
          if (isOffTeacher(event.target.value) && clearCompletedSession(session)) {
            saveData(true);
            renderStudents();
            renderWeeklySchedule();
            renderAttendanceBoard();
            renderLessonLogs();
            renderStudentProgress();
            renderFinance();
          }
        });
        doneButton.type = "button";
        doneButton.className = isDone ? "done-button done" : "done-button";
        doneButton.textContent = isDone ? "Done" : "Done";
        doneButton.classList.toggle("role-hidden", !can("schedule.done") && !can("all"));
        doneButton.addEventListener("click", () => {
          toggleSessionDone(day, item, date);
        });
        details.append(className, time);
        side.append(teacherInput, doneButton);
        card.append(details, side);
        cell.append(card);
      });

      weeklySchedule.append(cell);
    });
  });
}

function renderMobileScheduleList() {
  if (!mobileScheduleList) return;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shifts = [
    { key: "morning", label: "Morning" },
    { key: "midday", label: "Afternoon" },
    { key: "evening", label: "Evening" }
  ];
  const weekDates = getSelectedWeekDates();
  const todayValue = formatDateValue(new Date());
  const todayIndex = weekDates.findIndex(date => formatDateValue(date) === todayValue);
  const activeIndex = mobileScheduleDayIndex === null ? (todayIndex >= 0 ? todayIndex : 0) : mobileScheduleDayIndex;
  const activeDay = days[activeIndex];
  const activeDate = weekDates[activeIndex];
  const classesForDay = getClassesForDay(activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  mobileScheduleDayIndex = activeIndex;
  mobileScheduleList.innerHTML = "";

  const dayPicker = document.createElement("div");
  dayPicker.className = "mobile-day-picker";

  days.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === activeIndex ? "mobile-day-chip active" : "mobile-day-chip";
    button.innerHTML = `<strong>${day}</strong><span>${formatShortDate(weekDates[index])}</span>`;
    button.addEventListener("click", () => {
      mobileScheduleDayIndex = index;
      renderWeeklySchedule();
    });
    dayPicker.append(button);
  });

  const heading = document.createElement("div");
  heading.className = "mobile-schedule-heading";
  heading.innerHTML = `<span>${formatShortDate(activeDate)}</span><strong>${classesForDay.length} classes</strong>`;

  mobileScheduleList.append(dayPicker, heading);

  shifts.forEach(shift => {
    const shiftItems = classesForDay.filter(item => getShiftKey(item.startTime) === shift.key);
    const section = document.createElement("section");
    const title = document.createElement("h3");

    section.className = "mobile-shift-section";
    title.textContent = shift.label;
    section.append(title);

    if (!shiftItems.length) {
      const empty = document.createElement("p");
      empty.className = "mobile-empty-shift";
      empty.textContent = "No classes";
      section.append(empty);
    }

    shiftItems.forEach(item => {
      section.append(createMobileScheduleCard(activeDay, item, activeDate));
    });

    mobileScheduleList.append(section);
  });
}

function createMobileScheduleCard(day, item, date) {
  const card = document.createElement("article");
  const main = document.createElement("div");
  const meta = document.createElement("div");
  const className = document.createElement("strong");
  const time = document.createElement("span");
  const teacherInput = document.createElement("textarea");
  const doneButton = document.createElement("button");
  const teacherKey = getTeacherKey(day, item, date);
  const legacyTeacherKey = getLegacyTeacherKey(day, item);
  const sessionKey = getSessionKey({
    date,
    className: item.className,
    startTime: item.startTime,
    endTime: item.endTime
  });
  const isDone = Boolean(data.completedSessions[sessionKey]);
  const teacherName = data.teachers[teacherKey] || getCurrentWeekLegacyTeacher(legacyTeacherKey);

  card.className = "mobile-schedule-card";
  if (isDone) card.classList.add("done-session");
  if (isOffTeacher(teacherName)) card.classList.add("off-session");
  main.className = "mobile-schedule-main";
  meta.className = "mobile-schedule-meta";
  className.textContent = item.className;
  time.textContent = `${item.startTime}-${item.endTime}`;
  teacherInput.className = "teacher-input mobile-teacher-input";
  teacherInput.placeholder = "Teacher";
  teacherInput.value = teacherName;
  teacherInput.rows = 2;
  teacherInput.spellcheck = false;
  teacherInput.disabled = !can("schedule.teacher") && !can("all");
  teacherInput.setAttribute("aria-label", `Teacher for ${item.className}`);
  teacherInput.addEventListener("input", event => {
    const session = {
      date,
      day,
      className: item.className,
      startTime: item.startTime,
      endTime: item.endTime
    };

    updateTeacherName(teacherKey, event.target.value);
    card.classList.toggle("off-session", isOffTeacher(event.target.value));
    renderAttendanceBoard();
    renderFinance();
    if (isOffTeacher(event.target.value) && clearCompletedSession(session)) {
      saveData(true);
      renderStudents();
      renderWeeklySchedule();
      renderAttendanceBoard();
      renderLessonLogs();
      renderStudentProgress();
      renderFinance();
    }
  });
  doneButton.type = "button";
  doneButton.className = isDone ? "done-button done" : "done-button";
  doneButton.textContent = "Done";
  doneButton.classList.toggle("role-hidden", !can("schedule.done") && !can("all"));
  doneButton.addEventListener("click", () => {
    toggleSessionDone(day, item, date);
  });

  main.append(className, time);
  meta.append(teacherInput, doneButton);
  card.append(main, meta);
  return card;
}

function getSelectedWeekKey() {
  return formatDateValue(selectedWeekStart);
}

function renderScheduleWeekNote() {
  const weekKey = getSelectedWeekKey();
  scheduleWeekNote.value = data.scheduleNotes?.[weekKey] || "";
  scheduleWeekNote.disabled = !can("schedule.teacher") && !can("all");
}

function saveScheduleWeekNote() {
  if (!can("schedule.teacher") && !can("all")) {
    renderScheduleWeekNote();
    return;
  }

  const weekKey = getSelectedWeekKey();
  const note = repairVietnameseText(scheduleWeekNote.value.trim());
  data.scheduleNotes = data.scheduleNotes && typeof data.scheduleNotes === "object" ? data.scheduleNotes : {};

  if (note) {
    data.scheduleNotes[weekKey] = note;
  } else {
    delete data.scheduleNotes[weekKey];
  }

  saveData(true);
}

function renderWeekOptions() {
  const currentWeekStart = getWeekStart(new Date());
  const selectedValue = formatDateValue(selectedWeekStart);
  const selectedOffset = Math.round((selectedWeekStart - currentWeekStart) / (7 * 24 * 60 * 60 * 1000));
  const firstOffset = Math.min(-8, selectedOffset - 4);
  const lastOffset = Math.max(12, selectedOffset + 4);

  scheduleWeekSelect.innerHTML = "";

  for (let weekOffset = firstOffset; weekOffset <= lastOffset; weekOffset += 1) {
    const weekStart = addDays(currentWeekStart, weekOffset * 7);
    const weekEnd = addDays(weekStart, 6);
    const option = document.createElement("option");
    const isCurrentWeek = isSameDate(weekStart, currentWeekStart);

    option.value = formatDateValue(weekStart);
    option.textContent = `${isCurrentWeek ? "Current week - " : ""}${formatWeekRange(weekStart, weekEnd)}`;
    scheduleWeekSelect.append(option);
  }

  scheduleWeekSelect.value = [...scheduleWeekSelect.options].some(option => option.value === selectedValue)
    ? selectedValue
    : formatDateValue(currentWeekStart);
}

function shiftSelectedWeek(direction) {
  selectedWeekStart = addDays(selectedWeekStart, direction * 7);
  mobileScheduleDayIndex = null;
  renderWeekOptions();
  renderWeeklySchedule();
  renderAttendanceBoard();
}

function getSelectedWeekDates() {
  return Array.from({ length: 7 }, (_, index) => addDays(selectedWeekStart, index));
}

function getCurrentWeekDates() {
  return Array.from({ length: 7 }, (_, index) => addDays(getWeekStart(new Date()), index));
}

function getWeekStart(date) {
  const weekStart = new Date(date);
  const dayIndex = weekStart.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  return weekStart;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeDateInput(value) {
  const cleanValue = String(value || "").trim();
  const match = cleanValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return "";

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return "";
  }

  return formatDateValue(date);
}

function formatShortDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function formatStoredDate(value) {
  if (!value) return "";

  const normalizedDate = normalizeDateInput(value);
  if (!normalizedDate) return value;

  return formatShortDate(parseDateValue(normalizedDate));
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekRange(weekStart, weekEnd) {
  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
}

function isSameDate(firstDate, secondDate) {
  return formatDateValue(firstDate) === formatDateValue(secondDate);
}

function getShiftKey(startTime) {
  const minutes = timeToMinutes(startTime);
  if (minutes >= 7 * 60 && minutes < 12 * 60 + 30) return "morning";
  if (minutes >= 12 * 60 + 30 && minutes < 15 * 60 + 30) return "midday";
  return "evening";
}

function timeToMinutes(timeText) {
  const [hourText = "0", minuteText = "0"] = timeText.split(":");
  return Number(hourText) * 60 + Number(minuteText);
}

function updateDashboard() {
  activeCount.textContent = countStatus("Active");
  activeClassCount.textContent = countActiveClasses();
  pauseCount.textContent = countStatus("Temporary pause");
  stoppedCount.textContent = countStatus("Stopped");
}

function handleAssistantMessage() {
  const message = assistantInput.value.trim();
  if (!message) return;

  appendAssistantMessage(message, "user");
  assistantInput.value = "";
  appendAssistantMessage(getAssistantReply(message), "reply");
}

function appendAssistantMessage(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `assistant-message assistant-${type}`;
  bubble.textContent = text;
  assistantMessages.append(bubble);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function getAssistantReply(message) {
  const normalizedMessage = normalizeSearchText(message);
  const addStudentMatch = message.match(/(?:thêm|add)\s+(?:học viên|student)?\s*(.+?)\s+(?:vào\s+)?lớp\s+(.+)/i);

  if (addStudentMatch) {
    if (!can("students.edit") && !can("all")) {
      return "Account này không có quyền thêm học viên. Bạn cần dùng Staff hoặc Admin.";
    }
    const name = addStudentMatch[1].trim().replace(/^tên\s+/i, "");
    const className = addStudentMatch[2].trim();
    openStudentModal();
    prefillStudentForm(name, className);
    return `Mình đã mở form Add Student và điền sẵn ${name} vào lớp ${className}. Bạn kiểm tra lại rồi bấm Save student nhé.`;
  }

  if (normalizedMessage.includes("attendance") || normalizedMessage.includes("diem danh")) {
    return buildAttendanceAuditReply(normalizedMessage);
  }

  const className = findClassNameInMessage(normalizedMessage);
  if (className) {
    const students = getStudentsByClassNameAnyStatus(className);
    const activeStudents = students.filter(student => student.status === "Active");
    const names = activeStudents.map(student => student.name).join(", ") || "chưa có học viên active";
    return `${className}: ${activeStudents.length} học viên active. ${names}.`;
  }

  if (normalizedMessage.includes("hoc phi") || normalizedMessage.includes("fee") || normalizedMessage.includes("due")) {
    const dueStudents = data.students
      .filter(student => student.status === "Active")
      .filter(student => getPaymentReminder(student).className !== "reminder-ok")
      .map(student => `${student.name} (${student.className}: ${getPaymentReminder(student).text})`);
    return dueStudents.length
      ? `Các bạn cần follow học phí: ${dueStudents.join("; ")}.`
      : "Hiện chưa có học viên active nào đang bị nhắc học phí.";
  }

  if (normalizedMessage.includes("pause") || normalizedMessage.includes("tam nghi")) {
    const paused = data.students.filter(student => student.status === "Temporary pause");
    return paused.length
      ? `Temporary pause: ${paused.map(student => `${student.name} (${student.className})`).join(", ")}.`
      : "Hiện không có học viên Temporary pause.";
  }

  if (normalizedMessage.includes("active")) {
    return `Hiện có ${countStatus("Active")} học viên active và ${countActiveClasses()} lớp đang hoạt động.`;
  }

  return "Mình có thể hỗ trợ nhanh: hỏi tên lớp, hỏi học phí/due, hỏi pause/active, hoặc gõ 'thêm học viên [tên] lớp [tên lớp]' để mở form nhập liệu.";
}

function buildAttendanceAuditReply(normalizedMessage) {
  const student = findStudentInMessage(normalizedMessage);

  if (!student) {
    return "Bạn gõ rõ hơn giúp mình tên học viên nhé. Ví dụ: attendance Kem.";
  }

  const currentCycleIndex = getCurrentCycleIndex(student);
  const currentCycleLessons = getStudentCycleLessons(student, currentCycleIndex);
  const records = getStudentAttendanceAuditRecords(student.name);
  const currentClassRecords = records.filter(record =>
    normalizeSearchText(record.className) === normalizeSearchText(student.className)
  );
  const otherClassRecords = records.filter(record =>
    normalizeSearchText(record.className) !== normalizeSearchText(student.className)
  );
  const currentCycleRecords = currentClassRecords.filter(record => record.cycleIndex === currentCycleIndex);
  const duplicateDates = getDuplicateValues(currentClassRecords.map(record => record.dateValue).filter(Boolean));
  const duplicateLessonSlots = getDuplicateValues(currentClassRecords.map(record => `${record.cycleIndex}-${record.lessonIndex}`));
  const issues = [];

  if (otherClassRecords.length) {
    const classes = [...new Set(otherClassRecords.map(record => record.className).filter(Boolean))].join(", ");
    issues.push(`${otherClassRecords.length} attendance records are still under another class: ${classes}.`);
  }

  if (currentCycleRecords.length !== getCompletedLessonsInCurrentCycle(student, currentCycleLessons)) {
    issues.push(`Current cycle count looks different: attendance dates ${currentCycleRecords.length}, lessonsDone in Student List ${getCompletedLessonsInCurrentCycle(student, currentCycleLessons)}.`);
  }

  if (duplicateDates.length) issues.push(`Duplicate dates: ${duplicateDates.map(formatStoredDate).join(", ")}.`);
  if (duplicateLessonSlots.length) issues.push("Some lesson boxes have more than one saved date.");

  const datesByCycle = groupAttendanceDatesByCycle(currentClassRecords);
  const cycleSummary = Object.entries(datesByCycle)
    .sort(([first], [second]) => Number(first) - Number(second))
    .map(([cycleIndex, dates]) => `${getCycleLetter(Number(cycleIndex))}: ${dates.length}/${getStudentCycleLessons(student, Number(cycleIndex))} (${dates.map(formatStoredDate).join(", ") || "no dates"})`)
    .join(" | ");

  return [
    `${student.name} - ${student.className}: ${formatPaymentType(student)}, status ${student.status}, Student List done ${student.lessonsDone}, paid ${getStudentPaidLessons(student)}.`,
    `Saved attendance in current class: ${currentClassRecords.length}. ${cycleSummary || "No attendance dates found."}`,
    issues.length ? `Needs checking: ${issues.join(" ")}` : "No obvious mismatch found."
  ].join(" ");
}

function findStudentInMessage(normalizedMessage) {
  return data.students.find(student => normalizedMessage.includes(normalizeSearchText(student.name)));
}

function getStudentAttendanceAuditRecords(studentName) {
  const normalizedStudentName = normalizeSearchText(studentName);

  return Object.keys(data.attendance || {})
    .map(key => {
      const parts = key.split("|");
      if (parts.length < 6 || normalizeSearchText(parts[4]) !== normalizedStudentName) return null;

      return {
        key,
        dateValue: parts[0] || "",
        className: parts[1] || "",
        startTime: parts[2] || "",
        endTime: parts[3] || "",
        studentName: parts[4] || "",
        cycleIndex: parts.length >= 7 ? Number(parts[5]) : 0,
        lessonIndex: Number(parts.length >= 7 ? parts[6] : parts[5])
      };
    })
    .filter(Boolean)
    .sort((first, second) => {
      const dateDiff = first.dateValue.localeCompare(second.dateValue);
      if (dateDiff) return dateDiff;
      return first.lessonIndex - second.lessonIndex;
    });
}

function groupAttendanceDatesByCycle(records) {
  return records.reduce((groups, record) => {
    const cycleIndex = Number(record.cycleIndex) || 0;
    if (!groups[cycleIndex]) groups[cycleIndex] = [];
    if (record.dateValue) groups[cycleIndex].push(record.dateValue);
    return groups;
  }, {});
}

function getDuplicateValues(values) {
  const counts = values.reduce((map, value) => {
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function prefillStudentForm(name, className) {
  document.querySelector("#newStudentName").value = name;
  const existingClass = getActiveClassNames().find(item => normalizeSearchText(item) === normalizeSearchText(className));

  if (existingClass) {
    newStudentClassSelect.value = existingClass;
  } else {
    newStudentClassSelect.value = "__new__";
    newStudentClassNew.value = className;
  }

  newStudentPayment.value = "Monthly";
  newStudentTotalLessons.value = 8;
  newStudentPaidLessons.value = 8;
  document.querySelector("#newStudentLessons").value = 0;
  document.querySelector("#newStudentStatus").value = "Active";
  updateNewClassField();
  updateDiscountField();
}

function findClassNameInMessage(normalizedMessage) {
  const classItem = data.classes.find(item => normalizedMessage.includes(normalizeSearchText(item.name)));
  return classItem ? classItem.name : "";
}

function getStudentsByClassNameAnyStatus(className) {
  return data.students.filter(student => normalizeSearchText(student.className) === normalizeSearchText(className));
}

function countStatus(status) {
  return data.students.filter(student => student.status === status).length;
}

function countActiveClasses() {
  return getActiveClassNames().length;
}

function getActiveClassNames() {
  const stoppedClasses = new Set(
    data.classes
      .filter(isStoppedClass)
      .map(classItem => classItem.name.trim())
  );
  const activeClasses = new Set(
    data.students
      .filter(student => student.status === "Active")
      .map(student => student.className.trim())
      .filter(className => className && !stoppedClasses.has(className))
  );

  return [...activeClasses];
}

function showToast(message = "Saved") {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function getSavedTheme() {
  return "light";
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = normalizedTheme;
  document.documentElement.style.colorScheme = normalizedTheme;
  localStorage.setItem(themePreferenceKey, normalizedTheme);

  if (themeToggle) {
    themeToggle.textContent = normalizedTheme === "dark" ? "Dark" : "Light";
    themeToggle.setAttribute("aria-label", `Current theme: ${themeToggle.textContent}. Switch color theme.`);
  }
}

function toggleTheme() {
  applyTheme("light");
  renderMobileNavigation();
}

function getSavedSidebarState() {
  return localStorage.getItem(sidebarCollapsedKey) === "true";
}

function applySidebarState(isCollapsed) {
  document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  localStorage.setItem(sidebarCollapsedKey, isCollapsed ? "true" : "false");

  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    sidebarToggle.setAttribute("aria-label", isCollapsed ? "Expand navigation" : "Collapse navigation");
  }
}

function toggleSidebar() {
  applySidebarState(!document.body.classList.contains("sidebar-collapsed"));
}

function toggleAccountMenu() {
  const willOpen = !document.body.classList.contains("account-menu-open");
  document.body.classList.toggle("account-menu-open", willOpen);
  currentUserPill?.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function closeAccountMenu() {
  document.body.classList.remove("account-menu-open");
  currentUserPill?.setAttribute("aria-expanded", "false");
}

function openStudentModal(index = null) {
  if (!can("students.edit") && !can("all")) {
    window.alert("Your account cannot edit students.");
    return;
  }

  editingStudentIndex = index;
  studentForm.reset();
  renderStudentModalClassChoices();
  document.querySelector("#studentModalEyebrow").textContent = index === null ? "New student" : "Edit student";
  document.querySelector("#studentModalTitle").textContent = index === null ? "Add Student" : "Edit Student";
  deleteStudentModal.classList.toggle("show", index !== null && can("all"));

  if (index === null) {
    document.querySelector("#newStudentLessons").value = 0;
    newStudentPayment.value = "Monthly";
    newStudentDiscount.value = 0;
    updateLessonDefaults(true);
    document.querySelector("#newStudentStatus").value = "Active";
  } else {
    fillStudentForm(data.students[index]);
  }

  updateNewClassField();
  updateDiscountField();
  studentModal.classList.add("open");
  studentModal.setAttribute("aria-hidden", "false");
  document.querySelector("#newStudentName").focus();
}

function closeStudentModal() {
  studentModal.classList.remove("open");
  studentModal.setAttribute("aria-hidden", "true");
  editingStudentIndex = null;
}

function openPaymentModal(index) {
  if (!can("payments.edit") && !can("all")) {
    window.alert("Your account cannot update payments.");
    return;
  }

  editingPaymentStudentIndex = index;
  const student = data.students[index];
  const currentCycleIndex = getCurrentCycleIndex(student);
  const totalLessons = getStudentCycleLessons(student, currentCycleIndex);
  const paymentType = normalizePaymentType(student.paymentType);

  paymentForm.reset();
  paymentDate.value = formatDateValue(new Date());
  paymentPackage.value = paymentType === "Course" || paymentType === "Course Dis (%)" ? "Course" : "Monthly";
  paymentLessons.value = paymentPackage.value === "Course" ? 24 : totalLessons || 8;
  paymentStudentSummary.innerHTML = `
    <strong>${escapeHtml(student.name)} - ${escapeHtml(student.className)}</strong>
    <span>Done: ${student.lessonsDone} | Paid: ${getStudentPaidLessons(student)} | Current cycle: ${getCycleLetter(currentCycleIndex)} (${totalLessons} lessons)</span>
  `;
  renderPaymentHistory(student);
  paymentModal.classList.add("open");
  paymentModal.setAttribute("aria-hidden", "false");
  paymentDate.focus();
}

function closePaymentModal() {
  paymentModal.classList.remove("open");
  paymentModal.setAttribute("aria-hidden", "true");
  editingPaymentStudentIndex = null;
}

function updatePaymentLessonDefault() {
  if (paymentPackage.value === "Monthly") paymentLessons.value = 8;
  if (paymentPackage.value === "Course") paymentLessons.value = 24;
}

function saveStudentPayment() {
  if (!can("payments.edit") && !can("all")) return;
  if (editingPaymentStudentIndex === null) return;

  const student = data.students[editingPaymentStudentIndex];
  const lessons = Math.max(1, Math.floor(Number(paymentLessons.value) || 0));
  const cycleIndex = getNextPaymentCycleIndex(student);
  const packageName = paymentPackage.value;
  const paymentRecord = {
    date: paymentDate.value || formatDateValue(new Date()),
    package: packageName,
    cycleIndex,
    lessons,
    note: paymentNote.value.trim(),
    createdAt: new Date().toISOString()
  };

  student.paymentHistory = normalizePaymentHistory(student.paymentHistory);
  student.paymentHistory.push(paymentRecord);
  student.paidLessons = getStudentPaidLessons(student) + lessons;
  student.lastPaymentDate = paymentRecord.date;
  student.paymentType = packageName === "Course" ? "Course" : packageName === "Monthly" ? "Monthly" : student.paymentType;
  student.totalLessons = lessons;
  student.nextDueDate = getNextDueDateFromPayment(paymentRecord.date, packageName);
  data.students[editingPaymentStudentIndex] = student;

  normalizeData();
  saveData(true);
  closePaymentModal();
  render();
  showTab("studentsTab");
}

function renderPaymentHistory(student) {
  const history = normalizePaymentHistory(student.paymentHistory);
  paymentHistoryList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "muted-cell";
    empty.textContent = "No payment history yet. Existing paid lessons are kept as legacy balance.";
    paymentHistoryList.append(empty);
    return;
  }

  const latestCycleIndex = Math.max(...history.map(record => Number(record.cycleIndex) || 0));

  [...history].reverse().forEach(record => {
    const row = document.createElement("div");
    const details = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");

    row.className = "payment-history-row";
    details.className = "payment-history-details";
    title.textContent = `${getCycleLetter(record.cycleIndex)} | ${formatStoredDate(record.date)}`;
    meta.textContent = `${record.package} - ${record.lessons} lessons${record.note ? ` | ${record.note}` : ""}`;
    details.append(title, meta);
    row.append(details);

    if ((can("payments.edit") || can("all")) && Number(record.cycleIndex) === latestCycleIndex) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "payment-history-delete";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteLatestPaymentCycle(record.cycleIndex));
      row.append(deleteButton);
    }

    paymentHistoryList.append(row);
  });
}

function deleteLatestPaymentCycle(cycleIndex) {
  if (!can("payments.edit") && !can("all")) return;
  if (editingPaymentStudentIndex === null) return;

  const student = data.students[editingPaymentStudentIndex];
  const history = normalizePaymentHistory(student.paymentHistory);
  const latestCycleIndex = history.length ? Math.max(...history.map(record => Number(record.cycleIndex) || 0)) : -1;

  if (Number(cycleIndex) !== latestCycleIndex) {
    window.alert("Only the latest payment cycle can be deleted safely.");
    return;
  }

  const record = history.find(item => Number(item.cycleIndex) === Number(cycleIndex));
  if (!record) return;

  const attendanceCount = getAttendanceCycleDateCount(student, cycleIndex);
  const warning = attendanceCount
    ? `Delete cycle ${getCycleLetter(cycleIndex)}?\n\nThis cycle has ${attendanceCount} attendance date(s). Deleting it will also remove those dates and the cycle note.`
    : `Delete cycle ${getCycleLetter(cycleIndex)}?\n\nThis will remove the latest payment record and reduce paid lessons.`;

  if (!window.confirm(warning)) return;

  student.paymentHistory = history.filter(item => Number(item.cycleIndex) !== Number(cycleIndex));
  student.paidLessons = Math.max(0, getStudentPaidLessons(student) - record.lessons);
  student.lessonsDone = Math.max(0, Number(student.lessonsDone) || 0) - attendanceCount;
  removeAttendanceCycle(student, cycleIndex);
  removeAttendanceCycleNote(student, cycleIndex);
  refreshStudentPaymentFromHistory(student);
  data.students[editingPaymentStudentIndex] = student;

  normalizeData();
  saveData(true);
  renderPaymentHistory(data.students[editingPaymentStudentIndex]);
  renderStudents();
  renderAttendanceBoard();
  renderFinance();
}

function getNextPaymentCycleIndex(student) {
  const history = normalizePaymentHistory(student.paymentHistory);
  if (history.length) return Math.max(...history.map(record => record.cycleIndex)) + 1;
  return Math.floor(getStudentPaidLessons(student) / getStudentCycleLessons(student));
}

function refreshStudentPaymentFromHistory(student) {
  const history = normalizePaymentHistory(student.paymentHistory);
  const latestRecord = history
    .slice()
    .sort((first, second) => Number(first.cycleIndex) - Number(second.cycleIndex))
    .at(-1);

  if (!latestRecord) {
    student.lastPaymentDate = "";
    student.nextDueDate = "";
    return;
  }

  student.lastPaymentDate = latestRecord.date;
  student.totalLessons = latestRecord.lessons;
  if (latestRecord.package === "Course") student.paymentType = "Course";
  if (latestRecord.package === "Monthly") student.paymentType = "Monthly";
  student.nextDueDate = getNextDueDateFromPayment(latestRecord.date, latestRecord.package);
}

function getNextDueDateFromPayment(dateValue, paymentType) {
  if (!dateValue) return "";
  const normalizedPaymentType = normalizePaymentType(paymentType);
  if (normalizedPaymentType === "Monthly" || normalizedPaymentType === "Monthly Dis (%)") {
    return formatDateValue(addDays(parseDateValue(dateValue), 30));
  }
  return "";
}

function addStudentFromForm() {
  if (!can("students.edit") && !can("all")) return;

  const formData = new FormData(studentForm);
  const selectedClass = newStudentClassSelect.value;
  const className = selectedClass === "__new__" ? newStudentClassNew.value.trim() : selectedClass;

  if (!className) {
    newStudentClassNew.focus();
    return;
  }

  const student = {
    name: repairVietnameseText((formData.get("name") || "").trim()),
    className: repairVietnameseText(className),
    contact: repairVietnameseText((formData.get("contact") || "").trim()),
    paymentType: normalizePaymentType(formData.get("paymentType") || "Monthly"),
    discountPercent: isDiscountPaymentType(formData.get("paymentType")) ? normalizeDiscountPercent(formData.get("discountPercent")) : 0,
    lessonsDone: Math.max(0, Number(formData.get("lessonsDone")) || 0),
    totalLessons: normalizeTotalLessons(formData.get("totalLessons"), formData.get("paymentType")),
    paidLessons: normalizePaidLessons(formData.get("paidLessons"), formData.get("totalLessons"), formData.get("paymentType")),
    lastPaymentDate: formData.get("lastPaymentDate") || "",
    nextDueDate: formData.get("nextDueDate") || "",
    status: normalizeStatus(formData.get("status") || "Active"),
    paymentHistory: editingStudentIndex === null ? [] : data.students[editingStudentIndex].paymentHistory || []
  };

  if (editingStudentIndex === null) {
    data.students.push(student);
  } else {
    migrateStudentLinkedRecords(data.students[editingStudentIndex], student);
    data.students[editingStudentIndex] = student;
  }

  normalizeData();
  syncClassStudents();
  saveData(true);
  render();
  closeStudentModal();
  showTab("studentsTab");
}

function deleteEditingStudent() {
  if (!can("all")) {
    window.alert("Only Admin can delete students.");
    return;
  }

  if (editingStudentIndex === null) return;

  const student = data.students[editingStudentIndex];
  const confirmed = window.confirm(`Delete ${student.name}? This cannot be undone.`);
  if (!confirmed) return;

  data.students.splice(editingStudentIndex, 1);
  normalizeData();
  syncClassStudents();
  saveData(true);
  render();
  closeStudentModal();
  showTab("studentsTab");
}

function fillStudentForm(student) {
  document.querySelector("#newStudentName").value = student.name;
  document.querySelector("#newStudentContact").value = student.contact;
  newStudentPayment.value = student.paymentType;
  newStudentDiscount.value = student.discountPercent || 0;
  document.querySelector("#newStudentLessons").value = student.lessonsDone;
  newStudentTotalLessons.value = getStudentCycleLessons(student);
  newStudentPaidLessons.value = getStudentPaidLessons(student);
  document.querySelector("#newStudentLastPayment").value = student.lastPaymentDate;
  document.querySelector("#newStudentNextDue").value = student.nextDueDate;
  document.querySelector("#newStudentStatus").value = student.status;

  const hasClassOption = [...newStudentClassSelect.options].some(option => option.value === student.className);
  if (hasClassOption) {
    newStudentClassSelect.value = student.className;
    newStudentClassNew.value = "";
  } else {
    newStudentClassSelect.value = "__new__";
    newStudentClassNew.value = student.className;
  }
}

function renderStudentModalClassChoices() {
  const classNames = getActiveClassNames();

  newStudentClassSelect.innerHTML = "";

  classNames.forEach(className => {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = className;
    newStudentClassSelect.append(option);
  });

  const newClassOption = document.createElement("option");
  newClassOption.value = "__new__";
  newClassOption.textContent = "New class";
  newStudentClassSelect.append(newClassOption);

  if (!classNames.length) {
    newStudentClassSelect.value = "__new__";
  }
}

function updateNewClassField() {
  const isNewClass = newStudentClassSelect.value === "__new__";
  newClassField.classList.toggle("show", isNewClass);
  newStudentClassNew.required = isNewClass;
  if (!isNewClass) newStudentClassNew.value = "";
}

function updateDiscountField() {
  const hasDiscount = isDiscountPaymentType(newStudentPayment.value);
  discountField.classList.toggle("show", hasDiscount);
  newStudentDiscount.required = hasDiscount;
  if (!hasDiscount) newStudentDiscount.value = 0;
}

function updateLessonDefaults(force) {
  const defaultLessons = getPaymentCycleLessons(newStudentPayment.value);
  if (force || !Number(newStudentTotalLessons.value)) {
    newStudentTotalLessons.value = defaultLessons;
  }
  if (force || !Number(newStudentPaidLessons.value)) {
    newStudentPaidLessons.value = defaultLessons;
  }
}

function importStudentsFromCsv(csvText) {
  const rows = parseCsv(csvText).filter(row => row.some(cell => cell.trim()));

  if (rows.length < 2) {
    window.alert("CSV file has no student rows.");
    return;
  }

  const headers = rows[0].map(normalizeHeader);
  const importedStudents = rows.slice(1).map(row => studentFromCsvRow(headers, row)).filter(student => student.name);

  if (!importedStudents.length) {
    window.alert("No valid students found. Please check the Student Name column.");
    return;
  }

  const shouldReplace = window.confirm(`Import ${importedStudents.length} students from CSV? Press OK to replace the current Student List, or Cancel to add them below the current list.`);
  if (shouldReplace) {
    data.students = importedStudents;
  } else {
    data.students.push(...importedStudents);
  }

  normalizeData();
  syncClassStudents();
  saveData(true);
  render();
  showTab("studentsTab");
}

function studentFromCsvRow(headers, row) {
  const get = (...names) => {
    const index = headers.findIndex(header => names.includes(header));
    return index >= 0 ? (row[index] || "").trim() : "";
  };

  return {
    name: get("student name", "name", "student"),
    className: get("class", "class name"),
    contact: get("contact", "phone", "email"),
    paymentType: normalizePaymentType(get("payment type", "payment") || "Monthly"),
    lessonsDone: Number(get("lessons done", "lessons", "lesson done")) || 0,
    totalLessons: Number(get("total lessons", "total lesson", "cycle lessons")) || 0,
    paidLessons: Number(get("paid lessons", "paid lesson", "paid")) || 0,
    lastPaymentDate: get("last payment date", "last payment"),
    nextDueDate: get("next due date", "next due"),
    status: normalizeStatus(get("status") || "Active")
  };
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function normalizeStatus(status) {
  const cleanStatus = status.trim().toLowerCase();
  if (cleanStatus === "temporary pause" || cleanStatus === "pause" || cleanStatus === "paused") return "Temporary pause";
  if (cleanStatus === "stopped" || cleanStatus === "stop") return "Stopped";
  return "Active";
}

function normalizeSchedule(schedule) {
  return schedule
    .replace(/\b([A-Za-z]+)\/([A-Za-z]+)\s+(\d{1,2}:\d{2})\b/g, (match, firstDay, secondDay, time) => {
      const endTime = addOneHour(time);
      return `${firstDay}, ${time}-${endTime} | ${secondDay}, ${time}-${endTime}`;
    })
    .split("|")
    .map(slot => slot.trim())
    .filter(Boolean)
    .map(slot => {
      const [dayPart, timePart] = slot.split(",").map(part => part.trim());
      const [startTime, endTime] = normalizeTimeRange(timePart || "18:00");
      return `${dayPart || "Mon"}, ${startTime}-${endTime}`;
    })
    .join(" | ");
}

function decodeCsvFile(buffer) {
  const bytes = new Uint8Array(buffer);

  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder("utf-16le").decode(bytes);
  }

  if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  const utf8Text = new TextDecoder("utf-8").decode(bytes);
  if (!utf8Text.includes("\uFFFD")) return utf8Text;

  try {
    return new TextDecoder("windows-1258").decode(bytes);
  } catch {
    return utf8Text;
  }
}

function repairVietnameseText(text) {
  if (!looksLikeMojibake(text)) return text;

  const bytes = [];

  for (const char of text) {
    const byte = windows1252Byte(char);
    if (byte === null) return text;
    bytes.push(byte);
  }

  try {
    const repaired = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    return repaired.includes("\uFFFD") ? text : repaired;
  } catch {
    return text;
  }
}

function looksLikeMojibake(text) {
  return /(Ãƒ|Ã‚|Ã„|Ã†|Ã¡Âº|Ã¡Â»|Ã¢â‚¬|Ã¢â‚¬â„¢|Ã¢â‚¬Å“|Ã¢â‚¬Â)/.test(text);
}

function windows1252Byte(char) {
  const code = char.codePointAt(0);
  if (code <= 0xFF) return code;

  const windows1252Map = {
    0x20AC: 0x80,
    0x201A: 0x82,
    0x0192: 0x83,
    0x201E: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02C6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8A,
    0x2039: 0x8B,
    0x0152: 0x8C,
    0x017D: 0x8E,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201C: 0x93,
    0x201D: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02DC: 0x98,
    0x2122: 0x99,
    0x0161: 0x9A,
    0x203A: 0x9B,
    0x0153: 0x9C,
    0x017E: 0x9E,
    0x0178: 0x9F
  };

  return windows1252Map[code] ?? null;
}

function showTab(tabId) {
  if (tabId === "mobileHomeTab") {
    document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === "mobileHomeTab");
    });
    renderMobileHomePanel();
    updateMobileNavigationState(tabId);
    closeMobileMore();
    return;
  }

  if (!canOpenTab(tabId)) {
    if (!currentUser) {
      applyRoleUi();
      return;
    }
    tabId = getInitialTabForRole();
  }

  document.querySelectorAll(".tab-button").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  updateMobileNavigationState(tabId);
  closeMobileMore();
}

function getMobilePrimaryTabs() {
  if (!currentUser) return [];

  if (currentUser.role === "teacher") {
    return ["mobileHomeTab", "scheduleTab", "attendanceTab"];
  }

  if (currentUser.role === "staff") {
    return ["mobileHomeTab", "scheduleTab", "studentsTab"];
  }

  return ["mobileHomeTab", "scheduleTab", "studentsTab"];
}

function getMobileTabLabel(tabId) {
  const labels = {
    scheduleTab: "Today",
    mobileHomeTab: "Home",
    dashboardTab: "Dashboard",
    financeTab: "Finance",
    studentsTab: "Students",
    classesTab: "Classes",
    attendanceTab: "Attendance",
    lessonLogTab: "Logs",
    studentProgressTab: "Progress",
    tuitionSlipTab: "Tuition"
  };
  return labels[tabId] || tabId.replace("Tab", "");
}

function renderMobileNavigation() {
  if (!mobileNav || !mobileMoreSheet) return;

  if (!currentUser) {
    mobileNav.innerHTML = "";
    mobileMoreSheet.innerHTML = "";
    closeMobileMore();
    return;
  }

  const primaryTabs = getMobilePrimaryTabs();
  const allTabs = [...document.querySelectorAll(".tab-button")]
    .map(button => button.dataset.tab)
    .filter(tabId => canOpenTab(tabId));
  const moreTabs = allTabs.filter(tabId => !primaryTabs.includes(tabId));
  const activeTab = document.querySelector(".tab-panel.active")?.id || "mobileHomeTab";

  mobileNav.innerHTML = "";

  primaryTabs.forEach(tabId => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = tabId === activeTab ? "mobile-nav-item active" : "mobile-nav-item";
    button.dataset.tab = tabId;
    button.textContent = getMobileTabLabel(tabId);
    button.addEventListener("click", () => showTab(tabId));
    mobileNav.append(button);
  });

  const moreButton = document.createElement("button");
  moreButton.type = "button";
  moreButton.className = moreTabs.includes(activeTab) ? "mobile-nav-item active" : "mobile-nav-item";
  moreButton.textContent = "More";
  moreButton.addEventListener("click", event => {
    event.stopPropagation();
    toggleMobileMore();
  });
  mobileNav.append(moreButton);

  renderMobileMoreSheet(moreTabs);
  renderMobileHomePanel();
  updateMobileNavigationState(activeTab);
}

function renderMobileMoreSheet(moreTabs) {
  const accountActions = [
    { label: "Load from Drive", action: loadDataFromDrive, visible: can("drive.load") || can("all") },
    { label: "Save to Drive", action: saveDataToDrive, visible: can("drive.save") || can("all") },
    { label: "Save changes", action: () => saveData(), visible: can("all") },
    { label: "Reset password", action: () => openPasswordResetModal(false), visible: Boolean(currentUser) },
    { label: "Sign out", action: signOutUser, visible: Boolean(currentUser) }
  ].filter(item => item.visible);

  mobileMoreSheet.innerHTML = `
    <div class="mobile-more-panel" role="dialog" aria-label="More navigation">
      <div class="mobile-more-header">
        <strong>More</strong>
        <button class="icon-button" type="button" aria-label="Close">x</button>
      </div>
      <div class="mobile-more-section" data-section="tabs"></div>
      <div class="mobile-more-section" data-section="actions"></div>
    </div>
  `;

  mobileMoreSheet.querySelector(".icon-button").addEventListener("click", closeMobileMore);
  const tabSection = mobileMoreSheet.querySelector('[data-section="tabs"]');
  const actionSection = mobileMoreSheet.querySelector('[data-section="actions"]');

  moreTabs.forEach(tabId => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-more-item";
    button.dataset.tab = tabId;
    button.textContent = getMobileTabLabel(tabId);
    button.addEventListener("click", () => showTab(tabId));
    tabSection.append(button);
  });

  accountActions.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-more-item";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      closeMobileMore();
      item.action();
    });
    actionSection.append(button);
  });
}

function renderMobileHomePanel() {
  if (!mobileHomePanel || !currentUser) return;

  const todayDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const todayClasses = getClassesForDay(todayDay);
  const completedToday = todayClasses.filter(item => {
    const sessionKey = getSessionKey({
      date: new Date(),
      className: item.className,
      startTime: item.startTime,
      endTime: item.endTime
    });
    return data.completedSessions[sessionKey];
  }).length;
  const paymentFollowUps = data.students.filter(student => {
    if (student.status !== "Active") return false;
    return matchesTuitionAlertFilter(student, "priority");
  }).length;
  const activeClasses = data.classes.filter(classItem => !isStoppedClass(classItem, selectedWeekStart)).length;
  const activeStudents = data.students.filter(student => student.status === "Active").length;

  const cards = [
    {
      title: "Today Schedule",
      body: `${todayClasses.length} classes · ${Math.max(todayClasses.length - completedToday, 0)} not done`,
      action: "Open",
      tab: "scheduleTab",
      visible: canOpenTab("scheduleTab")
    },
    {
      title: "Student Care",
      body: `${paymentFollowUps} payment follow-ups · ${activeStudents} active`,
      action: "Follow up",
      tab: "studentsTab",
      visible: canOpenTab("studentsTab")
    },
    {
      title: "Attendance",
      body: "Cycles, notes, exports",
      action: "Check",
      tab: "attendanceTab",
      visible: canOpenTab("attendanceTab")
    },
    {
      title: "Class Setup",
      body: `${activeClasses} active classes · schedules`,
      action: "Manage",
      tab: "classesTab",
      visible: canOpenTab("classesTab")
    },
    {
      title: "Finance",
      body: "Revenue and net profit",
      action: "Admin",
      tab: "financeTab",
      visible: canOpenTab("financeTab")
    },
    {
      title: "Lesson Logs",
      body: "Teacher notes and homework",
      action: "Review",
      tab: "lessonLogTab",
      visible: canOpenTab("lessonLogTab")
    },
    {
      title: "Office & Data",
      body: "Load from Drive · Tuition Slip · Account",
      action: "Open tools",
      tab: "tuitionSlipTab",
      visible: true,
      wide: true
    }
  ].filter(card => card.visible);

  mobileHomePanel.innerHTML = `
    <div class="mobile-home-header">
      <div>
        <h2>Mandy English</h2>
        <p>Good ${getDayPeriod()}, ${escapeHtml(currentUser.username)}</p>
      </div>
      <button class="mobile-home-avatar" type="button" aria-label="Open account tools">M</button>
    </div>
    <div class="mobile-home-hero">
      <span>Today · ${escapeHtml(roleLabels[currentUser.role] || currentUser.role)} view</span>
      <strong>What do you want to manage?</strong>
    </div>
    <div class="mobile-home-grid"></div>
  `;

  const grid = mobileHomePanel.querySelector(".mobile-home-grid");
  cards.forEach(card => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = card.wide ? "mobile-home-card wide" : "mobile-home-card";
    button.innerHTML = `
      <strong>${escapeHtml(card.title)}</strong>
      <span>${escapeHtml(card.body)}</span>
      <em>${escapeHtml(card.action)}</em>
    `;
    button.addEventListener("click", () => {
      if (card.title === "Office & Data" && !canOpenTab(card.tab)) {
        toggleMobileMore();
        return;
      }
      showTab(card.tab);
    });
    grid.append(button);
  });

  mobileHomePanel.querySelector(".mobile-home-avatar")?.addEventListener("click", toggleMobileMore);
}

function getDayPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function updateMobileNavigationState(activeTab) {
  if (!mobileNav) return;
  mobileNav.querySelectorAll(".mobile-nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });
  mobileMoreSheet?.querySelectorAll(".mobile-more-item[data-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });
}

function toggleMobileMore() {
  const willOpen = !document.body.classList.contains("mobile-more-open");
  document.body.classList.toggle("mobile-more-open", willOpen);
  mobileMoreSheet.setAttribute("aria-hidden", willOpen ? "false" : "true");
}

function closeMobileMore() {
  document.body.classList.remove("mobile-more-open");
  mobileMoreSheet?.setAttribute("aria-hidden", "true");
}

function normalizePaymentType(paymentType) {
  const cleanPaymentType = String(paymentType || "").trim().toLowerCase();
  if (cleanPaymentType === "per course") return "Course";
  if (cleanPaymentType === "per lesson") return "Monthly";
  if (cleanPaymentType === "monthly dis (%)" || cleanPaymentType === "monthly dis" || cleanPaymentType === "monthly discount") return "Monthly Dis (%)";
  if (cleanPaymentType === "course dis (%)" || cleanPaymentType === "course dis" || cleanPaymentType === "course discount") return "Course Dis (%)";
  if (cleanPaymentType === "free") return "Free";
  if (cleanPaymentType === "course") return "Course";
  return "Monthly";
}

function isDiscountPaymentType(paymentType) {
  const normalizedPaymentType = normalizePaymentType(paymentType);
  return normalizedPaymentType === "Monthly Dis (%)" || normalizedPaymentType === "Course Dis (%)";
}

function normalizeDiscountPercent(value) {
  const percent = Number(value);
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

function formatPaymentType(student) {
  if (!isDiscountPaymentType(student.paymentType)) return student.paymentType;
  return `${student.paymentType} - ${normalizeDiscountPercent(student.discountPercent)}%`;
}

function getPaymentCycleLessons(paymentType) {
  const normalizedPaymentType = normalizePaymentType(paymentType);
  if (normalizedPaymentType === "Free") return 1;
  return normalizedPaymentType === "Course" || normalizedPaymentType === "Course Dis (%)" ? 24 : 8;
}

function normalizeTotalLessons(value, paymentType) {
  const totalLessons = Math.floor(Number(value));
  if (Number.isFinite(totalLessons) && totalLessons > 0) return totalLessons;
  return getPaymentCycleLessons(paymentType);
}

function normalizePaidLessons(value, totalLessons, paymentType) {
  if (value === "" || value === null || value === undefined) {
    return normalizeTotalLessons(totalLessons, paymentType);
  }

  const paidLessons = Math.floor(Number(value));
  if (Number.isFinite(paidLessons) && paidLessons >= 0) return paidLessons;
  return normalizeTotalLessons(totalLessons, paymentType);
}

function getStudentCycleLessons(student, cycleIndex = null) {
  if (cycleIndex !== null && cycleIndex !== undefined) {
    const record = getPaymentRecordForCycle(student, cycleIndex);
    if (record?.lessons) return normalizePaymentRecordLessons(record.lessons, record.package);
  }

  return normalizeTotalLessons(student.totalLessons, student.paymentType);
}

function getStudentPaidLessons(student) {
  return normalizePaidLessons(student.paidLessons, student.totalLessons, student.paymentType);
}

function getPaymentReminder(student) {
  const totalLessons = getStudentPaidLessons(student);
  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);
  const nextLesson = lessonsDone + 1;
  const penultimateLesson = totalLessons - 1;

  if (lessonsDone >= totalLessons) {
    return { text: "Payment due now", className: "reminder-due" };
  }

  if (nextLesson >= penultimateLesson) {
    return { text: `Remind before lesson ${penultimateLesson}/${totalLessons}`, className: "reminder-soon" };
  }

  return { text: `${totalLessons - lessonsDone} lessons left`, className: "reminder-ok" };
}

function syncClassStudents() {
  const previousSchedules = new Map(data.classes.map(classItem => [classItem.name.trim(), classItem.schedule || ""]));
  const previousStatuses = new Map(data.classes.map(classItem => [classItem.name.trim(), classItem.status || "Active"]));
  const previousStatusHistories = new Map(data.classes.map(classItem => [classItem.name.trim(), normalizeClassStatusHistory(classItem.statusHistory)]));
  const visibleStudentClassNames = data.students
    .filter(student => student.status !== "Stopped")
    .map(student => student.className.trim())
    .filter(Boolean);
  const stoppedClassNames = data.classes
    .filter(classItem => getLatestClassStatus(normalizeClassStatusHistory(classItem.statusHistory)) === "Stopped" || classItem.status === "Stopped")
    .map(classItem => classItem.name.trim())
    .filter(Boolean);
  const classNames = [...new Set([...visibleStudentClassNames, ...stoppedClassNames])];

  data.classes = classNames.map(className => {
    const studentNames = data.students
      .filter(student => student.className.trim() === className && student.status !== "Stopped")
      .map(student => student.name.trim())
      .filter(Boolean);

    return {
      name: className,
      students: studentNames.join(", "),
      schedule: normalizeSchedule(previousSchedules.get(className) || ""),
      status: previousStatuses.get(className) === "Stopped" ? "Stopped" : "Active",
      statusHistory: previousStatusHistories.get(className) || []
    };
  });
}

function ensureClassExists(className) {
  const cleanName = className.trim();
  if (!cleanName) return;

  const exists = data.classes.some(classItem => classItem.name.trim() === cleanName);
  if (exists) return;

  data.classes.push({
    name: cleanName,
    students: "",
    schedule: "",
    status: "Active",
    statusHistory: []
  });
}

function renderClassOptions() {
  classOptions.innerHTML = "";

  data.classes.forEach(classItem => {
    const option = document.createElement("option");
    option.value = classItem.name;
    classOptions.append(option);
  });
}

function renderFilterClassOptions() {
  const currentValue = filterClass.value;
  filterClass.innerHTML = '<option value="">All classes</option>';

  getSortedClassEntries(data.classes.map((classItem, index) => ({ classItem, index }))).forEach(({ classItem }) => {
    const option = document.createElement("option");
    option.value = classItem.name;
    option.textContent = classItem.name;
    filterClass.append(option);
  });

  filterClass.value = [...filterClass.options].some(option => option.value === currentValue) ? currentValue : "";
}

function renderClassListFilterOptions() {
  renderClassSelectOptions(classListFilter, classListFilter.value);
}

function renderAttendanceClassFilterOptions() {
  renderClassSelectOptions(attendanceClassFilter, attendanceClassFilter.value);
}

function renderLessonLogClassFilterOptions() {
  renderClassSelectOptions(lessonLogClassFilter, lessonLogClassFilter.value);
}

function renderProgressStudentOptions() {
  const currentValue = progressStudentSelect.value;
  progressStudentSelect.innerHTML = "";

  const optionPlaceholder = document.createElement("option");
  optionPlaceholder.value = "";
  optionPlaceholder.textContent = "Choose a student";
  progressStudentSelect.append(optionPlaceholder);

  data.students
    .map((student, index) => ({ student, index }))
    .sort(compareStudentEntries)
    .forEach(({ student, index }) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${student.name} - ${student.className}`;
      progressStudentSelect.append(option);
    });

  if ([...progressStudentSelect.options].some(option => option.value === currentValue)) {
    progressStudentSelect.value = currentValue;
  } else {
    const firstActiveOption = [...progressStudentSelect.options].find(option => {
      const student = data.students[Number(option.value)];
      return student && student.status === "Active";
    });
    progressStudentSelect.value = firstActiveOption ? firstActiveOption.value : "";
  }
}

function renderTuitionStudentOptions() {
  const currentValue = tuitionStudentSelect.value;
  tuitionStudentSelect.innerHTML = "";

  data.students
    .map((student, index) => ({ student, index }))
    .sort(compareStudentEntries)
    .forEach(({ student, index }) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${student.name} - ${student.className}`;
      tuitionStudentSelect.append(option);
    });

  if ([...tuitionStudentSelect.options].some(option => option.value === currentValue)) {
    tuitionStudentSelect.value = currentValue;
  } else {
    tuitionStudentSelect.value = tuitionStudentSelect.options[0]?.value || "";
  }

}

function renderTuitionSlip(resetEditableFields = false) {
  const student = data.students[Number(tuitionStudentSelect.value)];

  if (student && resetEditableFields) {
    tuitionStudentName.value = student.name;
    tuitionCourseName.value = student.className || "English Communication";
    tuitionPackage.value = `${getTuitionPackageLessons(student)} Sessions`;
    tuitionStartDate.value = formatLongDateText(student.lastPaymentDate);
    tuitionDueDate.value = formatLongDateText(student.nextDueDate);
    tuitionComment.value = getDefaultTuitionComment();
    applyTuitionAutoFields(student, { updateEndDate: true, updateFees: true });
  }

  slipStudentName.textContent = tuitionStudentName.value || student?.name || "-";
  slipCourseName.textContent = tuitionCourseName.value || student?.className || "-";
  slipPackage.textContent = tuitionPackage.value || "-";
  slipStartDate.textContent = tuitionStartDate.value || "-";
  slipEndDate.textContent = tuitionEndDate.value || "-";
  slipCourseFee.textContent = formatFeeDisplay(tuitionCourseFee.value);
  slipDiscount.textContent = formatFeeDisplay(tuitionDiscount.value || "0 VND");
  slipTotalFee.textContent = formatFeeDisplay(tuitionTotalFee.value);
  slipDueDate.textContent = tuitionDueDate.value || "-";
  slipComment.textContent = tuitionComment.value || "-";
  renderSlipQr();
}

function getTuitionPackageLessons(student) {
  if (!student) return 0;
  return getStudentCycleLessons(student);
}

function applyTuitionAutoFields(student, { updateEndDate = false, updateFees = false } = {}) {
  if (!student) return;

  if (updateEndDate) {
    tuitionEndDate.value = getGeneratedTuitionEndDate(student);
  }

  if (updateFees) {
    const courseFee = getGeneratedTuitionCourseFee(student);
    const discountAmount = getGeneratedTuitionDiscountAmount(student, courseFee);
    tuitionCourseFee.value = formatCurrency(courseFee);
    tuitionDiscount.value = formatCurrency(discountAmount);
    tuitionTotalFee.value = formatCurrency(Math.max(0, courseFee - discountAmount));
  }
}

function applyTuitionTotalFromFee() {
  const courseFee = parseMoneyValue(tuitionCourseFee.value);
  const discountAmount = parseMoneyValue(tuitionDiscount.value);
  tuitionTotalFee.value = formatCurrency(Math.max(0, courseFee - discountAmount));
}

function getGeneratedTuitionCourseFee(student) {
  if (!student) return 0;
  const lessons = getTuitionPackageLessonsFromInput(student);
  const feePerLesson = getClassFeePerLesson(tuitionCourseName.value || student.className);
  return lessons * feePerLesson;
}

function getGeneratedTuitionDiscountAmount(student, courseFee) {
  if (!student || !isDiscountPaymentType(student.paymentType)) return 0;
  const discountPercent = normalizeDiscountPercent(student.discountPercent);
  return Math.round((courseFee * discountPercent) / 100);
}

function getTuitionPackageLessonsFromInput(student) {
  const lessonsMatch = String(tuitionPackage.value || "").match(/\d+/);
  const lessons = lessonsMatch ? Number(lessonsMatch[0]) : 0;
  return Number.isFinite(lessons) && lessons > 0 ? lessons : getTuitionPackageLessons(student);
}

function getGeneratedTuitionEndDate(student) {
  if (!student) return "";
  const startDateValue = normalizeTuitionDateInput(tuitionStartDate.value || student.lastPaymentDate);
  const className = String(tuitionCourseName.value || student.className || "").trim();
  const lessons = getTuitionPackageLessonsFromInput(student);

  if (!startDateValue || !className || lessons <= 0) return "";

  let countedLessons = 0;
  let cursor = parseDateValue(startDateValue);

  for (let dayCount = 0; dayCount < 730; dayCount += 1) {
    const day = getDayCodeFromDate(cursor);
    const weekStart = getWeekStart(cursor);
    const classSlots = getClassesForDayForWeek(day, weekStart).filter(slot => slot.className === className);

    classSlots.forEach(classSlot => {
      if (countedLessons >= lessons) return;
      const teacher =
        data.teachers[getTeacherKey(day, classSlot, cursor)] ||
        getLegacyTeacherForWeek(getLegacyTeacherKey(day, classSlot), weekStart);
      if (!isOffTeacher(teacher)) countedLessons += 1;
    });

    if (countedLessons >= lessons) return formatLongDateText(formatDateValue(cursor));
    cursor = addDays(cursor, 1);
  }

  return "";
}

function normalizeTuitionDateInput(value) {
  const cleanValue = String(value || "").trim();
  const normalizedDate = normalizeDateInput(cleanValue);
  if (normalizedDate) return normalizedDate;

  const parsedTime = Date.parse(cleanValue);
  if (!Number.isFinite(parsedTime)) return "";

  const date = new Date(parsedTime);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateValue(date);
}

function getDefaultTuitionComment() {
  return "The course end date is based on the agreed class schedule and the number of sessions in the package.";
}

function getParentReportDraftForStudent(student) {
  if (!student) return "";
  const entries = getStudentProgressEntries(student, true);
  const summary = buildStudentPatternSummary(entries);
  return buildParentDraft(student, summary, entries);
}

function formatFeeDisplay(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "0 VND";
  const numericValue = Number(cleanValue.replace(/[^\d]/g, ""));
  if (Number.isFinite(numericValue) && numericValue > 0 && /^\D*\d[\d\s,.]*\D*$/.test(cleanValue)) {
    return `${numericValue.toLocaleString("en-US")} VND`;
  }
  return cleanValue;
}

function formatLongDateText(value) {
  const normalizedDate = normalizeTuitionDateInput(value);
  if (!normalizedDate) return "";

  const date = parseDateValue(normalizedDate);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function renderSlipQr() {
  slipQrPreview.innerHTML = "";
  const image = document.createElement("img");
  image.src = "assets/payment-qr.png";
  image.alt = "Payment QR";
  slipQrPreview.classList.remove("empty");
  slipQrPreview.append(image);
}

function printTuitionSlipPreview() {
  applyTuitionSlipPrintPage();
  document.body.classList.add("printing-tuition-slip");
  showTab("tuitionSlipTab");
  window.setTimeout(() => {
    window.print();
    window.setTimeout(cleanupTuitionSlipPrintPage, 500);
  }, 50);
}

function applyTuitionSlipPrintPage() {
  document.querySelector("#tuitionSlipPrintPage")?.remove();
  const style = document.createElement("style");
  style.id = "tuitionSlipPrintPage";
  style.textContent = "@page { size: A5 portrait; margin: 5mm; }";
  document.head.append(style);
  window.addEventListener("afterprint", cleanupTuitionSlipPrintPage, { once: true });
}

function cleanupTuitionSlipPrintPage() {
  document.body.classList.remove("printing-tuition-slip");
  document.querySelector("#tuitionSlipPrintPage")?.remove();
}

function renderClassSelectOptions(select, currentValue) {
  select.innerHTML = '<option value="">All classes</option>';

  getSortedClassEntries(data.classes.map((classItem, index) => ({ classItem, index }))).forEach(({ classItem }) => {
    const option = document.createElement("option");
    option.value = classItem.name;
    option.textContent = classItem.name;
    select.append(option);
  });

  select.value = [...select.options].some(option => option.value === currentValue) ? currentValue : "";
}

function getFilteredStudentEntries() {
  const selectedClass = filterClass.value;
  const selectedStatus = filterStatus.value;
  const tuitionAlert = isTuitionFollowupActive ? "priority" : "";

  return data.students
    .map((student, index) => ({ student, index }))
    .filter(({ student }) => {
      if (selectedClass && student.className !== selectedClass) return false;
      if (selectedStatus && student.status !== selectedStatus) return false;
      if (!matchesTuitionAlertFilter(student, tuitionAlert)) return false;
      return true;
    })
    .sort((first, second) => compareStudentEntries(first, second, tuitionAlert));
}

function toggleTuitionFollowup() {
  isTuitionFollowupActive = !isTuitionFollowupActive;
  updateTuitionFollowupButton();
  renderStudents();
}

function updateTuitionFollowupButton() {
  const followupCount = data.students.filter(student => matchesTuitionAlertFilter(student, "priority")).length;
  tuitionFollowupButton.classList.toggle("is-active", isTuitionFollowupActive);
  tuitionFollowupButton.textContent = `Follow-up (${followupCount})`;
  tuitionFollowupButton.title = isTuitionFollowupActive ? "Showing tuition follow-up students" : "Show tuition follow-up students";
  tuitionFollowupButton.setAttribute("aria-pressed", isTuitionFollowupActive ? "true" : "false");
}

function matchesTuitionAlertFilter(student, filterValue) {
  if (!filterValue) return true;
  if (student.status !== "Active") return false;

  const followupRank = getTuitionFollowupRank(student);
  const daysUntilDue = getDaysUntilDue(student.nextDueDate);

  if (filterValue === "priority") return followupRank < 3;
  if (filterValue === "none") return daysUntilDue === null;
  if (daysUntilDue === null) return false;
  if (filterValue === "overdue") return daysUntilDue < 0;
  if (filterValue === "today") return daysUntilDue === 0;
  if (filterValue === "7") return daysUntilDue >= 0 && daysUntilDue <= 7;

  return daysUntilDue === Number(filterValue);
}

function getDaysUntilDue(dateValue) {
  const normalizedDate = normalizeDateInput(dateValue);
  if (!normalizedDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseDateValue(normalizedDate);
  dueDate.setHours(0, 0, 0, 0);

  return Math.round((dueDate - today) / 86400000);
}

function getFilteredClassEntries() {
  const selectedClass = classListFilter.value;
  const entries = data.classes
    .map((classItem, index) => ({ classItem, index }))
    .filter(({ classItem }) => !selectedClass || classItem.name === selectedClass);

  return getSortedClassEntries(entries);
}

function getFilteredAttendanceGroups(groups) {
  const selectedClass = attendanceClassFilter.value;
  return getSortedAttendanceGroups(groups
    .filter(group => !selectedClass || group.className === selectedClass));
}

function renderLessonLogs() {
  lessonLogBoard.innerHTML = "";
  const logs = getFilteredLessonLogs();

  if (!logs.length) {
    const empty = document.createElement("div");
    empty.className = "attendance-empty";
    empty.textContent = "No lesson logs found.";
    lessonLogBoard.append(empty);
    return;
  }

  logs.forEach(log => lessonLogBoard.append(createLessonLogCard(log)));
}

function createLessonLogCard(log) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("div");
  const className = document.createElement("strong");
  const meta = document.createElement("span");
  const body = document.createElement("div");
  const studentNotes = document.createElement("div");

  card.className = isRecentLessonLog(log) ? "lesson-log-card new-lesson-log" : "lesson-log-card";
  header.className = "lesson-log-card-header";
  title.className = "lesson-log-title";
  body.className = "lesson-log-body";
  studentNotes.className = "lesson-log-students";
  className.textContent = log.className;
  meta.textContent = `${formatStoredDate(log.date)} | ${log.startTime}-${log.endTime} | ${log.teacher || "No teacher"}`;
  title.append(className, meta);
  header.append(title);

  if (isRecentLessonLog(log)) {
    const badge = document.createElement("span");
    badge.className = "lesson-log-badge";
    badge.textContent = "New";
    header.append(badge);
  }

  body.append(
    createLessonLogField("What taught", log.taught || "-"),
    createLessonLogField("Homework", log.homework || "-"),
    createLessonLogField("General note", log.note || "-")
  );

  if (log.studentNotes.length) {
    const heading = document.createElement("h4");
    heading.textContent = "Student notes";
    studentNotes.append(heading);
    log.studentNotes.forEach(note => {
      const row = document.createElement("div");
      const name = document.createElement("strong");
      const detail = document.createElement("span");
      row.className = "lesson-log-student-note";
      name.textContent = note.studentName;
      detail.textContent = `${note.performance}${note.note ? ` - ${note.note}` : ""}`;
      row.append(name, detail);
      studentNotes.append(row);
    });
  }

  card.append(header, body, studentNotes);
  return card;
}

function isRecentLessonLog(log) {
  const updatedAt = new Date(log.updatedAt || log.createdAt || log.date);
  if (Number.isNaN(updatedAt.getTime())) return false;
  return Date.now() - updatedAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
}

function createLessonLogField(label, value) {
  const field = document.createElement("div");
  const title = document.createElement("strong");
  const content = document.createElement("p");

  field.className = "lesson-log-field";
  title.textContent = label;
  content.textContent = value;
  field.append(title, content);
  return field;
}

function getFilteredLessonLogs() {
  const selectedClass = lessonLogClassFilter.value;
  const selectedTeacher = normalizeSearchText(lessonLogTeacherFilter.value);
  const selectedDate = lessonLogDateFilter.value;

  return [...data.lessonLogs]
    .filter(log => {
      if (selectedClass && log.className !== selectedClass) return false;
      if (selectedTeacher && !normalizeSearchText(log.teacher).includes(selectedTeacher)) return false;
      if (selectedDate && log.date !== selectedDate) return false;
      return true;
    })
    .sort((first, second) => {
      const dateDiff = `${second.date} ${second.startTime}`.localeCompare(`${first.date} ${first.startTime}`);
      if (dateDiff) return dateDiff;
      return compareText(first.className, second.className);
    });
}

function clearLessonLogFilters() {
  lessonLogClassFilter.value = "";
  lessonLogTeacherFilter.value = "";
  lessonLogDateFilter.value = "";
  renderLessonLogs();
}

function renderStudentProgress() {
  studentProgressBoard.innerHTML = "";
  const selectedStudent = data.students[Number(progressStudentSelect.value)];

  if (!selectedStudent) {
    const empty = document.createElement("div");
    empty.className = "attendance-empty";
    empty.textContent = "Choose a student to view progress.";
    studentProgressBoard.append(empty);
    return;
  }

  const entries = getStudentProgressEntries(selectedStudent);
  const allEntries = getStudentProgressEntries(selectedStudent, true);
  const summary = buildStudentPatternSummary(entries);
  const parentDraft = buildParentDraft(selectedStudent, summary, entries);

  studentProgressBoard.append(
    createStudentSnapshotCard(selectedStudent, allEntries),
    createPatternSummaryCard(summary),
    createProgressTimelineCard(entries),
    createParentDraftCard(parentDraft)
  );
}

function getStudentProgressEntries(student, ignoreFilters = false) {
  const selectedPerformance = ignoreFilters ? "" : progressPerformanceFilter.value;
  const rangeValue = ignoreFilters ? "all" : progressRangeFilter.value;
  const rangeStart = getProgressRangeStart(rangeValue);
  const normalizedStudentName = normalizeSearchText(student.name);

  return data.lessonLogs
    .flatMap(log => log.studentNotes.map(note => ({
      log,
      note
    })))
    .filter(({ log, note }) => {
      if (normalizeSearchText(note.studentName) !== normalizedStudentName) return false;
      if (selectedPerformance && note.performance !== selectedPerformance) return false;
      if (rangeStart && parseDateValue(log.date) < rangeStart) return false;
      return true;
    })
    .sort((first, second) => `${second.log.date} ${second.log.startTime}`.localeCompare(`${first.log.date} ${first.log.startTime}`));
}

function getProgressRangeStart(rangeValue) {
  if (rangeValue === "all") return null;
  const days = Number(rangeValue);
  if (!Number.isFinite(days)) return null;
  return addDays(new Date(), -days);
}

function createStudentSnapshotCard(student, entries) {
  const card = document.createElement("article");
  const latestEntry = entries[0];
  const totalLessons = getStudentPaidLessons(student);
  const lessonsDone = Math.max(0, Number(student.lessonsDone) || 0);

  card.className = "student-progress-card student-snapshot";
  card.innerHTML = `
    <div>
      <span>Student</span>
      <strong>${escapeHtml(student.name)}</strong>
    </div>
    <div>
      <span>Class</span>
      <strong>${escapeHtml(student.className)}</strong>
    </div>
    <div>
      <span>Status</span>
      <strong>${escapeHtml(student.status)}</strong>
    </div>
    <div>
      <span>Attendance</span>
      <strong>${lessonsDone}/${totalLessons}</strong>
    </div>
    <div>
      <span>Last class</span>
      <strong>${latestEntry ? formatStoredDate(latestEntry.log.date) : "-"}</strong>
    </div>
    <div>
      <span>Latest performance</span>
      <strong>${latestEntry ? escapeHtml(latestEntry.note.performance) : "-"}</strong>
    </div>
  `;
  return card;
}

function createPatternSummaryCard(summary) {
  const card = document.createElement("article");
  card.className = "student-progress-card pattern-summary-card";
  card.append(createProgressSectionTitle("Pattern Summary"));
  card.append(
    createPatternLine("Recent performance", summary.recentPerformance),
    createPatternList("Strengths", summary.strengths),
    createPatternList("Needs review", summary.needsReview),
    createPatternList("Teacher attention", summary.teacherAttention)
  );
  return card;
}

function createProgressTimelineCard(entries) {
  const card = document.createElement("article");
  card.className = "student-progress-card progress-timeline-card";
  card.append(createProgressSectionTitle("Progress Timeline"));

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "muted-cell";
    empty.textContent = "No student notes in this range.";
    card.append(empty);
    return card;
  }

  entries.forEach(({ log, note }) => {
    const item = document.createElement("div");
    item.className = "progress-timeline-item";
    item.innerHTML = `
      <strong>${formatStoredDate(log.date)} | ${escapeHtml(log.className)} | ${escapeHtml(log.teacher || "No teacher")}</strong>
      <span>${escapeHtml(note.performance)}</span>
      <p>${escapeHtml(note.note || "-")}</p>
    `;
    card.append(item);
  });

  return card;
}

function createParentDraftCard(parentDraft) {
  const card = document.createElement("article");
  card.className = "student-progress-card parent-draft-card";
  card.append(createProgressSectionTitle("Parent Report Draft"));
  const draft = document.createElement("p");
  draft.id = "parentDraftText";
  draft.textContent = parentDraft;
  card.append(draft);
  return card;
}

function createProgressSectionTitle(text) {
  const title = document.createElement("h3");
  title.textContent = text;
  return title;
}

function createPatternLine(label, value) {
  const row = document.createElement("div");
  row.className = "pattern-line";
  row.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
  return row;
}

function createPatternList(label, items) {
  const block = document.createElement("div");
  const title = document.createElement("strong");
  const list = document.createElement("ul");

  block.className = "pattern-list";
  title.textContent = label;
  const values = items.length ? items : ["No clear pattern yet"];
  values.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });

  block.append(title, list);
  return block;
}

function buildStudentPatternSummary(entries) {
  const performanceCounts = countPerformance(entries);
  const recentPerformance = describePerformancePattern(performanceCounts, entries.length);
  const noteText = entries.map(({ note }) => note.note).join(" ").toLowerCase();

  return {
    recentPerformance,
    strengths: detectStrengths(noteText),
    needsReview: detectNeedsReview(noteText),
    teacherAttention: detectTeacherAttention(entries, noteText)
  };
}

function countPerformance(entries) {
  return entries.reduce((counts, { note }) => {
    counts[note.performance] = (counts[note.performance] || 0) + 1;
    return counts;
  }, {});
}

function describePerformancePattern(counts, total) {
  if (!total) return "No recent notes yet";
  const top = Object.entries(counts).sort((first, second) => second[1] - first[1])[0];
  if (!top) return "No recent notes yet";
  if (top[0] === "Excellent") return "Mostly Excellent";
  if (top[0] === "Good") return "Mostly Good";
  if (top[0] === "Improving") return "Improving steadily";
  if (top[0] === "Needs Practice") return "Needs extra support";
  if (top[0] === "Absent") return "Attendance needs attention";
  return top[0];
}

function detectStrengths(text) {
  const strengths = [];
  if (hasAnyKeyword(text, ["speaking", "confidence", "confident", "answer"])) strengths.push("Speaking confidence");
  if (hasAnyKeyword(text, ["vocabulary", "words", "remember"])) strengths.push("Vocabulary recall");
  if (hasAnyKeyword(text, ["listening", "understand"])) strengths.push("Listening comprehension");
  if (hasAnyKeyword(text, ["participation", "active", "focus"])) strengths.push("Class participation");
  return strengths;
}

function detectNeedsReview(text) {
  const needs = [];
  if (hasAnyKeyword(text, ["grammar", "tense", "sentence", "structure"])) needs.push("Grammar accuracy");
  if (hasAnyKeyword(text, ["vocabulary", "words", "spell", "spelling"])) needs.push("Vocabulary");
  if (hasAnyKeyword(text, ["pronunciation", "sound", "stress"])) needs.push("Pronunciation");
  if (hasAnyKeyword(text, ["listening", "hear", "understand"])) needs.push("Listening");
  if (hasAnyKeyword(text, ["homework", "review", "practice"])) needs.push("Home practice");
  return needs;
}

function detectTeacherAttention(entries, text) {
  const attention = [];
  const needsPracticeCount = entries.filter(({ note }) => note.performance === "Needs Practice").length;
  const absentCount = entries.filter(({ note }) => note.performance === "Absent").length;
  if (needsPracticeCount >= 2) attention.push("Needs closer support in class");
  if (absentCount >= 2) attention.push("Follow up attendance");
  if (hasAnyKeyword(text, ["tired", "focus", "distracted"])) attention.push("Monitor focus and energy");
  return attention;
}

function hasAnyKeyword(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildParentDraft(student, summary, entries) {
  if (!entries.length) {
    return `${student.name} does not have enough recent lesson notes yet. Please add student notes in Lesson Log after each class.`;
  }

  const strengths = summary.strengths.length ? summary.strengths.join(", ").toLowerCase() : "class participation";
  const needsReview = summary.needsReview.length ? summary.needsReview.join(", ").toLowerCase() : "recent lesson content";

  return `${student.name} has shown ${summary.recentPerformance.toLowerCase()} recently. The main strength is ${strengths}. Please support continued review of ${needsReview} at home.`;
}

function copyCurrentParentDraft() {
  const draft = studentProgressBoard.querySelector("#parentDraftText");
  if (!draft) return;

  navigator.clipboard?.writeText(draft.textContent)
    .then(() => showToast())
    .catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = draft.textContent;
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      showToast();
    });
}

function getClassDisplayGroups(entries) {
  return [
    { key: "ielts", label: "IELTS Classes", entries: entries.filter(({ classItem }) => getClassCategory(classItem.name) === "ielts") },
    { key: "group", label: "Group Classes", entries: entries.filter(({ classItem }) => getClassCategory(classItem.name) === "group") },
    { key: "oneOnOne", label: "1on1 Classes", entries: entries.filter(({ classItem }) => getClassCategory(classItem.name) === "oneOnOne") }
  ];
}

function getSortedClassEntries(entries) {
  return [...entries].sort((first, second) => {
    const categoryDiff = getClassCategoryRank(first.classItem.name) - getClassCategoryRank(second.classItem.name);
    if (categoryDiff) return categoryDiff;
    return compareText(first.classItem.name, second.classItem.name);
  });
}

function getSortedAttendanceGroups(groups) {
  return [...groups].sort((first, second) => {
    const categoryDiff = getClassCategoryRank(first.className) - getClassCategoryRank(second.className);
    if (categoryDiff) return categoryDiff;
    return compareText(first.className, second.className);
  });
}

function compareStudentEntries(first, second, tuitionAlert = "") {
  const statusDiff = getStudentStatusRank(first.student.status) - getStudentStatusRank(second.student.status);
  if (statusDiff) return statusDiff;

  if (tuitionAlert) {
    const alertDiff = getTuitionFollowupRank(first.student) - getTuitionFollowupRank(second.student);
    if (alertDiff) return alertDiff;

    const paymentDueDiff = Number(isPaymentDueNow(second.student)) - Number(isPaymentDueNow(first.student));
    if (paymentDueDiff) return paymentDueDiff;

    const firstDaysUntilDue = getDaysUntilDue(first.student.nextDueDate);
    const secondDaysUntilDue = getDaysUntilDue(second.student.nextDueDate);
    if (firstDaysUntilDue !== null && secondDaysUntilDue !== null && firstDaysUntilDue !== secondDaysUntilDue) {
      return firstDaysUntilDue - secondDaysUntilDue;
    }
  }

  return compareText(first.student.name, second.student.name);
}

function getTuitionFollowupRank(student) {
  const daysUntilDue = getDaysUntilDue(student.nextDueDate);
  if (isPaymentDueNow(student) || (daysUntilDue !== null && daysUntilDue <= 0)) return 0;
  if (daysUntilDue === 1) return 1;
  if (daysUntilDue === 2) return 2;
  return 3;
}

function isPaymentDueNow(student) {
  return getPaymentReminder(student).className === "reminder-due";
}

function compareText(first, second) {
  return normalizeSearchText(first).localeCompare(normalizeSearchText(second), "vi");
}

function getStudentDisplayGroup(student) {
  if (student.status === "Temporary pause") return "Temporary Pause Students";
  if (student.status === "Stopped") return "Stopped Students";
  return "Active Students";
}

function getStudentStatusRank(status) {
  if (status === "Active") return 0;
  if (status === "Temporary pause") return 1;
  return 2;
}

function getClassCategoryLabel(className) {
  const category = getClassCategory(className);
  if (category === "ielts") return "IELTS Classes";
  if (category === "oneOnOne") return "1on1 Classes";
  return "Group Classes";
}

function getClassCategoryRank(className) {
  const category = getClassCategory(className);
  if (category === "ielts") return 0;
  if (category === "group") return 1;
  return 2;
}

function getClassCategory(className) {
  const normalizedName = normalizeSearchText(className);
  if (normalizedName.includes("ielts")) return "ielts";
  if (normalizedName.includes("1on1") || normalizedName.includes("1-1") || normalizedName.includes("one on one")) return "oneOnOne";
  return "group";
}

function clearStudentFilters() {
  filterClass.value = "";
  filterStatus.value = "";
  isTuitionFollowupActive = false;
  updateTuitionFollowupButton();
  renderStudents();
}

function toggleMobileMenu(menu) {
  const tabsOpen = menu === "tabs" && !document.body.classList.contains("mobile-tabs-open");
  const accountOpen = menu === "account" && !document.body.classList.contains("mobile-account-open");

  document.body.classList.toggle("mobile-tabs-open", tabsOpen);
  document.body.classList.toggle("mobile-account-open", accountOpen);
  updateMobileMenuButtons();
}

function closeMobileMenus() {
  document.body.classList.remove("mobile-tabs-open", "mobile-account-open");
  updateMobileMenuButtons();
}

function updateMobileMenuButtons() {
  mobileTabsToggle.setAttribute("aria-expanded", document.body.classList.contains("mobile-tabs-open") ? "true" : "false");
  mobileAccountToggle.setAttribute("aria-expanded", document.body.classList.contains("mobile-account-open") ? "true" : "false");
}

loadDriveSyncSettings();
render();
if (currentUser && window.matchMedia?.("(max-width: 760px)").matches) {
  showTab(getInitialMobileTabForRole());
}
