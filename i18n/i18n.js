/* Clear i18n: auto-detect + language selector. Shared across Clear Recipe, Starvard, Clear News. */
(function(){
  "use strict";
  var CFG = window.CR_I18N || {};
  var LANGS = CFG.langs || {
    en:"English", id:"Bahasa Indonesia", es:"Español", hi:"हिन्दी", pt:"Português",
    ar:"العربية", fr:"Français", vi:"Tiếng Việt", tr:"Türkçe", bn:"বাংলা", ta:"தமிழ்"
  };
  var AVAILABLE = CFG.available || ["en","id","es"]; /* languages actually built */
  var RTL = {ar:1};
  var LS_KEY = (CFG.site || "cr") + "_lang";
  var GEO2LANG = {id:"id",es:"es",mx:"es",ar:"es",cl:"es",co:"es",pe:"es",ve:"es",
    in:"hi",br:"pt",pt:"pt",fr:"fr",be:"fr",ch:"fr",vn:"vi",tr:"tr",bd:"bn",sa:"ar",
    eg:"ar",ae:"ar",qa:"ar",kw:"ar",ma:"ar",dz:"ar",tn:"ar",jo:"ar"};

  function currentLang(){
    var m = location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    return (m && AVAILABLE.indexOf(m[1]) >= 0) ? m[1] : "en";
  }
  function stripLang(path){
    var m = path.match(/^\/[a-z]{2}(\/.*)?$/);
    if (m && AVAILABLE.indexOf(path.slice(1,3)) >= 0) return m[1] || "/";
    return path;
  }
  function setSelector(lang){
    var sel = document.getElementById("cr-lang-select");
    if (sel) sel.value = lang;
  }
  function go(lang){
    try { localStorage.setItem(LS_KEY, lang); } catch(e){}
    var target = lang === "en" ? stripLang(location.pathname) : "/" + lang + stripLang(location.pathname);
    if (target !== location.pathname + location.search + location.hash)
      location.href = target + location.search + location.hash;
  }

  /* --- auto-detect: first visit to root only --- */
  function autodetect(){
    var lang = currentLang();
    var path = location.pathname;
    var isRoot = path === "/" || AVAILABLE.some(function(l){ return path === "/" + l + "/"; });
    if (!isRoot) return;
    var stored = null;
    try { stored = localStorage.getItem(LS_KEY); } catch(e){}
    if (stored) { if (stored !== lang && AVAILABLE.indexOf(stored) >= 0) go(stored); return; }
    /* 1. browser language (from Accept-Language) */
    var nav = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < nav.length; i++){
      var code = (nav[i] || "").slice(0,2).toLowerCase();
      if (code !== "en" && AVAILABLE.indexOf(code) >= 0 && code !== lang){ go(code); return; }
    }
    /* 2. Cloudflare country fallback via timezone */
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      var m = tz.match(/^(Asia\/Jakarta|America\/Mexico_City|Asia\/Kolkata|America\/Sao_Paulo|Europe\/Paris|Asia\/Ho_Chi_Minh|Europe\/Istanbul|Asia\/Dhaka|Asia\/Kuala_Lumpur)/);
      /* timezone->lang is weak; only use for id/es which are available */
      var tzlang = {"Asia/Jakarta":"id","America/Mexico_City":"es"}[m && m[1]];
      if (tzlang && tzlang !== lang){ go(tzlang); return; }
    } catch(e){}
  }

  /* --- language selector --- */
  function buildSelector(){
    var host = document.getElementById("cr-lang-host");
    if (!host) return;
    var lang = currentLang();
    var label = document.createElement("label");
    label.setAttribute("for","cr-lang-select");
    label.className = "cr-lang-label";
    label.textContent = "🌐";
    var sel = document.createElement("select");
    sel.id = "cr-lang-select";
    sel.className = "cr-lang-select";
    sel.setAttribute("aria-label","Language");
    AVAILABLE.forEach(function(code){
      var o = document.createElement("option");
      o.value = code; o.textContent = LANGS[code] || code;
      if (code === lang) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function(){ go(sel.value); });
    host.appendChild(label); host.appendChild(sel);
  }

  /* --- RTL --- */
  function applyRtl(){
    if (RTL[currentLang()]) document.documentElement.setAttribute("dir","rtl");
  }

  document.addEventListener("DOMContentLoaded", function(){
    applyRtl();
    buildSelector();
    setSelector(currentLang());
    autodetect();
  });
})();
