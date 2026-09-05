// إدارة المهام اليومية (تخزين محلي في المتصفح)

const TasksStore = (() => {
  const STORAGE_PREFIX = "yawmi.tasks."; // مفتاح لكل يوم على حدة

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${STORAGE_PREFIX}${y}-${m}-${day}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(todayKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(tasks) {
    localStorage.setItem(todayKey(), JSON.stringify(tasks));
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

  return { load, add, toggleDone, remove, update };
})();
