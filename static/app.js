import { t, tr, language, serviceText } from "./locale.js";
document.documentElement.lang = language;
document.title = t("Oval Index · 速滑比赛档案");
document.querySelector('meta[name="description"]').content = t(
  "从官方比赛资料查看短道速滑个人成绩和经核验的录像片段。",
);
document
  .querySelectorAll("[data-i18n]")
  .forEach((el) => (el.textContent = t(el.dataset.i18n)));
document
  .querySelectorAll("[data-i18n-aria]")
  .forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
const $ = (selector, root = document) => root.querySelector(selector);
const staticPreview = $('meta[name="oval-snapshot"]')?.content === "true";
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  settings:
    '<path d="m9.5 3-.6 2.1-1.5.9-2.1-.5-2 3.4 1.5 1.5v2l-1.5 1.5 2 3.4 2.1-.5 1.5.9.6 2.1h4l.6-2.1 1.5-.9 2.1.5 2-3.4-1.5-1.5v-2l1.5-1.5-2-3.4-2.1.5-1.5-.9-.6-2.1z"/><circle cx="11.5" cy="11.4" r="3"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3c2 .8 3 2 3 5"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  club: '<path d="M3 21h18M5 21V6l7-3 7 3v15M9 8h1m4 0h1m-6 4h1m4 0h1m-4 9v-5h4v5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18m-13 4h2m3 0h2"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8m-8 4h6"/>',
  external: '<path d="M13 4h7v7m0-7L10 14m0-8H5v14h14v-6"/>',
  list: '<path d="M3 5h15M3 11h10M3 17h6m6-6 6 4-6 4z"/>',
};
const icon = (name) =>
  `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ""}</svg>`;
document
  .querySelectorAll("[data-icon]")
  .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
const statuses = {
  pending: t("待定位"),
  candidate: t("候选待确认"),
  confirmed: t("已确认"),
  not_recorded: t("确认未录到"),
};
const clipStatus = (race) =>
  Object.hasOwn(statuses, race.clip?.status) ? race.clip.status : "pending";
const badge = (status) =>
  `<span class="status ${escape(status)}">${escape(statuses[status] || t("待定位"))}</span>`;
const displayName = (name) =>
  String(name ?? "").replace(/^([^,]+),\s*(.+)$/, "$2 $1");
const fold = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const dateFormat = new Intl.DateTimeFormat(
  language === "en" ? "en-US" : "zh-CN",
  { dateStyle: "medium", timeZone: "UTC" },
);
const dateLabel = (date) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? dateFormat.format(new Date(date + "T12:00:00Z"))
    : date || "";
const eventDate = (ev) =>
  ev.end_date && ev.end_date !== ev.date
    ? dateLabel(ev.date) + " – " + dateLabel(ev.end_date)
    : dateLabel(ev.date);
const roundName = (r) => {
  const word = r.round || r.round_raw || "";
  return (
    {
      heat: t("预赛"),
      qualif: t("预赛"),
      qualifying: t("预赛"),
      semifinal: t("半决赛"),
      final: t("决赛"),
    }[
      String(word)
        .toLowerCase()
        .replace(/[ ._-]+/g, "")
    ] ||
    word ||
    t("轮次待核对")
  );
};
const groupName = (r) => {
  const group = String(r.group || "");
  if (group.toLowerCase() === "open") return t("公开组");
  const label = group.replace(/^group /i, "");
  return label ? tr("Group " + label, label + " 组") : "";
};
const urlFor = (path, params) => path + "?" + new URLSearchParams(params);
const safeHref = (href) => {
  if (!href) return "";
  try {
    const url = new URL(href, location.href);
    return ["https:", "http:"].includes(url.protocol) ? escape(url.href) : "";
  } catch {
    return "";
  }
};
async function api(path, options = {}) {
  let selectedEvent = null;
  if (staticPreview) {
    const request = new URL(path, location.href);
    const name = request.pathname.split("/").at(-1);
    const id = request.searchParams.get("id");
    if (options.method && options.method !== "GET")
      throw Error(tr("This preview is read-only.", "此预览版仅供浏览。"));
    if (name === "bootstrap") path = "./snapshot/bootstrap.json";
    else if (["profile", "event", "race"].includes(name) && /^\d+$/.test(id || "")) {
      path = `./snapshot/${name}/${id}.json`;
      if (name === "event") selectedEvent = request.searchParams.get("athlete");
    } else throw Error(tr("This page is unavailable in the preview.", "预览版暂未提供此页面。"));
  }
  const result = await fetch(path, options);
  let value;
  try {
    value = await result.json();
  } catch {
    throw Error(`${t("服务返回了无法读取的响应（")}${result.status}${t("）")}`);
  }
  if (
    !result.ok ||
    (value.error && !value.id && !value.job_id && !value.status)
  )
    throw Error(
      serviceText(value.error) ||
        `${t("请求失败（")}${result.status}${t("）")}`,
    );
  if (selectedEvent) {
    const athlete = value.athletes.find((item) => String(item.id) === selectedEvent);
    if (athlete) {
      const { races } = await api(urlFor("/api/profile", { id: athlete.id }));
      return { ...value, athlete, races: races.filter((race) => race.event_id === value.event.id) };
    }
  }
  return value;
}
const post = (path, data) =>
  api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
const $main = $("#main"),
  dialog = $("#overlay"),
  body = $("#dialog-content");
let store = { athletes: [], events: [], jobs: [], admin: false },
  profile = null,
  view = "",
  filters = {},
  selected = null,
  serial = 0;
let timer = null,
  playerDestroy = null,
  jobTimer = null,
  videoTimer = null,
  currentDetail = 0;
function laterError(paragraph, err) {
  if (paragraph)
    paragraph.textContent = serviceText(err.message || String(err));
}
function toast(message) {
  clearTimeout(timer);
  $("#toast").textContent = message;
  timer = setTimeout(() => ($("#toast").textContent = ""), 3500);
}
function openDialog(title, html) {
  if (playerDestroy) {
    playerDestroy();
    playerDestroy = null;
  }
  $("#dialog-heading").textContent = title;
  body.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  else dialog.scrollTop = 0;
}
function closeDialog() {
  if (dialog.open) dialog.close();
}
dialog.addEventListener("close", () => {
  if (playerDestroy) {
    playerDestroy();
    playerDestroy = null;
  }
  currentDetail++;
});
$("#close").onclick = closeDialog;
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeDialog();
  }
});
const eventOf = (r) =>
  store.events.find((e) => String(e.id) === String(r.event_id)) || {};
const titleOf = (r) => r.event_name || eventOf(r).name || t("赛事资料待核对");
const eventLink = (eventId, athleteId) =>
  "#event/" + Number(eventId) + (athleteId ? "/" + Number(athleteId) : "");
function resultOf(r) {
  if (r.status) {
    const time = /^[-—\s]*$/.test(r.time_raw || "") ? "" : r.time_raw;
    return escape([r.status, time].filter(Boolean).join(" · "));
  }
  if (r.suspect || !Number.isInteger(r.time_ms))
    return escape(r.time_raw || "—");
  const ms = r.time_ms;
  return (
    String(Math.floor(ms / 60000)).padStart(2, "0") +
    ":" +
    String(Math.floor(ms / 1000) % 60).padStart(2, "0") +
    "." +
    String(ms % 1000).padStart(3, "0")
  );
}
const formattedTime = (r) =>
  `<span class="time">${resultOf(r)}</span>${r.suspect ? ` <small class="error">${t("待核验")}</small>` : ""}`;
const confirmed = (list) =>
  list.filter(
    (r) =>
      clipStatus(r) === "confirmed" &&
      r.clip.start != null &&
      r.clip.end > r.clip.start &&
      r.clip.youtube_id,
  );
const dns = (entry) => String(entry?.status || "").toUpperCase() === "DNS";
const disputed = (race) =>
  race.reports?.some(
    (report) => report.reason === "wrong_athlete" && !report.resolved_at,
  );
const subRound = (r) =>
  [roundName(r), groupName(r)].filter(Boolean).map(escape).join(" · ");
