/* Clear Recipe serving scaler (Oct 17, Dave's 30-day plan tools).
   Embedded on every recipe page: builds a scale control above the
   ingredient checklist and re-renders quantities in place. Also exposes
   window.CR_SCALE for the /scaler/ tool landing. Pure client-side:
   no tool state ever gets its own URL. */
(function () {
  "use strict";
  var STR = {
    en: { scale: "Scale recipe", servings: "Servings" },
    es: { scale: "Escalar receta", servings: "Porciones" },
    id: { scale: "Skala resep", servings: "Porsi" },
    pt: { scale: "Ajustar receita", servings: "Porções" },
    fr: { scale: "Ajuster la recette", servings: "Portions" },
    de: { scale: "Rezept skalieren", servings: "Portionen" },
    hi: { scale: "मात्रा बदलें", servings: "सर्विंग" },
    it: { scale: "Scala la ricetta", servings: "Porzioni" },
    ja: { scale: "分量を調整", servings: "人分" },
    ar: { scale: "ضبط المقادير", servings: "حصص" },
    tr: { scale: "Tarifi ölçekle", servings: "Porsiyon" },
    vi: { scale: "Điều chỉnh khẩu phần", servings: "Khẩu phần" },
    ko: { scale: "양 조절", servings: "인분" },
    ru: { scale: "Масштаб рецепта", servings: "Порции" },
    nl: { scale: "Recept schalen", servings: "Porties" }
  };
  function uiLang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    l = l.split("-")[0];
    return STR[l] ? l : "en";
  }

  /* ---------- quantity parsing / formatting ---------- */
  var UNIFRAC = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
  function numVal(tok) {
    tok = tok.trim();
    if (UNIFRAC.hasOwnProperty(tok)) return UNIFRAC[tok];
    var m = tok.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    m = tok.match(/^(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
    var v = parseFloat(tok.replace(",", "."));
    return isNaN(v) ? null : v;
  }
  /* Leading quantity: mixed number, fraction, plain number, or a range
     "2 to 3" / "2-3". Returns {lo, hi, sep, rest} or null. */
  function parseLead(text) {
    var m = text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])(\s+(?:to|bis|à|a|-|–)\s+)(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])(?=\s|$)([\s\S]*)$/);
    if (m) {
      var lo = numVal(m[1]), hi = numVal(m[3]);
      if (lo !== null && hi !== null) return { lo: lo, hi: hi, sep: m[2], rest: m[4] };
    }
    m = text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])(?=\s|$)([\s\S]*)$/);
    if (m) {
      var v = numVal(m[1]);
      if (v !== null) return { lo: v, hi: null, sep: "", rest: m[2] };
    }
    return null;
  }
  function fmt(v) {
    if (v <= 0) return "0";
    var whole = Math.floor(v + 1e-9), frac = v - whole;
    var denoms = [2, 3, 4, 6, 8];
    for (var i = 0; i < denoms.length; i++) {
      var d = denoms[i], n = Math.round(frac * d);
      if (n > 0 && n < d && Math.abs(frac - n / d) < 0.03) {
        return (whole > 0 ? whole + " " : "") + n + "/" + d;
      }
      if (n === d && Math.abs(frac - 1) < 0.03) return String(whole + 1);
      if (n === 0 && Math.abs(frac) < 0.03) return String(whole);
    }
    var r = Math.round(v * 10) / 10;
    return String(r).replace(/\.0$/, "");
  }
  var PAREN = /\((about |circa |env\. |environ |ungefähr |약 |около |yaklaşık )?(\d+(?:[.,]\d+)?)\s*(g|ml|kg|l|oz)\)/;
  function scaleLine(text, f) {
    if (f === 1) return text;
    var p = parseLead(text);
    if (!p) return text;
    var out = fmt(p.lo * f);
    if (p.hi !== null) out += p.sep + fmt(p.hi * f);
    out += p.rest;
    var pm = out.match(PAREN);
    if (pm) {
      var v = parseFloat(pm[2].replace(",", ".")) * f;
      var sv = (pm[3] === "kg" || pm[3] === "l") ? fmt(v) : String(Math.round(v));
      out = out.replace(PAREN, "(" + (pm[1] || "") + sv + " " + pm[3] + ")");
    }
    return out;
  }
  window.CR_SCALE = { parseLead: parseLead, fmt: fmt, scaleLine: scaleLine, STR: STR };

  /* ---------- on-page control ---------- */
  function init() {
    var list = document.querySelector("ul.checklist");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("li"));
    if (!items.length) return;
    var originals = items.map(function (li) { return li.textContent; });
    var t = STR[uiLang()];
    var base = null;
    var meta = document.querySelector(".meta");
    if (meta) {
      var m = meta.textContent.match(/(\d+(?:\.\d+)?)/);
      if (m) { var b = parseFloat(m[1]); if (b >= 1 && b <= 100) base = b; }
    }
    var css = document.createElement("style");
    css.textContent = ".cr-scale{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0 2px}" +
      ".cr-scale .lab{font-weight:700;font-size:15px}" +
      ".cr-scale button{border:1.5px solid #1a8917;background:#fff;color:#146c12;border-radius:999px;padding:4px 13px;font-weight:600;font-size:14px;cursor:pointer}" +
      ".cr-scale button.on{background:#1a8917;color:#fff}" +
      ".cr-scale .sv{display:inline-flex;gap:6px;align-items:center;margin-left:6px}" +
      ".cr-scale .sv b{min-width:22px;text-align:center;font-size:15px}";
    document.head.appendChild(css);
    var bar = document.createElement("div");
    bar.className = "cr-scale";
    var lab = document.createElement("span");
    lab.className = "lab"; lab.textContent = t.scale + ":";
    bar.appendChild(lab);
    var factor = 1, target = base;
    var btns = [];
    function apply() {
      items.forEach(function (li, i) { li.textContent = scaleLine(originals[i], factor); });
      btns.forEach(function (b) { b.classList.toggle("on", Math.abs(parseFloat(b.getAttribute("data-f")) - factor) < 0.001); });
      if (svVal) svVal.textContent = String(target);
    }
    [0.5, 1, 2, 3].forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("data-f", String(f));
      b.textContent = f === 0.5 ? "½×" : f + "×";
      b.addEventListener("click", function () {
        factor = f; if (base) target = Math.max(1, Math.round(base * f)); apply();
      });
      btns.push(b); bar.appendChild(b);
    });
    var svVal = null;
    if (base) {
      var sv = document.createElement("span");
      sv.className = "sv";
      var minus = document.createElement("button");
      minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", "-1");
      var plus = document.createElement("button");
      plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", "+1");
      var cap = document.createElement("span");
      cap.textContent = t.servings + ":";
      svVal = document.createElement("b"); svVal.textContent = String(base);
      minus.addEventListener("click", function () { if (target > 1) { target -= 1; factor = target / base; apply(); } });
      plus.addEventListener("click", function () { target += 1; factor = target / base; apply(); });
      sv.appendChild(cap); sv.appendChild(minus); sv.appendChild(svVal); sv.appendChild(plus);
      bar.appendChild(sv);
    }
    list.parentNode.insertBefore(bar, list);
    apply();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
