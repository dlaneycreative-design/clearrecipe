/* Clear Recipe "Cook With What You Have" (Oct 17, Dave's 30-day plan).
   Pick ingredients, get dishes ranked by coverage of the dish's
   ingredients, then fewest missing, then quickest. Matching is
   canonical (pantry-{lang}.json ids); display names are the visitor's
   language. Pure client-side: picks never get a URL. */
(function () {
  "use strict";
  var STR = {
    en: { hint: "Tap the ingredients you have, or search the full list.", yours: "Your ingredients", results: "Best matches", missing: "Missing", min: "min", veg: "Vegetarian", vegan: "Vegan", any: "Any", anytime: "Any time", u30: "Under 30 min", u60: "Under 1 hour", none: "No matches yet. Add a few staples like eggs, garlic or onions and matches appear.", more: "more" },
    es: { hint: "Toca los ingredientes que tienes, o busca en la lista completa.", yours: "Tus ingredientes", results: "Mejores coincidencias", missing: "Faltan", min: "min", veg: "Vegetariano", vegan: "Vegano", any: "Cualquiera", anytime: "Cualquier tiempo", u30: "Menos de 30 min", u60: "Menos de 1 hora", none: "Aún no hay coincidencias. Añade básicos como huevos, ajo o cebolla y aparecerán.", more: "más" },
    id: { hint: "Ketuk bahan yang Anda miliki, atau cari di daftar lengkap.", yours: "Bahan Anda", results: "Kecocokan terbaik", missing: "Kurang", min: "mnt", veg: "Vegetarian", vegan: "Vegan", any: "Semua", anytime: "Waktu berapa pun", u30: "Di bawah 30 mnt", u60: "Di bawah 1 jam", none: "Belum ada kecocokan. Tambahkan bahan pokok seperti telur, bawang putih, atau bawang merah.", more: "lagi" },
    pt: { hint: "Toque nos ingredientes que você tem, ou busque na lista completa.", yours: "Seus ingredientes", results: "Melhores combinações", missing: "Faltam", min: "min", veg: "Vegetariano", vegan: "Vegano", any: "Qualquer", anytime: "Qualquer tempo", u30: "Menos de 30 min", u60: "Menos de 1 hora", none: "Ainda não há combinações. Adicione básicos como ovos, alho ou cebola e elas aparecem.", more: "mais" },
    fr: { hint: "Touchez les ingrédients que vous avez, ou cherchez dans la liste complète.", yours: "Vos ingrédients", results: "Meilleures correspondances", missing: "Manquants", min: "min", veg: "Végétarien", vegan: "Végan", any: "Tous", anytime: "Tout temps", u30: "Moins de 30 min", u60: "Moins d'1 heure", none: "Pas encore de correspondance. Ajoutez des bases comme des œufs, de l'ail ou des oignons.", more: "de plus" },
    de: { hint: "Tippen Sie die Zutaten an, die Sie haben, oder suchen Sie in der vollen Liste.", yours: "Ihre Zutaten", results: "Beste Treffer", missing: "Fehlt", min: "Min.", veg: "Vegetarisch", vegan: "Vegan", any: "Alle", anytime: "Beliebig", u30: "Unter 30 Min.", u60: "Unter 1 Stunde", none: "Noch keine Treffer. Fügen Sie Basics wie Eier, Knoblauch oder Zwiebeln hinzu.", more: "weitere" },
    hi: { hint: "जो सामग्री आपके पास है उसे टैप करें, या पूरी सूची में खोजें.", yours: "आपकी सामग्री", results: "सबसे अच्छे मेल", missing: "बाकी", min: "मिनट", veg: "शाकाहारी", vegan: "वीगन", any: "कोई भी", anytime: "कोई भी समय", u30: "30 मिनट से कम", u60: "1 घंटे से कम", none: "अभी कोई मेल नहीं. अंडे, लहसुन या प्याज़ जैसी बुनियादी चीज़ें जोड़ें और मेल दिखेंगे.", more: "और" },
    it: { hint: "Tocca gli ingredienti che hai, o cerca nell'elenco completo.", yours: "I tuoi ingredienti", results: "Migliori corrispondenze", missing: "Mancano", min: "min", veg: "Vegetariano", vegan: "Vegano", any: "Qualsiasi", anytime: "Qualsiasi tempo", u30: "Sotto i 30 min", u60: "Sotto 1 ora", none: "Ancora nessuna corrispondenza. Aggiungi basi come uova, aglio o cipolle e appariranno.", more: "altri" },
    ja: { hint: "持っている材料をタップするか、全リストから検索してください。", yours: "あなたの材料", results: "おすすめのマッチ", missing: "不足", min: "分", veg: "ベジタリアン", vegan: "ヴィーガン", any: "すべて", anytime: "時間指定なし", u30: "30分未満", u60: "1時間未満", none: "まだマッチがありません。卵、にんにく、玉ねぎなどの定番を加えると表示されます。", more: "件" },
    ar: { hint: "انقر المكونات التي لديك، أو ابحث في القائمة الكاملة.", yours: "مكوناتك", results: "أفضل التطابقات", missing: "ينقص", min: "دقيقة", veg: "نباتي", vegan: "نباتي صرف", any: "الكل", anytime: "أي وقت", u30: "أقل من 30 دقيقة", u60: "أقل من ساعة", none: "لا تطابقات بعد. أضف أساسيات مثل البيض أو الثوم أو البصل وستظهر التطابقات.", more: "أخرى" },
    tr: { hint: "Elinizdeki malzemelere dokunun veya tam listede arayın.", yours: "Malzemeleriniz", results: "En iyi eşleşmeler", missing: "Eksik", min: "dk", veg: "Vejetaryen", vegan: "Vegan", any: "Tümü", anytime: "Herhangi bir süre", u30: "30 dk altı", u60: "1 saat altı", none: "Henüz eşleşme yok. Yumurta, sarımsak veya soğan gibi temel malzemeler ekleyin.", more: "tane daha" },
    vi: { hint: "Chạm vào nguyên liệu bạn có, hoặc tìm trong danh sách đầy đủ.", yours: "Nguyên liệu của bạn", results: "Món phù hợp nhất", missing: "Thiếu", min: "phút", veg: "Chay (trứng sữa)", vegan: "Thuần chay", any: "Tất cả", anytime: "Mọi thời gian", u30: "Dưới 30 phút", u60: "Dưới 1 giờ", none: "Chưa có món nào phù hợp. Thêm nguyên liệu cơ bản như trứng, tỏi hoặc hành tây để xem kết quả.", more: "nữa" },
    ko: { hint: "가지고 있는 재료를 누르거나 전체 목록에서 검색하세요.", yours: "내 재료", results: "가장 잘 맞는 요리", missing: "부족", min: "분", veg: "베지테리언", vegan: "비건", any: "전체", anytime: "시간 무관", u30: "30분 미만", u60: "1시간 미만", none: "아직 맞는 요리가 없습니다. 달걀, 마늘, 양파 같은 기본 재료를 더해 보세요.", more: "개 더" },
    ru: { hint: "Отметьте ингредиенты, которые у вас есть, или ищите в полном списке.", yours: "Ваши ингредиенты", results: "Лучшие совпадения", missing: "Не хватает", min: "мин", veg: "Вегетарианское", vegan: "Веганское", any: "Всё", anytime: "Любое время", u30: "До 30 мин", u60: "До 1 часа", none: "Пока нет совпадений. Добавьте базу вроде яиц, чеснока или лука, и совпадения появятся.", more: "ещё" },
    nl: { hint: "Tik de ingrediënten aan die je hebt, of zoek in de volledige lijst.", yours: "Jouw ingrediënten", results: "Beste matches", missing: "Mist", min: "min", veg: "Vegetarisch", vegan: "Veganistisch", any: "Alles", anytime: "Elke tijd", u30: "Onder 30 min", u60: "Onder 1 uur", none: "Nog geen matches. Voeg basics toe zoals eieren, knoflook of uien en de matches verschijnen.", more: "meer" }
  };
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0];
    return STR[l] ? l : "en";
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function init() {
    var root = document.getElementById("cr-cookwith");
    if (!root) return;
    var code = lang(), t = STR[code];
    var chipsEl = root.querySelector("#cw-chips"), pickedEl = root.querySelector("#cw-picked"),
        q = root.querySelector("#cw-q"), found = root.querySelector("#cw-found"),
        diet = root.querySelector("#cw-diet"), time = root.querySelector("#cw-time"),
        out = root.querySelector("#cw-out");
    var prefix = root.getAttribute("data-prefix") || "";
    Promise.all([
      fetch("/tools/pantry-" + code + ".json").then(function (r) { return r.json(); }),
      fetch("/tools/recipes-" + code + ".json").then(function (r) { return r.json(); })
    ]).then(function (ds) {
      var PAN = ds[0], REC = ds[1];
      var picked = {};
      function chip(id, on) {
        return '<button type="button" class="cw-chip' + (on ? " on" : "") + '" data-id="' + id + '">' + esc(PAN.names[id]) + "</button>";
      }
      chipsEl.innerHTML = PAN.pick.slice(0, 48).map(function (id) { return chip(id, false); }).join("");
      function renderPicked() {
        var ids = Object.keys(picked);
        pickedEl.innerHTML = ids.length ? '<span class="lab">' + t.yours + ':</span> ' +
          ids.map(function (id) { return chip(id, true); }).join("") : "";
      }
      function rank() {
        var P = Object.keys(picked).map(Number);
        if (!P.length) { out.innerHTML = '<p class="cw-none">' + t.none + "</p>"; return; }
        var rows = [];
        Object.keys(PAN.dishes).forEach(function (slug) {
          var d = PAN.dishes[slug];
          if (diet.value === "1" && d.v < 1) return;
          if (diet.value === "2" && d.v < 2) return;
          if (time.value !== "0" && (d.t === null || d.t > Number(time.value))) return;
          var set = {}, total = 0;
          d.i.forEach(function (id) { if (id >= 0 && !set[id]) { set[id] = 1; total += 1; } });
          var hit = 0, miss = [];
          Object.keys(set).forEach(function (id) {
            if (picked[id]) hit += 1; else miss.push(Number(id));
          });
          if (!hit) return;
          rows.push({ slug: slug, cov: hit / total, miss: miss, mins: d.t });
        });
        rows.sort(function (a, b) {
          return b.cov - a.cov || a.miss.length - b.miss.length ||
            ((a.mins === null ? 99999 : a.mins) - (b.mins === null ? 99999 : b.mins));
        });
        if (!rows.length) { out.innerHTML = '<p class="cw-none">' + t.none + "</p>"; return; }
        out.innerHTML = '<h2>' + t.results + "</h2>" + rows.slice(0, 30).map(function (r) {
          var missNames = r.miss.slice(0, 6).map(function (id) { return esc(PAN.names[id]); }).join(", ");
          if (r.miss.length > 6) missNames += " +" + (r.miss.length - 6) + " " + t.more;
          return '<div class="cw-row"><a class="cw-title" href="https://clearrecipe.net/' +
            (prefix ? prefix + "/" : "") + r.slug + '/">' + esc(REC[r.slug][0]) + "</a>" +
            '<span class="cw-pct">' + Math.round(r.cov * 100) + "%</span>" +
            (r.mins ? '<span class="cw-min">' + r.mins + " " + t.min + "</span>" : "") +
            (r.miss.length ? '<div class="cw-miss">' + t.missing + ": " + missNames + "</div>" : "") +
            "</div>";
        }).join("");
      }
      function toggle(id) { if (picked[id]) delete picked[id]; else picked[id] = 1; renderPicked(); rank(); syncChips(); }
      function syncChips() {
        root.querySelectorAll(".cw-chip[data-id]").forEach(function (b) {
          b.classList.toggle("on", !!picked[b.getAttribute("data-id")]);
        });
      }
      root.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest(".cw-chip[data-id]") : null;
        if (b) toggle(b.getAttribute("data-id"));
      });
      q.addEventListener("input", function () {
        var s = q.value.trim().toLowerCase();
        if (s.length < 2) { found.innerHTML = ""; return; }
        var hits = PAN.pick.filter(function (id) { return PAN.names[id].toLowerCase().indexOf(s) >= 0; }).slice(0, 12);
        found.innerHTML = hits.map(function (id) { return chip(id, !!picked[id]); }).join("");
      });
      diet.addEventListener("change", rank);
      time.addEventListener("change", rank);
      root.querySelectorAll("[data-lab]").forEach(function (el) {
        var k = el.getAttribute("data-lab"); if (t[k]) el.textContent = t[k];
      });
      renderPicked(); rank();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
