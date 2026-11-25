export const messages = {
  赛事: "Events",
  反馈: "Feedback",
  "需要管理员登录。": "Administrator sign-in is required.",
  "请在运行 Oval Index 的电脑上登录。": "Sign in on the computer running Oval Index.",
  "请先在本机终端设置管理员密码。": "Set an administrator password in the local terminal first.",
  "管理员密码不正确。": "The administrator password is incorrect.",
  "请选择反馈类型。": "Choose a feedback type.",
  "请填写消息，最多 2,000 个字符。": "Enter a message of up to 2,000 characters.",
  "请输入有效的 HTTPS 链接。": "Enter a valid HTTPS link.",
  "请选择已收录的赛事。": "Select an existing event.",
  "请选择待处理或已处理。": "Choose an open or closed status.",
  "找不到这条反馈。": "Feedback not found.",
  "目录标题与 PDF 内的场次编号不一致，已按 PDF 原件关联": "The directory title and PDF show different race numbers. Linked using the original PDF.",
  "多日赛事无法唯一确定该场赛日，请核对赛程。": "The race day is unclear for this multi-day meet. Check the official schedule.",
  "数据库迁移后关联校验失败。": "Could not verify record links after the database migration.",
  "出点超出了播放器记录的录像时长。": "The out point exceeds the duration reported by the player.",
  "官方场次名单已有更新，请重新运行录像定位。": "The official race roster has changed since this job. Run indexing again.",
  "部分录像画面尚未读取，请重新运行录像定位。": "Some recording samples are missing. Run indexing again.",
  "等待同一录像分析": "Waiting for the current recording scan",
  "已复用核验缓存": "Reused verified recording samples",
  "请输入有效的 YouTube 视频 ID。": "Enter a valid YouTube video ID.",
  "此缓存属于其他录像。": "These cached samples belong to another recording.",
  "连续三处公开播放器取样失败，请检查播放权限、网络或改用赛事方授权录像。":
    "Three consecutive samples failed. Check playback access and the network, or use an authorized recording.",
  "需要安装 Windows English (United States) OCR 语言包。":
    "Install the Windows English (United States) OCR language pack.",
  "自动定位需要选定比赛日的官方场号、轮次、距离及逐场名单。":
    "Indexing requires official race numbers, rounds, distances and rosters for the race day.",
  采样: "Sampling frames",
  匹配: "Matching races",
  完成: "Finished",
  正在导入官方赛事资料: "Importing official race documents",
  正在打开录像: "Opening recording",
  "请输入有效的 HTTPS YouTube 观看、直播或分享链接。":
    "Enter a valid HTTPS YouTube watch, live or share link.",
  "请输入 YouTube 录像链接。": "Enter a YouTube recording URL.",
  "找不到录像任务。": "Video job not found.",
  "无法核对录像时长。": "The recording duration could not be verified.",
  "定位器返回的片段区间或证据无效。":
    "The detector returned an invalid interval or missing evidence.",
  "官方名单导入失败。": "Official roster import failed.",
  "官方资料中没有已导入的参赛记录。":
    "The official documents contain no indexed race entries.",
  "请至少添加一条 YouTube 录像。": "Add at least one YouTube recording.",
  "录像任务正在运行。": "Video job is busy.",
  "任务已中断，重新运行可继续使用缓存的取样。":
    "Worker interrupted. Run again to resume cached samples.",
  "任务进程已中断。": "Worker interrupted.",
  "官方名单导入不完整：": "Official roster import incomplete:",
  "有多个候选区间待复核。": "Multiple intervals need review.",
  录像定位: "Video indexing",
  "仅接受本站的更新请求。": "Changes must come from this site.",
  别名: "alias",
  "文件不存在。": "File not found.",
  "无法读取 Sportity 目录。": "Could not read the Sportity directory.",
  "没有这个操作。": "Unknown action.",
  "访问地址与本机服务不匹配。": "This host does not match the server.",
  "请求体为空或超出大小限制。": "The request was empty or too large.",
  "请求格式不正确。": "Unsupported request format.",
  "读取本地索引失败，请查看启动窗口的日志。":
    "Could not read the local index. Check the server log.",
  赛事链接: "event URL",
  "选手或比赛记录已变更，请重新载入。":
    "The athlete or race changed. Reload and try again.",
  "需要 JSON 对象。": "Expected a JSON object.",
  "页面不存在。": "Page not found.",
  频道码: "channel code",
  "的名单或赛事编号与所选赛事缺乏足够对应，请核对原始赛事目录。":
    "has insufficient matching roster entries or bibs. Check the event directory.",
  "的赛道长度与该赛事的官方资料不一致。":
    "has a track length that conflicts with official documents.",
  "PDF 未建立索引：": "Could not index the PDF:",
  "PDF 的赛事类型与所选赛事不符，请核对短道或长道。":
    "The PDF’s discipline does not match the selected event.",
  "PDF 表头的赛事名称与所选赛事的官方资料不符。":
    "The PDF event name does not match the official event.",
  "PDF 表头的赛事日期与所选赛事不一致。":
    "The PDF date does not match this event.",
  "仅可重试失败或部分完成的导入任务。":
    "Only failed or partially completed jobs can be retried.",
  "同名同俱乐部且有多个赛事编号，请核对身份。":
    "This name and club have multiple bibs. Review the athlete’s identity.",
  "同名同俱乐部存在多个身份或赛事编号，请核对。":
    "This name and club match multiple athletes or bibs.",
  "官方成绩来源的名次、用时或状态不同，请对照原件。":
    "The official documents disagree on place, time or status.",
  "导入任务不存在。": "Import job not found.",
  "文件名须以 .pdf 结尾。": "The filename must end in .pdf.",
  "无法取得导入任务锁。": "The import could not acquire a job lock.",
  无法识别版面: "Unknown document layout",
  正在关联参赛名单与正式成绩: "Linking rosters and official results",
  "正在读取 Sportity 目录": "Reading the Sportity directory",
  "此姓名与多个身份或别名相符，请核对。":
    "This name matches multiple athletes or aliases.",
  "缺少可核对的赛事日期或分组名单，无法关联补传文件。":
    "No matching date or roster was available for this upload.",
  "请选择目标赛事。": "Select an event.",
  分组表列数与标题不符: "Race sheet columns disagree with the header",
  姓名或俱乐部缺失: "Missing name or club",
  成绩行缺少可识别的场次: "Unrecognized race on this result row",
  "扫描页需 OCR 或人工核对": "Scanned page requires OCR or manual review",
  报名排名列不完整: "Incomplete participant ranking columns",
  无可用文字层或尚未支持此表格版式:
    "No readable text layer or unsupported table layout",
  无法辨认场次或轮次: "Unrecognized race or round",
  无法辨认用时: "Unrecognized finish time",
  "未知官方状态，保留原文并排除有效用时":
    "Unknown status. The raw value is retained and excluded from valid times.",
  未能识别赛程批次: "Unrecognized schedule block",
  用时或异常状态缺失: "Missing finish time or result status",
  "疑似占位用时，已排除在有效用时之外":
    "Possible placeholder. Excluded from valid finish times.",
  积分格式异常: "Invalid points format",
  "空 PDF": "Empty PDF",
  "缺少分组表头、场次或起跑位置":
    "Missing race sheet header, race or start position",
  距离或场内名次无效: "Invalid distance or place",
  运动员或成绩列不完整: "Incomplete athlete or result columns",
  运动员标题列异常: "Unexpected athlete header",
  选手编号或姓名无法辨认: "Unrecognized name or bib",
  "入点必须大于等于零，出点必须晚于入点。":
    "The in point must be zero or later, and before the out point.",
  "出点超出了已核实的录像时长 2:13:30。":
    "The out point exceeds the verified recording length of 2:13:30.",
  "已报告录像与场次不符，需重新核对。":
    "The clip was reported as a mismatch for this race.",
  "找不到这条记录。": "Record not found.",
  "未知录像状态。": "Unknown video status.",
  "未知纠正类型。": "Unknown report type.",
  核对依据: "review evidence",
  补充说明: "review note",
  "请填写 11 位 YouTube 视频 ID。": "Enter an 11-character YouTube video ID.",
  "请填写视频 ID 和片段入、出点。": "Enter a video ID and both clip points.",
  "Sportity 赛事页缺少可识别的日期。":
    "No recognizable date was found in the directory.",
  "文件超出读取大小限制。": "File exceeds the size limit.",
  "此目录未发现可识别的赛程、名单或成绩 PDF。":
    "No supported race documents were found.",
  "目录的结束日期早于开始日期：": "The event end date is before its start:",
  "该来源不是 Sportity 官方 PDF。": "This is not an official Sportity PDF.",
  "请输入 Sportity 公开赛事目录链接。":
    "Enter a public Sportity event directory URL.",
  "请输入有效的 Sportity 频道码。": "Enter a valid Sportity channel code.",
  "赛事日期格式待核对：": "Unrecognized event date format:",
  "需要有效的 PDF 文件，大小不超过 20 MiB。":
    "Choose a valid PDF of 20 MiB or less.",
  "任务已中断，可重试。": "Job interrupted. You can retry it.",
  "Sportity 赛事目录": "Sportity directory",
  "Sportity 赛事资料": "Sportity event documents",
  "YouTube 录像 ID 或链接": "YouTube video ID or link",
  上一场: "Previous race",
  上传并解析: "Upload PDF",
  下一场: "Next race",
  下载与解析进度: "Download and parsing progress",
  不是该选手的比赛: "Wrong athlete in this result",
  为当前选手添加姓名别名: "Add a name alias for this athlete",
  人工核对: "Manual review",
  人工画面核对: "Visual review",
  "从 Sportity 导入": "Import from Sportity",
  "任务 #": "Job #",
  份已完成: "files complete",
  "例如 2627OOST": "e.g. 2627OOST",
  "例如画面中的场次、名单或终点成绩":
    "For example, the on-screen race number, roster or finish results",
  保存别名: "Save alias",
  保存校正: "Save review",
  俱乐部未提供: "Club unavailable",
  候选待确认: "Needs review",
  全场成绩: "Meet results",
  全部日期: "All dates",
  全部赛事: "All events",
  全部距离: "All distances",
  公开组: "Open",
  公开赛事链接或频道码: "Public event URL or channel code",
  决赛: "Final",
  出场表: "Start list",
  分组成绩: "Race results",
  匹配依据或校正说明: "Evidence or correction notes",
  半决赛: "Semifinal",
  "原始 PDF": "Original PDF",
  原始资料: "Source documents",
  参赛记录: "Race entries",
  同场录像: "Race footage",
  同场选手: "Race field",
  名次: "Place",
  "在 Sportity 打开": "Open on Sportity:",
  "在 YouTube 打开": "Open on YouTube",
  场内名次: "Place",
  "填写原录像时间轴上的位置，可精确到小数秒。入点可放在起跑前约 10 秒，出点留出赛后画面。":
    "Use positions on the recording’s timeline, including fractional seconds. Allow about 10 seconds before the start and leave room for the finish.",
  复核说明: "Review notes",
  姓名或俱乐部: "Name or club",
  "官方成绩列为 DNS（未起跑）。这里可以查看同场录像，该条记录不参与个人连播。":
    "The official result is DNS (did not start). You can watch this race separately. The athlete’s playlist skips it.",
  "定位依据 ·": "Evidence ·",
  导入中: "Importing",
  导入任务: "Import jobs",
  导入任务已更新: "Import job updated",
  导入失败: "Import failed",
  导入赛事: "Import event",
  "导入赛事成绩后，就可以按姓名查找个人档案。":
    "Import official results to find an athlete by name.",
  导入赛事资料: "Import event documents",
  尚无参赛记录: "No race entries yet",
  "尚无导入任务。": "No import jobs yet.",
  尚无已导入赛事: "No events imported yet",
  尚无确认录像: "Without verified video",
  "尚无经画面核对的片段。此场成绩已收录。":
    "The result is indexed. No clip has been verified for this race yet.",
  尚未导入比赛资料: "No event documents yet",
  "嵌入播放器无法播放（YouTube": "Playback unavailable (YouTube",
  嵌入播放器未载入: "Player unavailable",
  已保存姓名别名: "Name alias saved",
  已复核: "Reviewed",
  已完成: "Complete",
  "已导入原件（": "Source files (",
  已导入赛事: "Imported events",
  已建立导入任务: "Import job created",
  "已打开原录像入点，请在播放器内核对出点。":
    "The original recording opened at the in point. Check the out point in the player.",
  已提交复核: "Report submitted",
  已提交的问题: "Reported issues",
  "已播放到片段末尾。": "End of playlist.",
  已确认: "Verified",
  已解析: "Parsed",
  归属待复核: "Athlete under review",
  "当前网络未能载入 YouTube 播放器。":
    "YouTube’s player could not load. Check the network connection.",
  录像: "Video",
  录像匹配错场: "Video shows a different race",
  录像已确认: "With verified video",
  录像校正已保存: "Clip review saved",
  录像状态: "Video status",
  "待复核记录（": "Entries needing review (",
  待定位: "Not located",
  待核验: "Needs review",
  "成绩、赛程或出场表": "Results, schedule or start list",
  所属赛事: "Event",
  打开完整录像: "Open full recording",
  抓取于: "Retrieved",
  报告匹配问题: "Report a matching issue",
  排队中: "Queued",
  "提交后，已有片段将标记为候选，等待重新核对。":
    "The clip will return to the review queue.",
  提交问题: "Submit report",
  文件明细: "File details",
  "时:分:秒": "h:mm:ss",
  暂无关联文件: "No linked documents",
  "暂无当前版本的文件。": "No current documents.",
  "服务未返回导入任务编号。": "The server did not return a job ID.",
  "服务返回了无法读取的响应（": "Unreadable server response (",
  机器候选: "Automatic match",
  查找频道赛事: "Find channel events",
  查看来源: "View source",
  查看此人档案: "View athlete profile",
  查看解析依据: "View source evidence",
  标记已复核: "Mark reviewed",
  校正录像位置与状态: "Edit clip timing and status",
  核对原录像入点: "Open at in point",
  "正在建立任务…": "Creating job…",
  "正在读取同场成绩与原始资料…": "Loading race results and sources…",
  "正在读取频道…": "Reading channel…",
  "正在载入播放器…": "Loading player…",
  正式成绩: "Official time",
  "此频道未发现可选的赛事目录。":
    "No event directories were found in this channel.",
  比赛录像: "Race video",
  比赛记录: "Race results",
  比赛详情: "Race details",
  没有找到匹配的选手: "No matching athletes",
  没有符合筛选条件的比赛: "No races match these filters",
  清除筛选: "Clear filters",
  片段入点: "Clip in point",
  片段出点: "Clip out point",
  的其他拼写: "— alternate spelling",
  的官方来源: "on Sportity",
  "的这条参赛记录标记为待复核。": "will have this entry flagged for review.",
  "确认方式 ·": "Review method ·",
  确认未录到: "Recording confirmed absent",
  等待读取目录: "Waiting for the directory",
  粘贴赛事方录像链接: "Paste the organizer’s recording link",
  "补充原始 PDF": "Upload a source PDF",
  观看同场录像: "Watch race footage",
  观看本人比赛: "Watch race",
  观看此场录像: "Watch this race",
  观看比赛录像: "Watch race video",
  观看片段: "Watch clip",
  计划赛程: "Scheduled local time",
  详情: "Details",
  "请先从 Sportity 导入所属赛事，再添加 PDF。":
    "Import the event from Sportity before adding a PDF.",
  "请填写有效的 YouTube 链接或 ID，以及先后顺序正确的录像入点、出点。":
    "Enter a valid YouTube link or ID. Set the out point after the in point.",
  请根据俱乐部确认选手: "Confirm the athlete by club",
  "请求失败（": "Request failed (",
  "请点击播放器中的播放键。": "Press play in the embedded player.",
  "赛事当地的批次计划钟点。实际起跑和录像位置另行核对。":
    "The schedule uses venue local time. The actual start and video position are checked separately.",
  赛事编号: "Event bib",
  赛事资料: "Event library",
  赛事资料待核对: "Event under review",
  赛程: "Schedule",
  "赛程 PDF": "Schedule PDF",
  起跑位: "Start position",
  轮次待核对: "Round under review",
  "较早版本（": "Earlier versions (",
  "输入姓名、别名或俱乐部": "Search name, alias or club",
  返回详情: "Back to details",
  连续观看: "Play all",
  连续观看比赛: "Athlete playlist",
  "选手 / 俱乐部": "Athlete / club",
  "选手归属 ·": "Athlete assignment ·",
  选手排名: "Athlete ranking",
  选手档案: "Athlete profile",
  选择赛事目录: "Select an event",
  选择选手: "Select athlete",
  部分完成: "Partially complete",
  重新读取档案: "Reload profiles",
  重试失败项目: "Retry failed files",
  问题已标记为已复核: "Report marked as reviewed",
  问题类型: "Issue type",
  "项目 / 场次": "Distance / race",
  预览候选片段: "Preview candidate",
  预赛: "Heat",
  "），可打开原录像查看。": "). Open the original recording to watch.",
  "，稍后重试。": ". Retrying shortly.",
  个人档案: "Profile",
  跳到主要内容: "Skip to content",
  主导航: "Main navigation",
  切换选手: "Switch athlete",
  "正在读取比赛档案…": "Loading race index…",
  关闭: "Close",
  系统设置: "System settings",
  语言: "Language",
  设置已保存: "Settings saved",
  "从官方比赛资料查看短道速滑个人成绩和经核验的录像片段。":
    "Explore official short-track results and verified race footage by athlete.",
  "Oval Index · 速滑比赛档案": "Oval Index · Short-track race archive",
  "Oval Index 个人档案": "Oval Index athlete profile",
  "· 第": "· p.",
  "份）": ")",
  将: "",
  打开: "Open",
  播放: "Play",
  查看: "View",
  页: "",
  "）": ")",
};
let savedLanguage;
try {
  savedLanguage = localStorage.getItem("oval-language");
} catch {}
export const language = savedLanguage === "zh-CN" ? "zh-CN" : "en";
export const t = (key) => (language === "zh-CN" ? key : (messages[key] ?? key));
export const tr = (english, chinese) =>
  language === "zh-CN" ? chinese : english;

