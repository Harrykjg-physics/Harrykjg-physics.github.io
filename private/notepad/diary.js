/* ============================================================
   Notepad — diary data & drill-down UI.
   ------------------------------------------------------------
   HOW TO WRITE A DIARY ENTRY
   Edit the DIARY object below. Structure:

       DIARY = {
         "年份": {
           "月份": {          // "01".."12"
             "日期键": "日记内容",   // 日期键 = MMDD，如 "0513" 表示 5 月 13 日
             ...
           },
           ...
         },
         ...
       }

   - 用空行分隔多段文字（每段显示为一个段落）。
   - 没有写过的月份/日期不会显示按钮。
   - 想给某一天写多篇？直接在同一天的文本里用空行分段即可。

   示例：今天是 2026 年 5 月 13 日。
   ============================================================ */
var DIARY = {
  "2026": {
    "05": {
      "0513": "今天开始使用私人日记本。\n\n在这里写下你的日记：每年的月份里添加日期键（如 0513），并在引号里写下当日内容。"
    }
  }
};

/* ============================================================
   UI: years → months → days → entry
   (no need to edit below this line)
   ============================================================ */
(function () {
  "use strict";

  var app = null;
  var state = { year: null, month: null, day: null };
  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function years() { return Object.keys(DIARY).sort().reverse(); }
  function monthsOf(y) { return Object.keys(DIARY[y] || {}).sort(); }
  function daysOf(y, m) { return Object.keys((DIARY[y] || {})[m] || {}).sort(); }

  function weekday(y, m, d) {
    return WEEK[new Date(Number(y), Number(m) - 1, Number(d)).getDay()];
  }

  function breadcrumb() {
    var parts = ['<a href="#" data-nav="root">Notepad</a>'];
    if (state.year) {
      parts.push('<a href="#" data-nav="year">' + esc(state.year) + ' 年</a>');
    }
    if (state.month) {
      parts.push('<a href="#" data-nav="month">' + Number(state.month) + ' 月</a>');
    }
    if (state.day) {
      parts.push(esc(state.day) + '（周' + weekday(state.year, state.month, state.day) + '）');
    }
    return '<div class="nd-breadcrumb">' + parts.join(' / ') + '</div>';
  }

  function render() {
    var html = "";
    if (!state.year) {
      /* ---- year view ---- */
      html += '<p class="nd-hint">选择年份：</p><div class="nd-grid">';
      years().forEach(function (y) {
        html += '<button type="button" class="nd-btn nd-strong" data-go="year" data-y="' + esc(y) + '">' + esc(y) + '</button>';
      });
      html += '</div>';
    } else if (!state.month) {
      /* ---- month view ---- */
      html += breadcrumb();
      html += '<p class="nd-hint">选择月份：</p><div class="nd-grid">';
      for (var m = 1; m <= 12; m++) {
        var key = ("0" + m).slice(-2);
        var has = monthsOf(state.year).indexOf(key) >= 0;
        html += '<button type="button" class="nd-btn" data-go="month" data-m="' + key + '"' + (has ? "" : " disabled") + '>' + m + ' 月</button>';
      }
      html += '</div>';
    } else if (!state.day) {
      /* ---- day view ---- */
      html += breadcrumb();
      html += '<p class="nd-hint">选择日期：</p><div class="nd-grid">';
      daysOf(state.year, state.month).forEach(function (d) {
        html += '<button type="button" class="nd-btn nd-strong" data-go="day" data-d="' + esc(d) + '">' + esc(d) + ' <span class="nd-hint">周' + weekday(state.year, state.month, d) + '</span></button>';
      });
      html += '</div>';
    } else {
      /* ---- entry view ---- */
      html += breadcrumb();
      var text = (DIARY[state.year] || {})[state.month] ? ((DIARY[state.year] || {})[state.month] || {})[state.day] : "";
      var paras = String(text == null ? "" : text).split(/\n+/).filter(Boolean);
      html += '<div class="nd-entry"><h3>' + esc(state.year) + ' 年 ' + Number(state.month) + ' 月 ' +
              Number(state.day.slice(2)) + ' 日（' + esc(state.day) + '）</h3>';
      if (!paras.length) {
        html += '<p class="muted">（这一天还没有写日记）</p>';
      } else {
        paras.forEach(function (p) { html += '<p>' + esc(p) + '</p>'; });
      }
      html += '</div>';
    }
    app.innerHTML = html;
  }

  function init() {
    app = document.getElementById("notepad-app");
    if (!app) return;
    app.addEventListener("click", function (e) {
      var goEl = e.target.closest ? e.target.closest("[data-go]") : null;
      var navEl = e.target.closest ? e.target.closest("[data-nav]") : null;
      if (goEl) {
        var go = goEl.getAttribute("data-go");
        if (go === "year") {
          state.year = goEl.getAttribute("data-y");
          state.month = null; state.day = null;
        } else if (go === "month") {
          state.month = goEl.getAttribute("data-m");
          state.day = null;
        } else if (go === "day") {
          state.day = goEl.getAttribute("data-d");
        }
        e.preventDefault();
      } else if (navEl) {
        var nav = navEl.getAttribute("data-nav");
        if (nav === "root") { state.year = state.month = state.day = null; }
        else if (nav === "year") { state.month = null; state.day = null; }
        else if (nav === "month") { state.day = null; }
        e.preventDefault();
      } else {
        return;
      }
      render();
    });
    render();
  }

  window.Notepad = { init: init };
  init();
})();
