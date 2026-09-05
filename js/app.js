// منطق الواجهة الرئيسي: ربط المهام والمواعيد بالصفحة

document.addEventListener("DOMContentLoaded", async () => {
  renderDate();
  renderTasks();
  setupTaskForm();
  await setupCalendar();
});

function renderDate() {
  const el = document.getElementById("todayDate");
  const formatter = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  el.textContent = formatter.format(new Date());
}

// ---------- المهام ----------

function setupTaskForm() {
  const form = document.getElementById("taskForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("taskTitle");
    const timeInput = document.getElementById("taskTime");
    const title = titleInput.value.trim();
    if (!title) return;
    TasksStore.add(title, timeInput.value);
    titleInput.value = "";
    timeInput.value = "";
    renderTasks();
  });
}

function renderTasks() {
  const list = document.getElementById("tasksList");
  const emptyMsg = document.getElementById("tasksEmpty");
  const tasks = TasksStore.load().sort((a, b) => {
    if (!!a.time !== !!b.time) return a.time ? -1 : 1;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    return a.createdAt - b.createdAt;
  });

  list.innerHTML = "";

  if (tasks.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      TasksStore.toggleDone(task.id);
      renderTasks();
    });

    const body = document.createElement("div");
    body.className = "task-body";

    const titleEl = document.createElement("span");
    titleEl.className = "task-title";
    titleEl.textContent = task.title;
    body.appendChild(titleEl);

    if (task.time) {
      const timeEl = document.createElement("span");
      timeEl.className = "task-time";
      timeEl.textContent = task.time;
      body.appendChild(timeEl);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete";
    deleteBtn.setAttribute("aria-label", "حذف المهمة");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => {
      TasksStore.remove(task.id);
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(body);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  }
}

// ---------- المواعيد ----------

async function setupCalendar() {
  const statusEl = document.getElementById("calendarStatus");
  const signInBtn = document.getElementById("msSignInBtn");
  const signOutBtn = document.getElementById("msSignOutBtn");
  const refreshBtn = document.getElementById("refreshCalendarBtn");

  if (!CalendarService.isConfigured()) {
    statusEl.textContent = "لم يتم إعداد الاتصال بـ Outlook بعد (راجع js/config.js).";
    signInBtn.classList.add("hidden");
    return;
  }

  try {
    await CalendarService.init();
  } catch (e) {
    statusEl.textContent = "تعذر تهيئة تسجيل الدخول إلى Microsoft.";
    statusEl.classList.add("error");
    return;
  }

  updateAuthButtons();

  signInBtn.addEventListener("click", () => CalendarService.signIn());
  signOutBtn.addEventListener("click", () => CalendarService.signOut());
  refreshBtn.addEventListener("click", () => loadEvents());

  if (CalendarService.isSignedIn()) {
    await loadEvents();
  } else {
    statusEl.textContent = "سجّل الدخول بحساب Outlook لعرض مواعيد اليوم.";
  }

  function updateAuthButtons() {
    const signedIn = CalendarService.isSignedIn();
    signInBtn.classList.toggle("hidden", signedIn);
    signOutBtn.classList.toggle("hidden", !signedIn);
  }

  async function loadEvents() {
    const listEl = document.getElementById("eventsList");
    statusEl.classList.remove("error");
    statusEl.textContent = "جارٍ تحميل المواعيد...";
    refreshBtn.classList.add("spinning");

    try {
      const events = await CalendarService.getTodayEvents();
      renderEvents(events);
      statusEl.textContent = events.length
        ? `تم التحديث · ${events.length} موعد اليوم`
        : "لا توجد مواعيد اليوم.";
    } catch (e) {
      statusEl.textContent = "تعذر تحميل المواعيد. حاول تسجيل الدخول مجددًا.";
      statusEl.classList.add("error");
    } finally {
      refreshBtn.classList.remove("spinning");
    }
  }
}

function renderEvents(events) {
  const listEl = document.getElementById("eventsList");
  listEl.innerHTML = "";

  for (const ev of events) {
    const li = document.createElement("li");
    li.className = "event-item";

    const timeEl = document.createElement("span");
    timeEl.className = "event-time";
    timeEl.textContent = ev.isAllDay
      ? "طوال اليوم"
      : formatTime(ev.start);

    const info = document.createElement("div");
    info.className = "event-info";

    const titleEl = document.createElement("span");
    titleEl.className = "event-title";
    titleEl.textContent = ev.title;
    info.appendChild(titleEl);

    if (ev.location) {
      const locEl = document.createElement("span");
      locEl.className = "event-location";
      locEl.textContent = ev.location;
      info.appendChild(locEl);
    }

    li.appendChild(timeEl);
    li.appendChild(info);
    listEl.appendChild(li);
  }
}

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}