function raceKey(r) {
  return `<div class="race-key"><span class="race-code">${escape(r.label)}</span><div><span class="distance">${escape(r.distance)}<span class="unit">m</span></span><div class="round">${subRound(r)}${disputed(r) ? ` · <span class="error">${t("归属待复核")}</span>` : ""}</div></div></div>`;
}
function metric(n, label) {
  return `<div class="metric"><strong>${escape(n)}</strong><span>${escape(label)}</span></div>`;
}
function selectFilter(name, values, label) {
  return `<label><span class="sr">${label}</span><select data-filter="${name}"><option value="">${label}</option>${[...new Map(values).entries()].map(([v, t]) => `<option value="${escape(v)}"${String(filters[name]) === String(v) ? " selected" : ""}>${escape(t)}</option>`).join("")}</select></label>`;
}
function renderProfile() {
  if (!profile) {
    if (store.athletes.length) {
      $main.innerHTML = `<section class="athlete-start" aria-labelledby="athlete-start-title"><h1 id="athlete-start-title">${t("选择选手")}</h1><p>${tr("Pick an athlete to see their race results and videos.", "选中一位选手，查看他们的比赛成绩和录像。")}</p><button type="button" class="btn primary" id="choose-athlete">${icon("search")}${tr("Find an athlete", "查找选手")}</button></section>`;
      $("#choose-athlete").onclick = () => openPicker();
      return;
    }
    $main.innerHTML = `<div class="empty"><h2>${t("尚未导入比赛资料")}</h2><a class="btn primary" href="${store.admin ? "#import" : "#events"}">${store.admin ? t("导入赛事资料") : t("赛事")}</a></div>`;
    return;
  }
  const athlete = profile.athlete,
    races = profile.races,
    clips = confirmed(races);
  const ownClips = clips.filter((r) => !dns(r) && !disputed(r));
  $main.innerHTML = `<section class="profile-card" aria-labelledby="athlete-title"><div class="track-art" aria-hidden="true"><div class="track-body"><i></i><i></i><i></i><i></i><i></i><i></i><b></b></div></div><div class="hero-body"><div class="hero-label">${t("选手档案")}</div><h1 id="athlete-title">${escape(displayName(athlete.name))}</h1><p class="club">${icon("club")}${escape(athlete.club || t("俱乐部未提供"))}</p></div><div class="stats">${metric(races.length, t("参赛记录"))}${metric(clips.length, t("录像已确认"))}${metric(races.length - clips.length, t("尚无确认录像"))}${ownClips.length ? `<button id="play-all" type="button" class="watch-all">${icon("list")}${ownClips.length > 1 ? t("连续观看") : t("观看本人比赛")}</button>` : ""}</div></section>
  <section aria-labelledby="records-heading"><div class="section-head"><h2 id="records-heading">${t("比赛记录")}</h2><div class="filters">${selectFilter(
    "event",
    races.map((r) => [String(r.event_id), titleOf(r)]),
    t("全部赛事"),
  )}${selectFilter(
    "date",
    races.map((r) => [r.date, dateLabel(r.date)]),
    t("全部日期"),
  )}${selectFilter(
    "distance",
    [...races]
      .sort((a, b) => a.distance - b.distance)
      .map((r) => [String(r.distance), r.distance + " m"]),
    t("全部距离"),
  )}</div></div><div id="records"></div></section>`;
  if (ownClips.length) $("#play-all").onclick = () => openPlayback(ownClips);
  $main.querySelectorAll("[data-filter]").forEach(
    (el) =>
      (el.onchange = () => {
        filters[el.dataset.filter] = el.value;
        renderRecords();
      }),
  );
  renderRecords();
}
function raceClipAction(r) {
  const status = clipStatus(r);
  if (status === "confirmed" && confirmed([r]).length) {
    const sameRace = dns(r) || disputed(r);
    return `<button class="status confirmed play" data-play="${escape(r.id)}" aria-label="${t("播放")} ${escape(r.label)} ${sameRace ? t("同场录像") : t("录像")}">${icon("play")}${sameRace ? t("同场录像") : t("观看片段")}</button>`;
  }
  if (status === "candidate" && r.clip.youtube_id && r.clip.start != null && r.clip.end > r.clip.start) {
    const label = t("预览候选片段");
    const hint = dns(r) || disputed(r)
      ? tr("Race footage awaiting visual confirmation", "同场录像，等待核对画面")
      : tr("Awaiting visual confirmation", "等待核对录像画面");
    return `<button class="status candidate play" data-play="${escape(r.id)}" aria-label="${label} · ${escape(r.label)} · ${hint}" title="${hint}">${icon("play")}${label}</button>`;
  }
  return badge(status);
}
function candidateCues({ uncertainty: observed }) {
  if (!observed) return "";
  const cues = [];
  if (observed.first_racing_observed === false)
    cues.push(tr("Racing footage was not detected", "未识别到比赛进行画面"));
  if (observed.finish_observed === false)
    cues.push(tr("Finish footage was not detected", "未识别到终点画面"));
  if (observed.delay_observed)
    cues.push(tr("Broadcast delay detected", "检测到播出延误"));
  if (observed.separate_runs > 1)
    cues.push(tr("Race markers appear in separate intervals", "同场标记分段出现"));
  return cues.length ? `<p class="review-cues">${cues.join(" · ")}</p>` : "";
}
function leadInNote(clip) {
  const seconds = Number(clip.detected_start) - Number(clip.start);
  if (clip.detected_start == null || !(seconds > 0)) return "";
  return tr(`Playback includes ${seconds} s of lead-in.`, `已提前 ${seconds} 秒开始播放。`);
}
function renderRecords() {
  const races = profile.races.filter(
    (r) =>
      (!filters.event || String(r.event_id) === filters.event) &&
      (!filters.date || r.date === filters.date) &&
      (!filters.distance || String(r.distance) === filters.distance),
  );
  renderRaceList($("#records"), races, profile.athlete, profile.races.length > 0);
}
function renderRaceList(list, races, athlete, canClear = false) {
  const groups = new Map();
  for (const r of races) {
    const key = JSON.stringify([r.event_id, r.date]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  if (!races.length) {
    list.innerHTML = `<div class="empty"><h3>${canClear ? t("没有符合筛选条件的比赛") : t("尚无参赛记录")}</h3>${canClear ? `<button class="btn" id="clear-filters">${t("清除筛选")}</button>` : ""}</div>`;
    if ($("#clear-filters"))
      $("#clear-filters").onclick = () => {
        filters = {};
        renderProfile();
      };
    return;
  }
  list.innerHTML = [...groups.values()]
    .map((rows) => {
      const r = rows[0],
        venue = r.venue || eventOf(r).venue || eventOf(r).location || "";
      const title = view === "event"
        ? escape(dateLabel(r.date))
        : `<a class="meet-link" href="${eventLink(r.event_id, athlete?.id)}">${escape(titleOf(r))} ${icon("arrow")}</a>`;
      return `<article class="race-group"><header class="meet-head"><div class="event-icon">${icon("calendar")}</div><div><h3>${title}</h3><p class="meta">${view === "event" ? "" : `<span>${escape(dateLabel(r.date))}</span>`}${venue ? `<span>${escape(venue)}</span>` : ""}</p></div></header><div class="race-row head" aria-hidden="true"><span>${t("项目 / 场次")}</span><span>${t("正式成绩")}</span><span>${t("场内名次")}</span><span>${t("录像")}</span><span></span></div>${rows.map((r) => `<div class="race-row" data-row="${escape(r.id)}">${raceKey(r)}<div class="r-time"><span class="sr">${t("正式成绩")} </span>${formattedTime(r)}</div><div class="r-rank"><span class="sr">${t("场内名次")} </span><span class="rank">${escape(r.place ?? "—")}</span></div><div class="r-clip">${raceClipAction(r)}</div><button class="race-open" data-race="${escape(r.id)}" aria-label="${t("查看")} ${escape(r.label)} ${t("比赛详情")}"><span>${t("详情")}</span>${icon("arrow")}</button></div>`).join("")}</article>`;
    })
    .join("");
  list
    .querySelectorAll("[data-race]")
    .forEach((b) => (b.onclick = () => showRace(b.dataset.race, null, athlete)));
  list.querySelectorAll("[data-row]").forEach(
    (row) =>
      (row.onclick = (e) => {
        if (!e.target.closest("button,a") && !window.getSelection().toString())
          showRace(row.dataset.row, null, athlete);
      }),
  );
  list.querySelectorAll("[data-play]").forEach((button) => {
    button.onclick = () => {
      const row = races.find((r) => String(r.id) === button.dataset.play);
      openPlayback([row], null, clipStatus(row) === "candidate");
    };
  });
}
async function loadProfile(id) {
  const request = ++serial;
  if (!id) {
    profile = null;
    if (view === "profile") renderProfile();
    return;
  }
  const result = await api(urlFor("/api/profile", { id }));
  if (request !== serial) return;
  profile = result;
  if (view === "profile") renderProfile();
}
async function refresh() {
  store = await api("/api/bootstrap");
  store.jobs ||= [];
  $("#switch").disabled = !store.athletes.length;
  const requested = new URLSearchParams(location.search).get("athlete");
  const id = store.athletes.find((a) => String(a.id) === requested)?.id;
  await loadProfile(id);
}
function openPicker(eventPage = null) {
  selected = eventPage ? eventPage.athlete?.id : profile?.athlete.id;
  openDialog(
    t("选择选手"),
    `<label class="field"><span>${t("姓名或俱乐部")}</span><span class="search-wrap">${icon("search")}<input id="athlete-search" type="search" autocomplete="off" placeholder="${t("输入姓名、别名或俱乐部")}"></span></label><ul class="athletes" id="athlete-list"></ul><div class="picker-foot"><span class="hint" id="chosen"></span><button class="btn primary" id="confirm-athlete">${eventPage ? tr("View event races", "查看本站比赛") : t("查看此人档案")}</button></div>${!eventPage && store.admin && profile ? `<details class="inset"><summary>${t("为当前选手添加姓名别名")}</summary><form id="alias-form"><label class="field"><span>${escape(displayName(profile.athlete.name))} ${t("的其他拼写")}</span><input name="alias" required maxlength="100" autocomplete="off"></label><button class="btn" type="submit">${t("保存别名")}</button><p class="error" role="status"></p></form></details>` : ""}`,
  );
  function update() {
    const terms = fold($("#athlete-search").value).split(" ").filter(Boolean);
    const matches = (eventPage?.athletes || store.athletes).filter((a) => {
      const text = fold([a.name, a.club, ...(a.aliases || [])].join(" "));
      return terms.every((t) => text.includes(t));
    });
    $("#athlete-list").innerHTML =
      matches
        .map(
          (a) =>
            `<li><button type="button" data-athlete="${escape(a.id)}" aria-pressed="${String(selected) === String(a.id)}"><span><strong>${escape(displayName(a.name))}</strong><small>${escape(a.club || t("俱乐部未提供"))}</small></span>${String(selected) === String(a.id) ? icon("check") : ""}</button></li>`,
        )
        .join("") || `<li class="notice">${t("没有找到匹配的选手")}</li>`;
    $("#athlete-list")
      .querySelectorAll("[data-athlete]")
      .forEach(
        (b) =>
          (b.onclick = () => {
            selected = b.dataset.athlete;
            update();
            $("#athlete-list [aria-pressed=true]")?.focus({
              preventScroll: true,
            });
          }),
      );
    const a = matches.find((a) => String(a.id) === String(selected));
    $("#chosen").textContent = a
      ? displayName(a.name)
      : t("请根据俱乐部确认选手");
    $("#confirm-athlete").disabled = !a;
  }
  $("#athlete-search").oninput = update;
  update();
  $("#athlete-search").focus();
  $("#confirm-athlete").onclick = async (e) => {
    if (eventPage) {
      closeDialog();
      location.hash = eventLink(eventPage.event.id, selected);
      return;
    }
    const b = e.currentTarget;
    b.disabled = true;
    try {
      await loadProfile(selected);
      filters = {};
      const url = new URL(location.href);
      url.searchParams.set("athlete", selected);
      url.hash = "profile";
      history.replaceState(null, "", url);
      closeDialog();
      route();
    } catch (err) {
      laterError($("#chosen"), err);
      b.disabled = false;
    }
  };
  if ($("#alias-form"))
    $("#alias-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      try {
        await post("/api/alias", {
          athlete_id: profile.athlete.id,
          alias: f.alias.value.trim(),
        });
        await refresh();
        openPicker();
        toast(t("已保存姓名别名"));
      } catch (err) {
        laterError($(".error", f), err);
      }
    };
}
$("#switch").onclick = () => openPicker();
document.addEventListener(
  "invalid",
  (e) => {
    const field = e.target;
    if (!field.validity || !field.setCustomValidity) return;
    if (field.validity.valueMissing)
      field.setCustomValidity(tr("Fill in this field.", "请填写此项。"));
    else if (field.validity.typeMismatch)
      field.setCustomValidity(tr("Enter a valid URL.", "请输入有效链接。"));
  },
  true,
);
document.addEventListener("input", (e) => {
  if (e.target.setCustomValidity) e.target.setCustomValidity("");
});
function route() {
  clearTimeout(jobTimer);
  clearTimeout(videoTimer);
  closeDialog();
  const eventPath = /^#event\/(\d+)(?:\/(\d+))?$/.exec(location.hash);
  const page = location.hash.slice(1);
  view = eventPath ? "event" : page.startsWith("feedback/") ? "feedback"
    : ["events", "feedback", "import", "video"].includes(page) ? page : "profile";
  if (!store.admin && ["import", "video"].includes(view)) view = "events";
  const switchAthlete = $("#switch");
  switchAthlete.hidden = view === "event" || (view === "profile" && !profile);
  $("[data-i18n]", switchAthlete).textContent = t(profile ? "切换选手" : "选择选手");
  const tab = ["event", "import", "video"].includes(view) ? "events" : view;
  for (const key of ["profile", "events", "feedback"]) {
    const n = $("#nav-" + key);
    if (tab === key) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  }
  if (view === "import") renderImport();
  else if (view === "video") renderVideo();
  else if (view === "event") loadEvent(eventPath[1], eventPath[2]);
  else if (view === "events") renderEvents();
  else if (view === "feedback") renderFeedback();
  else renderProfile();
}

function renderEvents() {
  const athleteId = profile?.athlete.id;
  const events = store.events.map((event) => {
    const scopedId = profile?.races.some((race) => race.event_id === event.id) ? athleteId : null;
    return `<li><a class="event-list-link" href="${eventLink(event.id, scopedId)}"><span class="event-icon">${icon("calendar")}</span><div><strong>${escape(event.name)}</strong><p class="meta"><span>${escape(eventDate(event))}</span><span>${escape(event.venue || event.location)}</span><span>${escape(event.races)} ${tr("races", "场比赛")}</span></p></div>${icon("arrow")}</a></li>`;
  }).join("");
  $main.innerHTML = `<div class="page-heading"><h1 class="page-title">${t("赛事")}</h1><a class="btn" href="#feedback/request">${tr("Request an event", "请求收录赛事")}</a></div>
    <section class="panel event-directory"><ul class="thin-list">${events || `<li>${t("尚无已导入赛事")}</li>`}</ul></section>
    ${store.admin ? `<section class="panel event-admin"><h2>${tr("Administration", "管理赛事")}</h2><div class="actions"><a class="btn primary" href="#import">${t("导入赛事")}</a><a class="btn" href="#video">${t("录像定位")}</a></div></section>` : ""}`;
}

async function loadEvent(id, athlete) {
  const hash = location.hash;
  $main.innerHTML = `<p class="notice" role="status">${tr("Loading event…", "正在读取赛事…")}</p>`;
  try {
    const data = await api(urlFor("/api/event", athlete ? { id, athlete } : { id }));
    if (view === "event" && location.hash === hash) renderEvent(data);
  } catch (err) {
    if (view === "event" && location.hash === hash)
      $main.innerHTML = `<p class="notice error">${escape(err.message)} <a href="#events">${tr("Back to events", "返回赛事")}</a></p>`;
  }
}

function renderEvent(data) {
  const { event, athlete, stats, standings, results, races } = data;
  const source = safeHref(event.url);
  $main.innerHTML = `<a href="#events" class="back-link">${tr("All events", "全部赛事")}</a>
    <header class="event-hero"><p class="meta"><span>${escape(eventDate(event))}</span><span>${escape(event.venue || event.location)}</span></p><h1>${escape(event.name)}</h1></header>
    <section aria-labelledby="event-athlete-title"><div class="section-head event-section-head"><div><h2 id="event-athlete-title">${athlete ? escape(displayName(athlete.name)) : tr("Athlete results", "选手成绩")}</h2>${athlete ? `<p class="meta"><span>${escape(athlete.club)}</span><span>${races.length} ${t("参赛记录")}</span></p>` : ""}</div><button class="btn small" id="event-athlete">${icon("users")}${athlete ? t("切换选手") : t("选择选手")}</button></div>
    ${athlete ? `<div id="event-personal-races"></div>` : `<p class="panel hint">${tr("Choose an athlete to see their results and race footage here.", "选择选手，在这里查看本站成绩和录像。")}</p>`}</section>
    <section aria-labelledby="standings-title"><div class="section-head"><h2 id="standings-title">${tr("Official standings", "官方总排名")}</h2></div><div class="panel" id="event-standings"></div></section>
    <section aria-labelledby="event-data-title"><div class="section-head"><h2 id="event-data-title">${tr("Event data", "赛事数据")}</h2></div><div class="panel event-stat-list">${metric(stats.athletes, tr("Athletes", "名选手"))}${metric(stats.races, tr("Races", "场比赛"))}${metric(stats.entries, tr("Race entries", "条参赛记录"))}</div>
    <div class="panel" id="event-results"></div></section>
    <div class="event-end">${eventDocuments(event)}<div class="actions">${source ? `<a href="${source}" target="_blank" rel="noopener">${t("Sportity 赛事目录")} ${icon("external")}</a>` : ""}<a href="#feedback/${Number(event.id)}">${tr("Send event feedback", "反馈此赛事")}</a></div></div>`;
  $("#event-athlete").onclick = () => openPicker(data);
  if (athlete) renderRaceList($("#event-personal-races"), races, athlete);
  renderStandings(event, athlete, standings);
  renderEventResults(event, results, stats, athlete);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderStandings(event, athlete, groups) {
  const panel = $("#event-standings");
  if (!groups.length) {
    panel.innerHTML = `<p class="hint">${tr("The imported documents contain individual race results. The event has no published overall standings in the index.", "现有资料收录了逐场成绩，索引中暂无官方总排名。")}</p>`;
    return;
  }
  const name = (category) => ({
    female: tr("Women", "女子"), male: tr("Men", "男子"), mixed: tr("Mixed", "混合"),
  })[category] || category;
  panel.innerHTML = `<div class="event-controls">${groups.length > 1
    ? `<label class="field"><span>${tr("Division", "组别")}</span><select id="standing-division">${groups.map((g, i) => `<option value="${i}">${escape(name(g.category))}</option>`).join("")}</select></label>` : ""}
    <label class="field"><span>${tr("Search standings", "查找排名")}</span><input type="search" id="standings-search" placeholder="${t("姓名或俱乐部")}"></label></div><div id="standings-table"></div>`;
  const division = $("#standing-division");
  const search = $("#standings-search");
  if (division && athlete) {
    const chosen = groups.findIndex((g) => g.standings.some((r) => Number(r.athlete_id) === Number(athlete.id)));
    if (chosen >= 0) division.value = String(chosen);
  }
  const update = () => {
    const group = groups[division ? Number(division.value) : 0];
    const terms = fold(search.value).split(" ").filter(Boolean);
    const rows = group.standings.filter((r) => terms.every((term) => fold(r.name + " " + r.club).includes(term)));
    const source = safeHref(group.standings[0]?.url);
    $("#standings-table").innerHTML = rows.length
      ? `<div class="table-scroll" role="region" aria-labelledby="standings-title" tabindex="0"><table class="event-table"><thead><tr><th scope="col">${tr("Place", "名次")}</th><th scope="col">${t("选手 / 俱乐部")}</th><th scope="col">${tr("Points", "积分")}</th></tr></thead><tbody>${rows.map((r) => {
          const display = escape(displayName(r.name));
          return `<tr${athlete && Number(r.athlete_id) === Number(athlete.id) ? ' class="event-selected"' : ""}><td class="rank">${escape(r.rank)}</td><td>${r.athlete_id ? `<a href="${eventLink(event.id, r.athlete_id)}">${display}</a>` : display}<small>${escape(r.club)}</small></td><td class="time">${escape(r.points)}</td></tr>`;
        }).join("")}</tbody></table></div>${source ? `<a class="event-source" href="${source}" target="_blank" rel="noopener">${tr("Official standings PDF", "官方排名 PDF")} ${icon("external")}</a>` : ""}`
      : `<p class="hint" role="status">${t("没有找到匹配的选手")}</p>`;
  };
  search.oninput = update;
  if (division) division.onchange = update;
  update();
}

function renderEventResults(event, results, stats, athlete) {
  const panel = $("#event-results");
  if (!results.length) {
    panel.innerHTML = `<p class="hint">${t("尚无参赛记录")}</p>`;
    return;
  }
  const options = (values, label) =>
    `<option value="">${label}</option>${values.map(([value, title]) => `<option value="${escape(value)}">${escape(title)}</option>`).join("")}`;
  panel.innerHTML = `<h3>${tr("Results by race", "逐场成绩")}</h3><div class="event-controls">
    ${stats.days.length > 1 ? `<label class="field"><span>${tr("Date", "日期")}</span><select id="event-date">${options(stats.days.map((d) => [d, dateLabel(d)]), t("全部日期"))}</select></label>` : ""}
    <label class="field"><span>${tr("Distance", "距离")}</span><select id="event-distance">${options(stats.distances.map((d) => [d, d + " m"]), t("全部距离"))}</select></label>
    <label class="field"><span>${tr("Race", "场次")}</span><select id="event-race"></select></label></div><div id="event-result-table"></div>`;
  const day = $("#event-date"), distance = $("#event-distance"), raceSelect = $("#event-race");
  const showResult = () => {
    const race = results.find((r) => String(r.id) === raceSelect.value);
    $("#event-result-table").innerHTML = race ? `<div class="table-scroll"><table class="event-table"><thead><tr><th scope="col">${tr("Place", "名次")}</th><th scope="col">${t("选手 / 俱乐部")}</th><th scope="col">${t("正式成绩")}</th></tr></thead><tbody>${race.entries.map((entry) => `<tr${athlete && Number(entry.athlete_id) === Number(athlete.id) ? ' class="event-selected"' : ""}><td class="rank">${escape(entry.place ?? "—")}</td><td><a href="${eventLink(event.id, entry.athlete_id)}">${escape(displayName(entry.name))}</a><small>${escape(entry.club)}</small></td><td>${formattedTime(entry)}</td></tr>`).join("")}</tbody></table></div><button type="button" class="btn small" id="event-race-detail">${tr("Race details and video", "比赛详情与录像")} ${icon("arrow")}</button>`
      : `<p class="hint" role="status">${t("没有符合筛选条件的比赛")}</p>`;
    if (race) $("#event-race-detail").onclick = () => showRace(race.id, null, athlete);
  };
  const filterRaces = () => {
    const previous = raceSelect.value;
    const filtered = results.filter((r) => (!day?.value || r.date === day.value) && (!distance.value || String(r.distance) === distance.value));
    raceSelect.innerHTML = filtered.map((r) => `<option value="${escape(r.id)}">${escape([r.label, r.distance + " m", roundName(r), dateLabel(r.date)].join(" · "))}</option>`).join("");
    if (filtered.some((r) => String(r.id) === previous)) raceSelect.value = previous;
    raceSelect.disabled = !filtered.length;
    showResult();
  };
  if (day) day.onchange = filterRaces;
  distance.onchange = filterRaces;
  raceSelect.onchange = showResult;
  filterRaces();
}

function renderFeedback() {
  const parts = location.hash.split("/");
  const request = parts[1] === "request";
  const sourceEvent = store.events.find((event) => String(event.id) === parts[1]);
  if (staticPreview) {
    const tracker = new URL("https://github.com/itsyien/oval-index-preview/issues/new");
    const title = request ? "Event request" : "Feedback";
    tracker.searchParams.set("title", title + (sourceEvent ? " · " + sourceEvent.name : ""));
    $main.innerHTML = `<h1 class="page-title">${t("反馈")}</h1><section class="panel feedback-panel"><p>${tr("Feedback and event requests go to the public GitHub issue tracker. A GitHub account is required.", "意见反馈和赛事收录请求会提交到公开的 GitHub 问题列表，需要登录 GitHub。")}</p><div class="actions"><a class="btn primary" href="${safeHref(tracker.href)}" target="_blank" rel="noopener">${request ? tr("Request an event", "请求收录赛事") : tr("Open feedback form", "打开反馈表单")} ${icon("external")}</a></div></section>`;
    return;
  }
  $main.innerHTML = `<h1 class="page-title">${t("反馈")}</h1><section class="panel feedback-panel"><form id="feedback-form">
    <label class="field"><span>${tr("Type", "类型")}</span><select name="kind"><option value="feedback">${tr("General feedback", "意见反馈")}</option><option value="event_request">${tr("Request an event", "请求收录赛事")}</option></select></label>
    ${sourceEvent ? `<p class="hint">${escape(sourceEvent.name)}</p>` : ""}
    <label class="field"><span>${tr("Message", "留言")}</span><textarea rows="4" name="message" maxlength="2000" required></textarea></label>
    <label class="field"><span>${tr("Link (optional)", "链接（可选）")}</span><input type="url" name="url" maxlength="1000" placeholder="https://"></label>
    <button class="btn primary" type="submit">${tr("Send to administrator", "提交给管理员")}</button><p class="error" role="status"></p>
  </form></section>${store.admin ? `<div class="section-head"><h2>${tr("Review inbox", "反馈收件箱")}</h2></div><section class="panel" id="feedback-inbox"></section>` : ""}`;
  const form = $("#feedback-form");
  const kind = form.elements.kind;
  kind.value = request ? "event_request" : "feedback";
  function updateHint() {
    form.elements.message.placeholder = kind.value === "event_request"
      ? tr("Event name and dates", "赛事名称和日期")
      : tr("What would you like us to know?", "你想反馈什么？");
    form.elements.url.placeholder = kind.value === "event_request"
      ? "https://webapp.sportity.com/event/…" : "https://";
  }
  kind.onchange = updateHint;
  updateHint();
  form.onsubmit = async (event) => {
    event.preventDefault();
    const submit = $("button[type=submit]", form);
    submit.disabled = true;
    $(".error", form).textContent = "";
    try {
      await post("/api/feedback", {
        kind: kind.value, message: form.elements.message.value.trim(),
        url: form.elements.url.value.trim() || undefined, event_id: sourceEvent?.id,
      });
      toast(tr("Sent to the administrator", "已发送给管理员"));
      form.elements.message.value = "";
      form.elements.url.value = "";
      if (store.admin) loadInbox();
    } catch (err) {
      laterError($(".error", form), err);
    } finally {
      submit.disabled = false;
    }
  };
  if (store.admin) loadInbox();
}

async function loadInbox() {
  const inbox = $("#feedback-inbox");
  if (!inbox) return;
  try {
    const { feedback } = await api("/api/feedback");
    if (!inbox.isConnected) return;
    const rows = (items) => `<ul class="thin-list feedback-list">${items.map((item, i) => {
      const link = safeHref(item.url);
      const open = item.status === "open";
      const race = item.kind === "race_report";
      const title = race
        ? (item.reason === "wrong_race" ? tr("Wrong race", "录像错场") : tr("Wrong athlete", "选手归属有误"))
        : item.kind === "event_request" ? tr("Event request", "赛事收录请求") : t("反馈");
      const created = new Date(item.created);
      return `<li><div class="job-line"><strong>${title}</strong><small>${escape(Number.isNaN(+created) ? item.created : created.toLocaleDateString(language))}</small></div>
        ${item.event_name ? `<p class="hint">${escape([item.event_name, item.race_label, displayName(item.athlete_name)].filter(Boolean).join(" · "))}</p>` : ""}
        ${item.message ? `<p class="feedback-message">${escape(item.message)}</p>` : ""}
        <div class="actions">${link ? `<a href="${link}" target="_blank" rel="noopener">${tr("Open link", "打开链接")} ${icon("external")}</a>` : ""}
        ${race ? `<button class="btn small" data-inbox-race="${i}">${tr("Open race", "打开比赛")}</button>` : ""}
        ${open || !race ? `<button class="btn small" data-inbox-status="${i}">${open ? tr("Mark reviewed", "标记已复核") : tr("Reopen", "重新打开")}</button>` : ""}</div><p class="error" role="status"></p></li>`;
    }).join("")}</ul>`;
    const open = feedback.filter((f) => f.status === "open");
    const closed = feedback.filter((f) => f.status === "closed");
    inbox.innerHTML = (open.length ? rows(open) : `<p class="hint">${tr("No pending feedback.", "暂无待处理反馈。")}</p>`)
      + (closed.length ? `<details id="reviewed-feedback"><summary>${tr("Reviewed", "已复核")} (${closed.length})</summary>${rows(closed)}</details>` : "");
    for (const [container, items] of [[inbox.firstElementChild, open], [$("#reviewed-feedback", inbox), closed]]) {
      if (!container) continue;
      container.querySelectorAll("[data-inbox-race]").forEach((button) => {
        const entry = items[Number(button.dataset.inboxRace)];
        button.onclick = () => showRace(entry.race_id, null, { id: entry.athlete_id, name: entry.athlete_name });
      });
      container.querySelectorAll("[data-inbox-status]").forEach((button) => {
        const entry = items[Number(button.dataset.inboxStatus)];
        button.onclick = async () => {
          button.disabled = true;
          try {
            if (entry.kind === "race_report") await post("/api/report/resolve", { id: entry.id });
            else await post("/api/feedback/review", { id: entry.id, status: entry.status === "open" ? "closed" : "open" });
            await loadInbox();
          } catch (err) {
            laterError($(".error", button.closest("li")), err);
            button.disabled = false;
          }
        };
      });
    }
  } catch (err) {
    inbox.innerHTML = `<p class="error" role="status">${escape(err.message)}</p>`;
  }
}

window.addEventListener("hashchange", route);
async function init() {
  try {
    await refresh();
    route();
  } catch (err) {
    $main.innerHTML = `<div class="notice error">${escape(err.message)} <button class="btn" id="reload">${t("重新读取档案")}</button></div>`;
    $("#reload").onclick = init;
  }
}

function stamp(n) {
  if (n == null || n === "") return "";
  const ms = Math.round(Number(n) * 1000);
  if (!Number.isFinite(ms) || ms < 0) return "";
  const seconds = Math.floor(ms / 1000),
    fraction = ms % 1000;
  return `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}${fraction ? "." + String(fraction).padStart(3, "0").replace(/0+$/, "") : ""}`;
}
function readStamp(value) {
  const s = value.trim();
  if (!s) return null;
  if (/^\d+(?:\.\d+)?$/.test(s)) return Number(s);
  if (!/^(?:\d+:)?\d{1,2}:[0-5]\d(?:\.\d+)?$/.test(s)) return NaN;
  const parts = s.split(":").map(Number);
  if (parts.length === 3 && parts[1] >= 60) return NaN;
  return parts.reduce((n, v) => n * 60 + v, 0);
}
function youtubeId(value) {
  const s = String(value || "").trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return "";
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
              u.hostname,
            )
          ? u.pathname === "/watch"
            ? u.searchParams.get("v")
            : /^\/(live|embed)\//.test(u.pathname)
              ? u.pathname.split("/").pop()
              : ""
          : "";
    return /^[\w-]{11}$/.test(id || "") ? id : "";
  } catch {
    return "";
  }
}
const ytUrl = (id, start = 0) =>
  `https://www.youtube.com/watch?v=${encodeURIComponent(id)}&t=${Math.max(0, Math.floor(start))}s`;
