// إدارة المواعيد الشخصية اللي المستخدم بيضيفها بنفسه (تُعرض جنب مواعيد Outlook/Google)
// نفس فكرة tasks.js لكن للمواعيد، مع رفعها للمزامنة بين الجهازين

const AppointmentsStore = (() => {
  const STORAGE_PREFIX = "yawmi.appointments.";

  let onChangeHandler = null;

  function dateKey() {
    return TasksStore.dateKey();
  }

  function storageKey() {
    return `${STORAGE_PREFIX}${dateKey()}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveLocal(items) {
    localStorage.setItem(storageKey(), JSON.stringify(items));
  }

  function save(items) {
    saveLocal(items);
    if (onChangeHandler) onChangeHandler(items);
  }

  function replaceAll(items) {
    saveLocal(items);
  }

  function onChange(handler) {
    onChangeHandler = handler;
  }

  function add(title, time) {
    const items = load();
    items.push({
      id: crypto.randomUUID(),
      title: title.trim(),
      time: time || null,
      createdAt: Date.now(),
    });
    save(items);
    return items;
  }

  function remove(id) {
    const items = load().filter((x) => x.id !== id);
    save(items);
    return items;
  }

  return { dateKey, load, replaceAll, onChange, add, remove };
})();
