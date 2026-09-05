// مزامنة المهام والمواعيد الشخصية بين جهازين عبر Firebase Firestore (اختياري)
// فكرة العمل: كل جهازين يستخدمون نفس "رمز المزامنة" يشتركون في نفس المستند
// في Firestore، فأي تعديل من جهاز يظهر فورًا في الجهاز التاني.

const SyncService = (() => {
  const SYNC_CODE_KEY = "yawmi.syncCode";

  let db = null;
  let ready = false;
  const unsubscribers = {}; // fieldName -> unsubscribe function

  function isConfigured() {
    return (
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY"
    );
  }

  function getSyncCode() {
    return localStorage.getItem(SYNC_CODE_KEY) || "";
  }

  function setSyncCode(code) {
    localStorage.setItem(SYNC_CODE_KEY, code.trim());
  }

  function clearSyncCode() {
    localStorage.removeItem(SYNC_CODE_KEY);
  }

  async function ensureInit() {
    if (ready) return true;
    if (!isConfigured()) return false;
    if (!window.firebase) return false;

    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    await firebase.auth().signInAnonymously();
    db = firebase.firestore();
    ready = true;
    return true;
  }

  function docRefFor(syncCode) {
    return db.collection("syncGroups").doc(syncCode);
  }

  // يستمع لتغييرات حقل معيّن (مثلاً tasksByDate أو appointmentsByDate) القادمة
  // من الجهاز التاني وينادي onRemoteChange بالمصفوفة الجديدة
  async function subscribeField(fieldName, dateKey, onRemoteChange, onError) {
    const syncCode = getSyncCode();
    if (!syncCode) return false;

    const initOk = await ensureInit();
    if (!initOk) return false;

    if (unsubscribers[fieldName]) unsubscribers[fieldName]();

    unsubscribers[fieldName] = docRefFor(syncCode).onSnapshot(
      (snap) => {
        const data = snap.data();
        const items = (data && data[fieldName] && data[fieldName][dateKey]) || [];
        onRemoteChange(items);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    return true;
  }

  function stop() {
    for (const key of Object.keys(unsubscribers)) {
      unsubscribers[key]();
      delete unsubscribers[key];
    }
  }

  // يرفع بيانات يوم معيّن لحقل معيّن إلى Firestore (دمج بدون حذف باقي الأيام/الحقول)
  async function pushField(fieldName, dateKey, items) {
    const syncCode = getSyncCode();
    if (!syncCode) return;

    const initOk = await ensureInit();
    if (!initOk) return;

    await docRefFor(syncCode).set(
      {
        [fieldName]: { [dateKey]: items },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  // اختصارات للمهام (توافقًا مع الاستخدام الحالي)
  function subscribe(dateKey, onRemoteChange, onError) {
    return subscribeField("tasksByDate", dateKey, onRemoteChange, onError);
  }

  function pushTasks(dateKey, tasks) {
    return pushField("tasksByDate", dateKey, tasks);
  }

  return {
    isConfigured,
    getSyncCode,
    setSyncCode,
    clearSyncCode,
    subscribe,
    subscribeField,
    pushField,
    stop,
    pushTasks,
  };
})();