async function showRace(id, scan = null, athlete = profile?.athlete) {
  const request = ++currentDetail;
  openDialog(
    t("比赛详情"),
    `<p class="hint">${t("正在读取同场成绩与原始资料…")}</p>`,
  );
  try {
    const detail = await api(
      urlFor("/api/race", { id, athlete_id: athlete?.id || "" }),
    );
    if (!dialog.open || request !== currentDetail) return;
    renderRace(detail, scan, athlete);
  } catch (err) {
    if (dialog.open && request === currentDetail)
      body.innerHTML = `<p class="error">${escape(err.message)}</p>`;
  }
}
function renderRace(detail, scan, active) {
  const r = detail.race,
    c = detail.clip || r.clip || { status: "pending" },
    entries = detail.entries || [],
    sources = detail.sources || [],
    schedule = detail.schedule || r.schedule || [],
    reports = detail.reports || r.reports || [];
  const admin = store.admin === true;
  const candidates =
    scan?.candidates ?? r.auto_candidates ?? detail.auto_candidates ?? [];
  const ownEntry = entries.find(
    (e) => String(e.athlete_id) === String(active?.id),
  );
  const playbackRace = {
    ...r,
    status: ownEntry?.status,
    reports: reports.filter((issue) => String(issue.athlete_id) === String(active?.id)),
  };
  const event = eventOf(r),
    id = youtubeId(c.youtube_id || r.youtube_id || event.youtube_id);
  const state = Object.hasOwn(statuses, c.status) ? c.status : "pending";
  const reopen = () => showRace(r.id, scan, active);
  const playable = (state === "confirmed" || state === "candidate") && id && c.start != null && c.end > c.start;
  const method = { manual: t("人工核对"), human: t("人工核对"), machine: t("机器候选"), manual_visual: t("人工画面核对"), visual_review: t("人工画面核对") }[c.method] || c.method;
  const fieldStatus = Object.entries(statuses)
    .map(
      ([v, t]) =>
        `<option value="${v}"${v === state ? " selected" : ""}>${t}</option>`,
    )
    .join("");
  openDialog(
    t("比赛详情"),
    `<div class="race-banner">${raceKey(playbackRace)}<p class="meta"><span>${escape(titleOf(r))}</span><span>${escape(dateLabel(r.date))}</span></p></div>
  <section class="detail-section race-video"><div class="video-head"><h3>${t("比赛录像")}</h3>${badge(state)}</div>
  <div class="actions"${!playable && !candidates.length && !id ? " hidden" : ""}>
    ${playable ? `<button type="button" id="play-detail" class="btn primary">${icon("play")}${state === "candidate" ? t("预览候选片段") : dns(ownEntry) ? t("观看同场录像") : t("观看此场录像")}</button>` : ""}
    ${!playable && candidates.length ? `<button type="button" class="btn primary" id="jump-candidates">${tr("Choose a candidate", "选择候选片段")}</button>` : ""}
    ${id ? `<a class="race-recording-link" href="${escape(ytUrl(id))}" target="_blank" rel="noopener">${tr("Full recording", "完整录像")} ${icon("external")}</a>` : ""}
  </div>
  ${playable ? `<p class="race-video-time hint">${escape(stamp(c.start))} – ${escape(stamp(c.end))}</p>` : ""}
  ${dns(ownEntry) ? `<p class="hint">${t("官方成绩列为 DNS（未起跑）。这里可以查看同场录像，该条记录不参与个人连播。")}</p>` : ""}
  </section>
  <section class="detail-section race-results"><h3>${t("同场选手")}</h3><div class="table-scroll" tabindex="0" role="region" aria-label="${t("同场选手")}"><table><thead><tr><th scope="col">${t("名次")}</th><th scope="col">${t("选手 / 俱乐部")}</th><th scope="col">${t("正式成绩")}</th><th scope="col">${t("起跑位")}</th><th scope="col">${t("赛事编号")}</th></tr></thead><tbody>${entries.map((e) => `<tr class="${String(e.athlete_id) === String(active?.id) ? "active" : ""}"><td>${escape(e.place ?? "—")}</td><td><strong>${escape(displayName(e.name))}</strong><span class="sub">${escape(e.club || "")}</span></td><td>${formattedTime(e)}</td><td>${escape(e.start_position ?? "—")}</td><td>${escape(e.bib ?? "—")}</td></tr>`).join("")}</tbody></table></div></section>
  <div class="race-reference">
  ${ownEntry && !staticPreview ? `<details><summary>${t("报告匹配问题")}</summary><form id="report-form"><label class="field"><span>${t("问题类型")}</span><select name="reason"><option value="wrong_race">${t("录像匹配错场")}</option><option value="wrong_athlete">${t("不是该选手的比赛")}</option></select></label><label class="field"><span>${t("复核说明")}</span><input name="note" required maxlength="1000"></label><button class="btn" type="submit">${t("提交问题")}</button><p class="error" role="status"></p></form></details>` : ""}
  ${candidates.length ? `<details id="race-candidates"><summary>${tr("Automatic candidates", "机器候选")} (${candidates.length})${scan ? " · " + tr("Job", "任务") + " #" + escape(scan.job) : ""}</summary><ul class="thin-list">${candidates.map((item, i) => `<li><strong>${escape(stamp(item.start))} – ${escape(stamp(item.end))}</strong> · ${escape(item.youtube_id)}${leadInNote(item) ? `<p class="hint">${leadInNote(item)}</p>` : ""}${candidateCues(item)}<div class="actions"><button type="button" class="btn small" data-preview="${i}">${t("预览候选片段")}</button>${admin ? `<button type="button" class="btn small" data-use="${i}">${tr("Copy to review form", "填入校正表单")}</button>` : ""}</div>${item.evidence || Number.isFinite(item.anchor) ? `<details><summary>${tr("Matching evidence", "匹配依据")}</summary>${item.evidence ? `<p class="hint">${escape(serviceText(item.evidence))}</p>` : ""}${Number.isFinite(item.anchor) ? `<a href="${escape(ytUrl(item.youtube_id, item.anchor))}" target="_blank" rel="noopener">${tr("Matching frame", "匹配画面")} · ${escape(stamp(item.anchor))} ${icon("external")}</a>` : ""}</details>` : ""}</li>`).join("")}</ul></details>` : ""}
  ${admin ? `<details><summary>${t("校正录像位置与状态")}</summary><form id="clip-form"><label class="field"><span>${t("录像状态")}</span><select name="status">${fieldStatus}</select></label><div id="clip-times"><label class="field"><span>${t("YouTube 录像 ID 或链接")}</span><input name="video" value="${escape(id)}" placeholder="${t("粘贴赛事方录像链接")}"></label>
  <div class="times"><label class="field"><span>${t("片段入点")}</span><input name="start" value="${escape(stamp(c.start))}" placeholder="${t("时:分:秒")}"></label><label class="field"><span>${t("片段出点")}</span><input name="end" value="${escape(stamp(c.end))}" placeholder="${t("时:分:秒")}"></label></div><p class="hint">${t("填写原录像时间轴上的位置，可精确到小数秒。入点可放在起跑前约 10 秒，出点留出赛后画面。")}</p></div>
  <label class="field"><span>${t("匹配依据或校正说明")}</span><textarea name="evidence" maxlength="1500" placeholder="${t("例如画面中的场次、名单或终点成绩")}">${escape(language === "en" && c.evidence_en ? c.evidence_en : c.evidence || "")}</textarea></label>
  <div class="actions"><button type="submit" class="btn primary">${t("保存校正")}</button><button type="button" class="btn" id="test-clip">${t("核对原录像入点")}</button></div><p class="error" role="status"></p></form></details>` : ""}
  ${admin && reports.length ? `<details><summary>${t("已提交的问题")} (${reports.length})</summary><ul class="thin-list">${reports.map((rep) => `<li>${rep.reason === "wrong_race" ? t("录像匹配错场") : `${t("选手归属 ·")} ` + escape(displayName(entries.find((e) => String(e.athlete_id) === String(rep.athlete_id))?.name))} · ${escape(rep.note)}<div class="review-action">${rep.resolved_at ? `<span class="hint">${t("已复核")}</span>` : `<button type="button" class="btn small" data-resolve="${escape(rep.id)}">${t("标记已复核")}</button><span class="error" role="status"></span>`}</div></li>`).join("")}</ul></details>` : ""}
  <details><summary>${tr("Sources and matching evidence", "来源与匹配依据")}</summary>
    ${c.evidence ? `<p class="hint">${t("定位依据 ·")} ${escape(language === "en" && c.evidence_en ? c.evidence_en : serviceText(c.evidence))}</p>` : ""}
    ${method ? `<p class="hint">${t("确认方式 ·")} ${escape(method)}</p>` : ""}
    ${schedule.length ? `<h4>${t("计划赛程")}</h4><p class="hint">${t("赛事当地的批次计划钟点。实际起跑和录像位置另行核对。")}</p><ul class="thin-list">${schedule.map((s) => `<li><strong>${escape(s.local_time)}</strong> · ${escape([s.group_name, s.round_raw].filter(Boolean).join(" / "))} ${s.url ? ` <a class="source-link" href="${safeHref(s.url)}" target="_blank" rel="noopener">${t("赛程 PDF")} ${icon("external")}</a>` : ""}</li>`).join("")}</ul>` : ""}
    <h4>${t("原始资料")}</h4><ul class="thin-list">${sources.map((s) => `<li><a class="source-link" href="${safeHref(s.url)}" target="_blank" rel="noopener">${icon("file")}${escape(s.title || s.type || t("原始 PDF"))}${s.page ? ` ${t("· 第")} ` + escape(s.page) + ` ${t("页")}` : ""}</a>${s.original_url ? ` <a class="small-source" target="_blank" rel="noopener" href="${safeHref(s.original_url)}" aria-label="${t("在 Sportity 打开")} ${escape(s.title)}">${icon("external")}</a>` : ""}${s.round_raw || s.evidence ? `<details><summary>${t("查看解析依据")}</summary><p class="hint">${escape([s.round_raw, s.evidence].filter(Boolean).join(" · "))}</p></details>` : ""}</li>`).join("") || `<li>${t("暂无关联文件")}</li>`}</ul>
  </details>
  </div>`,
  );
  if (playable)
    $("#play-detail").onclick = () => openPlayback(
      [{ ...playbackRace, clip: c }],
      reopen,
      state === "candidate",
    );
  if ($("#jump-candidates")) $("#jump-candidates").onclick = () => {
    const list = $("#race-candidates");
    list.open = true;
    $("summary", list).focus();
  };
  body
    .querySelectorAll("[data-preview]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          openPlayback(
            [{ ...playbackRace, clip: candidates[Number(b.dataset.preview)] }],
            reopen,
            true,
          )),
    );
  const f = $("#clip-form");
  if (f) bindClipEditor(f, r, id, candidates, reopen);
  body.querySelectorAll("[data-resolve]").forEach((button) => {
    button.onclick = async () => {
      button.disabled = true;
      try {
        await post("/api/report/resolve", {
          id: Number(button.dataset.resolve),
        });
        await reopen();
        toast(t("问题已标记为已复核"));
      } catch (err) {
        laterError(button.nextElementSibling, err);
        button.disabled = false;
      }
    };
  });
  const report = $("#report-form");
  if (!report) return;
  report.onsubmit = async (e) => {
    e.preventDefault();
    const b = $("button[type=submit]", report);
    $(".error", report).textContent = "";
    b.disabled = true;
    try {
      await post("/api/report", {
        race_id: r.id,
        athlete_id: active.id,
        reason: report.reason.value,
        note: report.note.value.trim(),
      });
      report.reset();
      report.closest("details").open = false;
      toast(t("已提交复核"));
    } catch (err) {
      laterError($(".error", report), err);
    } finally {
      b.disabled = false;
    }
  };
}
function bindClipEditor(f, race, id, candidates, reopen) {
  function updateFields() {
    const timed = ["confirmed", "candidate"].includes(f.elements.status.value);
    $("#clip-times").hidden = !timed;
    $("#test-clip").hidden = !timed;
    f.evidence.required = f.elements.status.value !== "pending";
  }
  f.elements.status.onchange = updateFields;
  updateFields();
  body.querySelectorAll("[data-use]").forEach(
    (b) =>
      (b.onclick = () => {
        const item = candidates[Number(b.dataset.use)];
        f.elements.status.value = "candidate";
        f.elements.video.value = item.youtube_id;
        f.elements.start.value = stamp(item.start);
        f.elements.end.value = stamp(item.end);
        f.elements.evidence.value = item.evidence || "";
        f.closest("details").open = true;
        updateFields();
        f.elements.status.focus();
        f.scrollIntoView({ block: "center" });
      }),
  );
  function readClip() {
    const status = f.elements.status.value,
      timed = ["confirmed", "candidate"].includes(status),
      vid = youtubeId(f.video.value);
    const start = timed ? readStamp(f.start.value) : null,
      end = timed ? readStamp(f.end.value) : null;
    if (
      timed &&
      (!vid ||
        start == null ||
        end == null ||
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start)
    )
      throw Error(
        t("请填写有效的 YouTube 链接或 ID，以及先后顺序正确的录像入点、出点。"),
      );
    return {
      race_id: race.id,
      status,
      youtube_id: vid || id || "",
      start,
      end,
      evidence: f.evidence.value.trim(),
    };
  }
  $("#test-clip").onclick = () => {
    try {
      const preview = readClip();
      window.open(
        ytUrl(preview.youtube_id, preview.start),
        "_blank",
        "noopener",
      );
      $(".error", f).textContent = t(
        "已打开原录像入点，请在播放器内核对出点。",
      );
    } catch (err) {
      laterError($(".error", f), err);
    }
  };
  f.onsubmit = async (e) => {
    e.preventDefault();
    const b = $("button[type=submit]", f);
    b.disabled = true;
    try {
      await post("/api/clip", readClip());
      if (profile?.athlete?.id) await loadProfile(profile.athlete.id);
      if (view === "event") await loadEvent(race.event_id, location.hash.split("/")[2]);
      await reopen();
      toast(t("录像校正已保存"));
    } catch (err) {
      laterError($(".error", f), err);
      b.disabled = false;
    }
  };
}
let playerAPI;
function youtubeReady() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!playerAPI)
    playerAPI = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      const failed = () => {
        clearTimeout(timeout);
        script.remove();
        playerAPI = null;
        reject(Error(t("当前网络未能载入 YouTube 播放器。")));
      };
      const timeout = setTimeout(failed, 12000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        resolve(window.YT);
      };
      script.onerror = failed;
      document.head.append(script);
    });
  return playerAPI;
}
function openPlayback(queue, back, candidate = false) {
  if (!queue.length) return;
  let player = null,
    index = 0,
    alive = true,
    played = false;
  openDialog(
    candidate
      ? t("预览候选片段")
      : queue.length > 1
        ? t("连续观看比赛")
        : t("观看比赛录像"),
    `<h3 id="clip-title"></h3><p class="meta" id="clip-meta"></p>${candidate ? `<p class="hint candidate-note">${tr("This clip is awaiting visual confirmation.", "此候选片段的场次和起止仍待核对。")} ${leadInNote(queue[0].clip)}</p>` : ""}${dns(queue[0]) ? `<p class="hint">${t("官方成绩列为 DNS（未起跑）。这里可以查看同场录像，该条记录不参与个人连播。")}</p>` : disputed(queue[0]) ? `<p class="hint">${tr("The entry is under review. This video shows the race.", "选手归属待复核，此片段仅供查看同场录像。")}</p>` : ""}<div class="player-box"><div id="yt-player">${t("正在载入播放器…")}</div></div><p id="player-status" class="hint" role="status"></p><div class="player-tools"><a id="external-player" class="btn" target="_blank" rel="noopener">${t("在 YouTube 打开")} ${icon("external")}</a><div class="controls">${back ? `<button class="btn" id="back-detail">${t("返回详情")}</button>` : ""}${queue.length > 1 ? `<button class="btn" id="prev-clip">${t("上一场")}</button><button class="btn" id="next-clip">${t("下一场")}</button>` : ""}</div></div>`,
  );
  playerDestroy = () => {
    alive = false;
    if (player) {
      try {
        player.destroy();
      } catch {}
      player = null;
    }
  };
  function update() {
    const r = queue[index],
      c = r.clip;
    played = false;
    $("#clip-title").textContent =
      `${r.label} · ${r.distance} m ${roundName(r)}`;
    $("#clip-meta").textContent =
      `${titleOf(r)} · ${dateLabel(r.date)}　${stamp(c.start)} – ${stamp(c.end)}${queue.length > 1 ? `　${index + 1} / ${queue.length}` : ""}`;
    $("#external-player").href = ytUrl(c.youtube_id, c.start);
    $("#player-status").textContent = "";
    if ($("#prev-clip")) {
      $("#prev-clip").disabled = !index;
      $("#next-clip").disabled = index >= queue.length - 1;
    }
    if (player?.loadVideoById)
      player.loadVideoById({
        videoId: c.youtube_id,
        startSeconds: Number(c.start),
        endSeconds: Number(c.end),
      });
  }
  update();
  if (back) $("#back-detail").onclick = back;
  if ($("#next-clip")) {
    $("#next-clip").onclick = () => {
      if (index < queue.length - 1) {
        index++;
        update();
      }
    };
    $("#prev-clip").onclick = () => {
      if (index > 0) {
        index--;
        update();
      }
    };
  }
  youtubeReady()
    .then((YT) => {
      if (!alive) return;
      player = new YT.Player("yt-player", {
        width: "100%",
        height: "100%",
        playerVars: {
          hl: language,
          origin: location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (alive) update();
          },
          onStateChange: (e) => {
            if (!alive) return;
            if (e.data === YT.PlayerState.PLAYING) {
              played = true;
              return;
            }
            // The old video may emit another ENDED while the next interval is loading.
            if (e.data !== YT.PlayerState.ENDED || !played) return;
            played = false;
            if (index < queue.length - 1) {
              index++;
              update();
            } else $("#player-status").textContent = t("已播放到片段末尾。");
          },
          onError: (e) => {
            if (alive)
              $("#player-status").textContent =
                `${t("嵌入播放器无法播放（YouTube")} ${e.data}${t("），可打开原录像查看。")}`;
          },
          onAutoplayBlocked: () => {
            if (alive)
              $("#player-status").textContent = t("请点击播放器中的播放键。");
          },
        },
      });
    })
    .catch((err) => {
      if (alive) {
        $("#player-status").textContent = err.message;
        $(".player-box").textContent = t("嵌入播放器未载入");
      }
    });
}

