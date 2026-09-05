// مزامنة المهام بين جهازين عبر Firebase Firestore (اختياري)
// فكرة العمل: كل جهازين يستخدمون نفس "رمز المزامنة" يشتركون في نفس المستند
// في Firestore، فأي مهمة تُضاف من جهاز تظهر فورًا في الجهاز التاني.

const SyncService = (() => {
  const SYNC_CODE_KEY = "yawmi.syncCode";

  let db = null;
  let unsubscribe = null;
  let ready = false;

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

  // يستمع لتغييرات مهام اليوم القادمة من الجهاز التاني وينادي onRemoteChange بالمصفوفة الجديدة
  async function subscribe(dateKey, onRemoteChange, onError) {
    const syncCode = getSyncCode();
    if (!syncCode) return false;

    const initOk = await ensureInit();
    if (!initOk) return false;

    if (unsubscribe) unsubscribe();

    unsubscribe = docRefFor(syncCode).onSnapshot(
      (snap) => {
        const data = snap.data();
        const tasks = (data && data.tasksByDate && data.tasksByDate[dateKey]) || [];
        onRemoteChange(tasks);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    return true;
  }

  function stop() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  // يرفع مهام يوم معيّن إلى Firestore (دمج بدون حذف باقي الأيام)
  async function pushTasks(dateKey, tasks) {
    const syncCode = getSyncCode();
    if (!syncCode) return;

    const initOk = await ensureInit();
    if (!initOk) return;

    await docRefFor(syncCode).set(
      {
        tasksByDate: { [dateKey]: tasks },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return {
    isConfigured,
    getSyncCode,
    setSyncCode,
    clearSyncCode,
    subscribe,
    stop,
    pushTasks,
  };
})();
