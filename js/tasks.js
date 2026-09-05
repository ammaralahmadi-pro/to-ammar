// إدارة المهام اليومية (تخزين محلي في المتصفح + رفع اختياري للمزامنة)

const TasksStore = (() => {
  const STORAGE_PREFIX = "yawmi.tasks."; // مفتاح لكل يوم على حدة

  let onChangeHandler = null; // يُستدعى بعد أي تعديل محلي (لرفعه للمزامنة)

  function dateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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

  function saveLocal(tasks) {
    localStorage.setItem(storageKey(), JSON.stringify(tasks));
  }

  function save(tasks) {
    saveLocal(tasks);
    if (onChangeHandler) onChangeHandler(tasks);
  }

  // يستبدل المهام محليًا من غير ما ينادي onChangeHandler (لتفادي حلقة مزامنة لا نهائية)
  function replaceAll(tasks) {
    saveLocal(tasks);
  }

  function onChange(handler) {
    onChangeHandler = handler;
  }

  function add(title, time) {
    const tasks = load();
    tasks.push({
      id: crypto.randomUUID(),
      title: title.trim(),
      time: time || null,
      done: false,
      createdAt: Date.now(),
    });
    save(tasks);
    return tasks;
  }

  function toggleDone(id) {
    const tasks = load();
    const t = tasks.find((x) => x.id === id);
    if (t) t.done = !t.done;
    save(tasks);
    return tasks;
  }

  function remove(id) {
    const tasks = load().filter((x) => x.id !== id);
    save(tasks);
    return tasks;
  }

  function update(id, changes) {
    const tasks = load();
    const t = tasks.find((x) => x.id === id);
    if (t) Object.assign(t, changes);
    save(tasks);
    return tasks;
  }

  return { dateKey, load, replaceAll, onChange, add, toggleDone, remove, update };
})();