const jobNames = {
  queued: t("排队中"),
  prepared: t("已解析"),
  running: t("导入中"),
  done: t("已完成"),
  partial: t("部分完成"),
  failed: t("导入失败"),
};

function eventDocuments(event) {
  const documents = (store.documents || []).filter(
    (d) => String(d.event_id) === String(event.id),
  );
  const current = documents.filter((d) => d.active),
    previous = documents.filter((d) => !d.active);
  const types = {
    summary: t("全场成绩"),
    ranking: t("选手排名"),
    schedule: t("赛程"),
    start: t("出场表"),
    result: t("分组成绩"),
  };
  const priority = { summary: 0, schedule: 1, ranking: 2, result: 3, start: 4 };
  function files(docs, history = false) {
    docs.sort(
      (a, b) =>
        (priority[a.type] ?? 8) - (priority[b.type] ?? 8) ||
        a.title.localeCompare(b.title, "en", { numeric: true }),
    );
    return `<ul class="file-list">${docs.map((d) => `<li><span class="doc-type">${escape(types[d.type] || t("赛事资料"))}</span><div><a class="source-link" href="${safeHref(d.url)}" target="_blank" rel="noopener">${escape(d.title)}</a>${history ? `<small class="hint">${t("抓取于")} ${escape(d.fetched_at)} · ${escape(d.sha256?.slice(0, 10))}</small>` : ""}</div>${d.original_url ? `<a class="source-origin" href="${safeHref(d.original_url)}" target="_blank" rel="noopener" aria-label="${t("打开")} ${escape(d.title)} ${t("的官方来源")}">${icon("external")}</a>` : ""}</li>`).join("")}</ul>`;
  }
  return `<details class="inset file-index"><summary>${t("已导入原件（")}${current.length} ${t("份）")}</summary>${current.length ? files(current) : `<p class="hint">${t("暂无当前版本的文件。")}</p>`}${previous.length ? `<details><summary>${t("较早版本（")}${previous.length} ${t("份）")}</summary>${files(previous, true)}</details>` : ""}</details>`;
}