const keys = Object.keys(messages)
  .filter((k) => k.length > 3)
  .sort((a, b) => b.length - a.length);
export function serviceText(value) {
  if (!value) return "";
  const s = String(value);
  if (s.includes(" · ")) return s.split(" · ").map(serviceText).join(" · ");
  if (s.includes("\n")) return s.split("\n").map(serviceText).join("\n");
  const withId = s.match(/^([a-zA-Z0-9_-]{11}: )(.+)$/);
  if (withId) return withId[1] + serviceText(withId[2]);
  if (language === "zh-CN") {
    if (s === "Failed to fetch") return "无法连接到本地服务。";
    for (const [cn, en] of Object.entries(messages))
      if (en.length > 3 && s.startsWith(en)) return cn + s.slice(en.length);
    return s;
  }
  const player = s.match(/^YouTube 公开播放器不可用（(.+?)）。$/);
  if (player)
    return "The public YouTube player is unavailable (" + player[1] + ").";
  const seek = s.match(/^播放器显示 (.+) 秒，未到达请求位置 (.+)。$/);
  if (seek)
    return (
      "The player reached " + seek[1] + " seconds instead of " + seek[2] + "."
    );

  if (messages[s] != null) return messages[s];
  if (!/[\u3400-\u9fff]/u.test(s))
    return s === "Failed to fetch" ? "Could not reach the local server." : s;
  const max = s.match(/^请检查(.+)，最多 (\d+) 个字符。$/);
  if (max)
    return `Check the ${messages[max[1]] || "field"} (maximum ${max[2]} characters).`;
  let translated = s;
  for (const key of keys)
    if (translated.includes(key))
      translated = translated.replaceAll(key, messages[key]);
  return translated;
}
