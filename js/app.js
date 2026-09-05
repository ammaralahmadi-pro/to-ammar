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

// ---------- المواعيد (Outlook + Google) ----------

function waitForGoogleLoaded(timeoutMs = 4000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (window.google && google.accounts && google.accounts.oauth2) {
        resolve(true);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(check, 100);
    })();
  });
}

async function setupCalendar() {
  const statusEl = document.getElementById("calendarStatus");
  const msSignInBtn = document.getElementById("msSignInBtn");
  const msSignOutBtn = document.getElementById("msSignOutBtn");
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  const googleSignOutBtn = document.getElementById("googleSignOutBtn");
  const refreshBtn = document.getElementById("refreshCalendarBtn");

  let outlookReady = false;
  let googleReady = false;

  // إعداد Outlook
  if (CalendarService.isConfigured()) {
    try {
      await CalendarService.init();
      outlookReady = true;
    } catch (e) {
      // تجاهل، هيظهر زر Outlook معطل
    }
  }
  if (!outlookReady) {
    msSignInBtn.classList.add("hidden");
    msSignOutBtn.classList.add("hidden");
  }

  // إعداد Google
  if (GoogleCalendarService.isConfigured()) {
    const loaded = await waitForGoogleLoaded();
    if (loaded && GoogleCalendarService.init()) {
      googleReady = true;
    }
  }
  if (!googleReady) {
    googleSignInBtn.classList.add("hidden");
    googleSignOutBtn.classList.add("hidden");
  }

  if (!outlookReady && !googleReady) {
    statusEl.textContent = "لم يتم إعداد أي حساب تقويم بعد (راجع js/config.js).";
    return;
  }

  updateAuthButtons();

  if (outlookReady) {
    msSignInBtn.addEventListener("click", async () => {
      await CalendarService.signIn();
    });
    msSignOutBtn.addEventListener("click", async () => {
      await CalendarService.signOut();
      updateAuthButtons();
      loadEvents();
    });
  }

  if (googleReady) {
    googleSignInBtn.addEventListener("click", async () => {
      try {
        await GoogleCalendarService.signIn();
        updateAuthButtons();
        loadEvents();
      } catch (e) {
        statusEl.textContent = "تعذر تسجيل الدخول بحساب Google.";
        statusEl.classList.add("error");
      }
    });
    googleSignOutBtn.addEventListener("click", () => {
      GoogleCalendarService.signOut();
      updateAuthButtons();
      loadEvents();
    });
  }

  refreshBtn.addEventListener("click", () => loadEvents());

  if ((outlookReady && CalendarService.isSignedIn()) || (googleReady && GoogleCalendarService.isSignedIn())) {
    await loadEvents();
  } else {
    statusEl.textContent = "سجّل الدخول بحساب Outlook أو Google لعرض مواعيد اليوم.";
  }

  function updateAuthButtons() {
    if (outlookReady) {
      const signedIn = CalendarService.isSignedIn();
      msSignInBtn.classList.toggle("hidden", signedIn);
      msSignOutBtn.classList.toggle("hidden", !signedIn);
    }
    if (googleReady) {
      const signedIn = GoogleCalendarService.isSignedIn();
      googleSignInBtn.classList.toggle("hidden", signedIn);
      googleSignOutBtn.classList.toggle("hidden", !signedIn);
    }
  }

  async function loadEvents() {
    statusEl.classList.remove("error");
    statusEl.textContent = "جارٍ تحميل المواعيد...";
    refreshBtn.classList.add("spinning");

    const results = await Promise.allSettled([
      outlookReady && CalendarService.isSignedIn() ? CalendarService.getTodayEvents() : Promise.resolve([]),
      googleReady && GoogleCalendarService.isSignedIn() ? GoogleCalendarService.getTodayEvents() : Promise.resolve([]),
    ]);

    const events = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    events.sort((a, b) => {
      if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
      return (a.start || "").localeCompare(b.start || "");
    });

    renderEvents(events);

    const hasFailure = results.some((r) => r.status === "rejected");
    if (hasFailure) {
      statusEl.textContent = "تعذر تحميل بعض المواعيد. حاول تسجيل الدخول مجددًا.";
      statusEl.classList.add("error");
    } else {
      statusEl.textContent = events.length
        ? `تم التحديث · ${events.length} موعد اليوم`
        : "لا توجد مواعيد اليوم.";
    }

    refreshBtn.classList.remove("spinning");
  }
}

function renderEvents(events) {
  const listEl = document.getElementById("eventsList");
  listEl.innerHTML = "";

  const sourceLabels = { outlook: "Outlook", google: "Google" };

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

    const titleRow = document.createElement("div");
    titleRow.className = "event-title-row";

    const titleEl = document.createElement("span");
    titleEl.className = "event-title";
    titleEl.textContent = ev.title;
    titleRow.appendChild(titleEl);

    if (ev.source && sourceLabels[ev.source]) {
      const badge = document.createElement("span");
      badge.className = `event-badge event-badge-${ev.source}`;
      badge.textContent = sourceLabels[ev.source];
      titleRow.appendChild(badge);
    }

    info.appendChild(titleRow);

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