function documentShelf(event) {
  return `<li><div class="entry-title"><a href="${eventLink(event.id)}">${escape(event.name)}</a></div><p class="meta"><span>${escape(eventDate(event))}</span>${event.venue || event.location ? `<span>${escape(event.venue || event.location)}</span>` : ""}</p>${event.url ? `<a class="linklike" href="${safeHref(event.url)}" target="_blank" rel="noopener">${t("Sportity 赛事目录")} ${icon("external")}</a>` : ""}
  ${eventDocuments(event)}</li>`;
}

function renderImport() {
  clearTimeout(jobTimer);
  $main.innerHTML = `<a href="#events" class="back-link">${tr("All events", "全部赛事")}</a><h1 class="page-title">${t("导入赛事")}</h1><div class="import-grid"><section class="panel"><h2>${t("从 Sportity 导入")}</h2><form id="source-form"><label class="field"><span>${t("公开赛事链接或频道码")}</span><input id="source" name="source" required value="${escape(store.target_url || store.events[0]?.url || "")}" placeholder="${t("例如 2627OOST")}"></label><button class="btn primary" type="submit" id="source-submit">${t("导入赛事")}</button><p class="error" role="status"></p></form><div id="found-events"></div></section><section class="panel"><h2>${t("补充原始 PDF")}</h2>${store.events.length ? `<form id="upload-form"><label class="field"><span>${t("所属赛事")}</span><select name="event">${store.events.map((e) => `<option value="${escape(e.id)}">${escape(e.name)} · ${escape(eventDate(e))}</option>`).join("")}</select></label><label class="field"><span>${t("成绩、赛程或出场表")}</span><span class="file-choice"><span class="btn small">${tr("Choose PDF", "选择 PDF")}</span><span id="filename">${tr("No file selected", "未选择文件")}</span><input name="pdf" type="file" accept=".pdf,application/pdf" required></span></label><button class="btn" type="submit">${t("上传并解析")}</button><p class="error" role="status"></p></form>` : `<p class="hint">${t("请先从 Sportity 导入所属赛事，再添加 PDF。")}</p>`}</section></div>
  <div class="section-head"><h2>${t("已导入赛事")}</h2></div><section class="panel"><ul class="thin-list">${store.events.map(documentShelf).join("") || `<li>${t("尚无已导入赛事")}</li>`}</ul></section>
  <div class="section-head"><h2>${t("导入任务")}</h2></div><section class="panel" aria-label="${t("导入任务")}"><div id="jobs"></div></section>
  ${(store.issues || []).length ? `<details class="panel"><summary>${t("待复核记录（")}${store.issues.length}${t("）")}</summary><ul class="thin-list">${store.issues.map((i) => `<li><strong>${escape(serviceText(i.reason))}</strong><p class="hint">${escape(i.evidence)}</p>${i.url ? `<a class="linklike" target="_blank" rel="noopener" href="${safeHref(i.url)}">${escape(i.title || t("查看来源"))} ${icon("external")}</a>` : ""}</li>`).join("")}</ul></details>` : ""}`;
  const sf = $("#source-form");
  function isEvent() {
    return /\/event\//i.test(sf.source.value.trim());
  }
  sf.source.oninput = () => {
    $("#source-submit").textContent = isEvent()
      ? t("导入赛事")
      : t("查找频道赛事");
  };
  sf.source.oninput();
  sf.onsubmit = async (e) => {
    e.preventDefault();
    const b = $("#source-submit"),
      out = $("#found-events"),
      error = $(".error", sf);
    b.disabled = true;
    b.textContent = isEvent() ? t("正在建立任务…") : t("正在读取频道…");
    error.textContent = "";
    out.innerHTML = "";
    try {
      if (isEvent()) {
        await startJob(() =>
          post("/api/import", { url: sf.source.value.trim() }),
        );
      } else {
        const { events } = await post("/api/discover", {
          channel: sf.source.value.trim(),
        });
        if (!events?.length) {
          out.innerHTML = `<p class="hint">${t("此频道未发现可选的赛事目录。")}</p>`;
          return;
        }
        out.innerHTML = `<div class="detail-section"><h3>${t("选择赛事目录")}</h3>${events.map((event, j) => `<button class="folder" type="button" data-folder="${j}"><span>${escape(event.name || event.title)}</span>${icon("arrow")}</button>`).join("")}</div>`;
        out.querySelectorAll("[data-folder]").forEach(
          (btn) =>
            (btn.onclick = async () => {
              btn.disabled = true;
              try {
                await startJob(() =>
                  post("/api/import", { url: events[+btn.dataset.folder].url }),
                );
              } catch (err) {
                laterError(error, err);
              } finally {
                btn.disabled = false;
              }
            }),
        );
      }
    } catch (err) {
      laterError(error, err);
    } finally {
      b.disabled = false;
      sf.source.oninput();
    }
  };
  const uf = $("#upload-form");
  if (uf)
    uf.pdf.onchange = () =>
      ($("#filename").textContent =
        uf.pdf.files[0]?.name || tr("No file selected", "未选择文件"));
  if (uf)
    uf.onsubmit = async (e) => {
      e.preventDefault();
      const b = $("button[type=submit]", uf),
        file = uf.pdf.files[0];
      if (!file) return;
      b.disabled = true;
      $(".error", uf).textContent = "";
      try {
        await startJob(() =>
          api(
            urlFor("/api/upload", {
              event_id: uf.elements.event.value,
              filename: file.name,
            }),
            {
              method: "POST",
              headers: { "Content-Type": "application/pdf" },
              body: file,
            },
          ),
        );
        uf.pdf.value = "";
        uf.pdf.onchange();
      } catch (err) {
        laterError($(".error", uf), err);
      } finally {
        b.disabled = false;
      }
    };
  renderJobs();
  pollJobs();
}
async function startJob(start) {
  const res = await start(),
    id = res.job_id ?? res.id;
  if (id == null) throw Error(t("服务未返回导入任务编号。"));
  const job = await api(urlFor("/api/job", { id }));
  store.jobs = [job, ...store.jobs.filter((j) => String(j.id) !== String(id))];
  renderJobs();
  toast(t("已建立导入任务"));
  if (["queued", "running"].includes(job.status)) pollJobs();
  else {
    await refresh();
    if (view === "import") renderImport();
  }
}
function renderJobs() {
  const jobs = $("#jobs");
  if (!jobs) return;
  const open = new Set(
    [...jobs.querySelectorAll("details[open]")].map((d) => d.dataset.job),
  );
  jobs.innerHTML =
    store.jobs
      .map((j) => {
        const done = j.done ?? j.completed ?? 0,
          total = j.total || 0,
          title =
            store.events.find((e) => String(e.id) === String(j.event_id))
              ?.name || t("Sportity 赛事资料");
        return `<div class="job"><div class="job-line"><strong>${escape(title)}</strong><small>${t("任务 #")}${escape(j.id)}</small></div><div class="meta"><span>${escape(jobNames[j.status] || j.status)}</span><span>${escape(done)} / ${escape(total)} ${t("份已完成")}</span></div>${["running", "queued"].includes(j.status) ? `<progress max="${total || 1}"${total ? ` value="${done}"` : ""} aria-label="${t("下载与解析进度")}"></progress><p class="hint">${escape(serviceText(j.current) || t("等待读取目录"))}</p>` : ""}
    ${j.error ? `<p class="error">${escape(serviceText(j.error))}</p>` : ""}${["partial", "failed"].includes(j.status) ? `<button class="btn small" data-retry="${escape(j.id)}">${t("重试失败项目")}</button><p class="error" role="status"></p>` : ""}
    ${j.items?.length ? `<details data-job="${escape(j.id)}" ${open.has(String(j.id)) ? "open" : ""}><summary>${t("文件明细")}</summary><ul>${j.items.map((t) => `<li>${escape(t.title)} · ${escape(jobNames[t.status] || t.status)}${t.error ? `<p class="error">${escape(serviceText(t.error))}</p>` : ""}</li>`).join("")}</ul></details>` : ""}</div>`;
      })
      .join("") || `<p class="hint">${t("尚无导入任务。")}</p>`;
  jobs.querySelectorAll("[data-retry]").forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true;
        try {
          await startJob(() =>
            post("/api/retry", { job_id: +b.dataset.retry }),
          );
        } catch (err) {
          laterError(b.nextElementSibling, err);
        } finally {
          b.disabled = false;
        }
      }),
  );
}
function pollJobs() {
  clearTimeout(jobTimer);
  const live = store.jobs.filter((j) =>
    ["running", "queued"].includes(j.status),
  );
  if (view !== "import" || !live.length) return;
  jobTimer = setTimeout(async () => {
    try {
      const fresh = await Promise.all(
        live.map((j) => api(urlFor("/api/job", { id: j.id }))),
      );
      const ended = fresh.some(
        (j) => !["running", "queued"].includes(j.status),
      );
      const updates = new Map(fresh.map((j) => [j.id, j]));
      store.jobs = store.jobs.map((j) => updates.get(j.id) || j);
      if (ended) {
        await refresh();
        if (view === "import") {
          renderImport();
          toast(t("导入任务已更新"));
        }
        return;
      }
      if (view === "import") renderJobs();
    } catch (err) {
      if (view === "import") {
        const jobs = $("#jobs");
        if (jobs && !$(".poll-error", jobs))
          jobs.insertAdjacentHTML(
            "beforeend",
            `<p class="error poll-error">${escape(err.message)}${t("，稍后重试。")}</p>`,
          );
      }
    }
    pollJobs();
  }, 1200);
}

$("#settings").title = t("系统设置");
$("#settings").onclick = () => {
  const adminAction = store.admin
    ? `<p class="hint">${tr("Signed in as administrator.", "已登录为管理员。")}</p><button class="btn" id="admin-logout">${tr("Sign out", "退出登录")}</button>`
    : store.admin_available
      ? store.admin_configured
        ? `<form id="admin-login"><label class="field"><span>${tr("Administrator password", "管理员密码")}</span><input type="password" name="password" autocomplete="current-password" maxlength="256" required></label><button class="btn" type="submit">${tr("Sign in", "登录")}</button><p class="error" role="status"></p></form>`
        : `<p class="hint">${tr("Set your administrator password from the local setup command, then refresh this page.", "完成本机密码设置后，刷新本页。")}</p><code class="setup-command">./.venv/Scripts/python.exe app.py --set-admin-password</code>`
      : "";
  openDialog(
    t("系统设置"),
    `<form id="settings-form"><label class="field"><span>${t("语言")}</span><select name="language"><option value="en" lang="en">English</option><option value="zh-CN" lang="zh-CN">简体中文</option></select></label><p class="hint">${tr("This browser will remember your choice.", "此浏览器会记住你的选择。")}</p><div class="actions"><button class="btn primary" type="submit">${tr("Save settings", "保存设置")}</button></div><p class="error" role="status"></p></form>
    ${adminAction ? `<section class="detail-section"><h3>${tr("Administrator", "管理员")}</h3>${adminAction}<p id="admin-error" class="error" role="status"></p></section>` : ""}`,
  );
  const f = $("#settings-form");
  f.language.value = language;
  f.onsubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("oval-language", f.language.value);
    } catch {
      laterError(
        $(".error", f),
        tr(
          "This browser has disabled local storage. Enable it to save your language.",
          "此浏览器已禁用本地存储，启用后才能保存语言。",
        ),
      );
      return;
    }
    if (f.language.value !== language) location.reload();
    else {
      closeDialog();
      toast(t("设置已保存"));
    }
  };
  const login = $("#admin-login");
  if (login) login.onsubmit = async (event) => {
    event.preventDefault();
    const button = $("button[type=submit]", login);
    button.disabled = true;
    $(".error", login).textContent = "";
    try {
      await post("/api/admin/login", { password: login.elements.password.value });
      login.reset();
      await refresh();
      if (view === "profile") location.hash = "#events";
      else route();
      toast(tr("Signed in as administrator", "已登录为管理员"));
    } catch (err) {
      laterError($(".error", login), err);
    } finally {
      button.disabled = false;
    }
  };
  const logout = $("#admin-logout");
  if (logout) logout.onclick = async () => {
    logout.disabled = true;
    try {
      await post("/api/admin/logout", {});
      await refresh();
      route();
      toast(tr("Signed out", "已退出登录"));
    } catch (err) {
      laterError($("#admin-error"), err);
      logout.disabled = false;
    }
  };
};
const videoStatuses = {
  queued: tr("Queued", "排队中"),
  running: tr("Indexing", "定位中"),
  done: tr("Complete", "已完成"),
  completed: tr("Complete", "已完成"),
  partial: tr("Partially complete", "部分完成"),
  failed: tr("Failed", "失败"),
  found: tr("Candidate found", "已有候选"),
  ambiguous: tr("Ambiguous", "匹配有歧义"),
  missing: tr("Not located", "待定位"),
};
const running = (job) => ["queued", "running"].includes(job.status);
function renderVideo() {
  clearTimeout(videoTimer);
  $main.innerHTML = `<h1 class="page-title">${t("录像定位")}</h1><section class="panel video-start"><h2>${tr("Index a meet recording", "定位整场录像")}</h2><p class="hint">${tr("Match race footage against the official event documents. One job covers every athlete in the event.", "将原录像与官方赛事资料匹配，一项任务覆盖整场赛事的选手。")}</p><form id="video-form"><label class="field"><span>${tr("Sportity event URL", "Sportity 赛事链接")}</span><input type="url" required name="event" list="event-urls" placeholder="https://webapp.sportity.com/event/…" value="${escape(store.target_url || store.events[0]?.url || "")}"></label><datalist id="event-urls">${store.events.map((e) => `<option value="${escape(e.url)}">${escape(e.name)} · ${escape(eventDate(e))}</option>`).join("")}</datalist><label class="field"><span>${tr("YouTube recording URL", "YouTube 录像链接")}</span><textarea rows="2" name="recordings" required placeholder="https://www.youtube.com/watch?v=…" aria-describedby="source-instructions"></textarea><small id="source-instructions">${tr("For a multi-day meet, add each recording on a separate line.", "多日赛事可填写多条录像链接，每行一条。")}</small></label><button type="submit" class="btn primary">${tr("Start indexing", "开始定位")}</button><p class="error" role="status"></p></form></section><div class="section-head"><h2>${tr("Video jobs", "录像任务")}</h2></div><section class="panel" id="video-jobs"></section>`;
  const f = $("#video-form");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const button = $("button[type=submit]", f),
      err = $(".error", f);
    const urls = f.recordings.value
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (!urls.length || urls.some((u) => !youtubeId(u))) {
      err.textContent = tr(
        "Enter a valid YouTube recording URL on each line.",
        "请在每行填写一个有效的 YouTube 录像链接。",
      );
      return;
    }
    err.textContent = "";
    button.disabled = true;
    button.textContent = tr("Creating job…", "正在建立任务…");
    try {
      const { job_id } = await post("/api/locate", {
        url: f.elements.event.value.trim(),
        youtube_urls: urls,
      });
      const j = await api(urlFor("/api/video-job", { id: job_id }));
      store.video_jobs = [
        j,
        ...(store.video_jobs || []).filter((x) => x.id !== j.id),
      ];
      if (view === "video") {
        renderVideoJobs();
        pollVideos();
        toast(tr("Video job created", "录像任务已建立"));
        $("#video-jobs")?.scrollIntoView({ block: "nearest" });
      }
    } catch (error) {
      laterError(err, error);
    } finally {
      button.disabled = false;
      button.textContent = tr("Start indexing", "开始定位");
    }
  };
  renderVideoJobs();
  pollVideos();
}
function renderVideoJobs() {
  const panel = $("#video-jobs");
  if (!panel) return;
  const keep = new Set(
    [...panel.querySelectorAll("details[open]")].map((d) => d.dataset.key),
  );
  const jobs = store.video_jobs || [];
  panel.innerHTML =
    jobs
      .map((job) => {
        const ev = store.events.find(
          (e) => String(e.id) === String(job.event_id),
        );
        const name =
          ev?.name || job.event_name || tr("Event recording", "赛事录像");
        const raceLinks = (rows, status) => {
          const key = job.id + "/" + status;
          if (!rows.length) return "";
          return `<details data-key="${escape(key)}" ${keep.has(key) ? "open" : ""}><summary>${escape(videoStatuses[status])} (${rows.length})</summary><ul class="match-list">${rows.map((r) => `<li><button class="folder" type="button" data-open-race="${escape(r.race_id)}" data-scan="${escape(job.id)}"><span><strong>${escape(r.label)} · ${escape(r.distance)} m ${escape(roundName(r))}</strong><small>${escape(dateLabel(r.date))}${r.candidates?.length === 1 ? " · " + escape(stamp(r.candidates[0].start)) + " – " + escape(stamp(r.candidates[0].end)) : ""}</small></span>${icon("arrow")}</button></li>`).join("")}</ul></details>`;
        };
        const raceRows = job.races || [];
        const sources = job.youtube_ids || job.youtube_urls || [];
        return `<article class="job"><div class="job-line"><strong>${escape(name)}</strong><small>${tr("Job", "任务")} #${escape(job.id)}</small></div><p class="meta"><span>${escape(videoStatuses[job.status] || job.status)}</span>${running(job) && job.total ? `<span>${escape(job.done || 0)} / ${escape(job.total)}</span>` : job.race_count ? `<span>${escape(job.race_count)} ${tr("official races", "场官方比赛")}</span>` : ""}</p>${running(job) ? `<progress ${job.total ? `max="${Number(job.total)}" value="${Number(job.done) || 0}"` : ""} aria-label="${tr("Video indexing progress", "录像定位进度")}"></progress>` : ""}${job.current ? `<p class="hint">${escape(serviceText(job.current))}</p>` : ""}${job.error ? `<p class="error">${escape(serviceText(job.error))}</p>` : ""}
   ${
     sources.length
       ? `<p class="sources-line">${sources
           .map((s, i) => {
             const id = youtubeId(s);
             return id
               ? `<a target="_blank" rel="noopener" href="${escape(ytUrl(id))}">${tr("Recording", "录像")} ${i + 1} ${icon("external")}</a>`
               : "";
           })
           .join(" ")}</p>`
       : ""
   }
   ${["done", "partial"].includes(job.status) ? `<dl class="coverage"><div><dt>${tr("Candidate matches", "已有候选")}</dt><dd>${Number(job.found) || 0}</dd></div><div><dt>${tr("Ambiguous", "匹配有歧义")}</dt><dd>${Number(job.ambiguous) || 0}</dd></div><div><dt>${tr("Not located", "待定位")}</dt><dd>${Number(job.missing) || 0}</dd></div></dl>` : ""}
   ${
     ["done", "partial"].includes(job.status)
       ? Array.isArray(job.races)
         ? ["ambiguous", "missing", "found"]
             .map((st) =>
               raceLinks(
                 raceRows.filter((r) => r.status === st),
                 st,
               ),
             )
             .join("")
         : `<button class="btn small" data-job-details="${escape(job.id)}">${tr("Review races", "核对场次")}</button><span class="error"></span>`
       : ""
   }
   ${["failed", "partial"].includes(job.status) && job.url && sources.length ? `<button data-refill="${escape(job.id)}" class="btn small">${tr("Use these sources again", "用这些来源重试")}</button>` : ""}</article>`;
      })
      .join("") ||
    `<p class="hint">${tr("No video jobs yet.", "尚无录像任务。")}</p>`;
  panel.querySelectorAll("[data-job-details]").forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true;
        try {
          const full = await api(
            urlFor("/api/video-job", { id: b.dataset.jobDetails }),
          );
          store.video_jobs = store.video_jobs.map((j) =>
            j.id === full.id ? full : j,
          );
          renderVideoJobs();
        } catch (err) {
          laterError(b.nextElementSibling, err);
          b.disabled = false;
        }
      }),
  );
  panel.querySelectorAll("[data-refill]").forEach(
    (b) =>
      (b.onclick = () => {
        const job = store.video_jobs.find(
            (j) => String(j.id) === b.dataset.refill,
          ),
          f = $("#video-form");
        f.elements.event.value = job.url;
        f.recordings.value = (job.youtube_ids || job.youtube_urls || [])
          .map((v) => ytUrl(youtubeId(v)))
          .join("\n");
        f.recordings.focus();
        f.scrollIntoView({ block: "center" });
      }),
  );
  panel.querySelectorAll("[data-open-race]").forEach(
    (b) =>
      (b.onclick = () => {
        const job = jobs.find((j) => String(j.id) === b.dataset.scan);
        const row = job?.races?.find(
          (r) => String(r.race_id) === b.dataset.openRace,
        );
        showRace(
          b.dataset.openRace,
          row ? { job: job.id, candidates: row.candidates || [] } : null,
        );
      }),
  );
}
function pollVideos() {
  clearTimeout(videoTimer);
  const live = (store.video_jobs || []).filter(running);
  if (view !== "video" || !live.length) return;
  videoTimer = setTimeout(async () => {
    try {
      const fresh = await Promise.all(
        live.map((j) => api(urlFor("/api/video-job", { id: j.id }))),
      );
      const updated = new Map(fresh.map((j) => [j.id, j]));
      store.video_jobs = store.video_jobs.map((j) => updated.get(j.id) || j);
      if (fresh.some((j) => !running(j))) await refresh();
      if (view === "video") renderVideoJobs();
    } catch (err) {
      const panel = $("#video-jobs");
      if (panel && !$(".poll-error", panel))
        panel.insertAdjacentHTML(
          "beforeend",
          `<p class="error poll-error">${escape(serviceText(err.message))}</p>`,
        );
    }
    pollVideos();
  }, 2000);
}

init();
