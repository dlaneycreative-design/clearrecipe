/* Clear Recipe shopping-list generator (Oct 17, Dave's 30-day plan).
   Add recipes (each scalable), and their ingredients are combined into
   one check-off list: same ingredient + compatible unit family sums,
   volumes merge through ml and weights through grams using canonical
   ingredient ids from pantry-{lang}.json. Pure client-side state. */
(function () {
  "use strict";
  var STR = {
    en: { add: "Add", yourlist: "Your shopping list", clear: "Clear list", empty: "Add a recipe or two and your combined list appears here, with shared ingredients merged.", pick: "Choose recipes", recipes: "Recipes", cup: "cups", tbsp: "tbsp", tsp: "tsp", note: "Quantities combine where units are compatible. Tap an item to check it off." },
    es: { add: "Añadir", yourlist: "Tu lista de compras", clear: "Vaciar la lista", empty: "Añade una receta o dos y tu lista combinada aparecerá aquí, con los ingredientes compartidos fusionados.", pick: "Elige recetas", recipes: "Recetas", cup: "tazas", tbsp: "cdas.", tsp: "cdtas.", note: "Las cantidades se combinan cuando las unidades son compatibles. Toca un artículo para tacharlo." },
    id: { add: "Tambah", yourlist: "Daftar belanja Anda", clear: "Bersihkan daftar", empty: "Tambahkan satu atau dua resep dan daftar gabungan Anda muncul di sini, dengan bahan yang sama digabung.", pick: "Pilih resep", recipes: "Resep", cup: "cangkir", tbsp: "sdm", tsp: "sdt", note: "Jumlah digabung bila satuannya cocok. Ketuk item untuk mencentangnya." },
    pt: { add: "Adicionar", yourlist: "Sua lista de compras", clear: "Limpar a lista", empty: "Adicione uma ou duas receitas e sua lista combinada aparece aqui, com ingredientes compartilhados somados.", pick: "Escolha receitas", recipes: "Receitas", cup: "xícaras", tbsp: "col. sopa", tsp: "col. chá", note: "As quantidades somam quando as unidades são compatíveis. Toque em um item para riscá-lo." },
    fr: { add: "Ajouter", yourlist: "Votre liste de courses", clear: "Vider la liste", empty: "Ajoutez une ou deux recettes et votre liste combinée apparaît ici, ingrédients partagés fusionnés.", pick: "Choisissez des recettes", recipes: "Recettes", cup: "tasses", tbsp: "c. à soupe", tsp: "c. à café", note: "Les quantités se combinent quand les unités sont compatibles. Touchez un article pour le cocher." },
    de: { add: "Hinzufügen", yourlist: "Ihre Einkaufsliste", clear: "Liste leeren", empty: "Fügen Sie ein oder zwei Rezepte hinzu, und Ihre kombinierte Liste erscheint hier, gemeinsame Zutaten zusammengefasst.", pick: "Rezepte wählen", recipes: "Rezepte", cup: "Tassen", tbsp: "EL", tsp: "TL", note: "Mengen werden kombiniert, wo die Einheiten passen. Tippen Sie einen Punkt an, um ihn abzuhaken." },
    hi: { add: "जोड़ें", yourlist: "आपकी खरीदारी सूची", clear: "सूची साफ़ करें", empty: "एक या दो रेसिपी जोड़ें और आपकी संयुक्त सूची यहाँ दिखेगी, साझा सामग्री मिली हुई.", pick: "रेसिपी चुनें", recipes: "रेसिपी", cup: "कप", tbsp: "बड़े चम्मच", tsp: "छोटे चम्मच", note: "जहाँ इकाइयाँ मेल खाती हैं वहाँ मात्राएँ जुड़ जाती हैं. किसी आइटम को टैप करके काटें." },
    it: { add: "Aggiungi", yourlist: "La tua lista della spesa", clear: "Svuota la lista", empty: "Aggiungi una o due ricette e la tua lista combinata appare qui, con gli ingredienti condivisi sommati.", pick: "Scegli le ricette", recipes: "Ricette", cup: "tazze", tbsp: "cucchiai", tsp: "cucchiaini", note: "Le quantità si sommano quando le unità sono compatibili. Tocca un articolo per spuntarlo." },
    ja: { add: "追加", yourlist: "買い物リスト", clear: "リストを消す", empty: "レシピを1つか2つ追加すると、共通の材料がまとめられたリストがここに表示されます。", pick: "レシピを選ぶ", recipes: "レシピ", cup: "カップ", tbsp: "大さじ", tsp: "小さじ", note: "単位が合う量は合計されます。項目をタップするとチェックできます。" },
    ar: { add: "إضافة", yourlist: "قائمة التسوق", clear: "مسح القائمة", empty: "أضف وصفة أو وصفتين وستظهر قائمتك المدمجة هنا، مع دمج المكونات المشتركة.", pick: "اختر الوصفات", recipes: "وصفات", cup: "أكواب", tbsp: "ملعقة كبيرة", tsp: "ملعقة صغيرة", note: "تُجمع الكميات عندما تتوافق الوحدات. انقر أي عنصر لشطبه." },
    tr: { add: "Ekle", yourlist: "Alışveriş listeniz", clear: "Listeyi temizle", empty: "Bir iki tarif ekleyin, birleşik listeniz ortak malzemeler birleştirilmiş olarak burada görünsün.", pick: "Tarifleri seçin", recipes: "Tarifler", cup: "su bardağı", tbsp: "yemek kaşığı", tsp: "çay kaşığı", note: "Birimler uyumlu olduğunda miktarlar birleşir. Bir öğeye dokunarak işaretleyin." },
    vi: { add: "Thêm", yourlist: "Danh sách mua sắm của bạn", clear: "Xóa danh sách", empty: "Thêm một hoặc hai công thức và danh sách gộp của bạn sẽ hiện ở đây, nguyên liệu chung được cộng lại.", pick: "Chọn công thức", recipes: "Công thức", cup: "cốc", tbsp: "thìa canh", tsp: "thìa cà phê", note: "Số lượng được cộng khi đơn vị tương thích. Chạm vào một mục để đánh dấu." },
    ko: { add: "추가", yourlist: "장보기 목록", clear: "목록 지우기", empty: "레시피를 한두 개 추가하면 공통 재료가 합쳐진 목록이 여기에 나타납니다.", pick: "레시피 선택", recipes: "레시피", cup: "컵", tbsp: "큰술", tsp: "작은술", note: "단위가 맞으면 양이 합쳐집니다. 항목을 누르면 체크됩니다." },
    ru: { add: "Добавить", yourlist: "Ваш список покупок", clear: "Очистить список", empty: "Добавьте рецепт или два, и ваш общий список появится здесь, с объединёнными общими ингредиентами.", pick: "Выберите рецепты", recipes: "Рецепты", cup: "чашки", tbsp: "ст. ложки", tsp: "ч. ложки", note: "Количества объединяются, где единицы совместимы. Нажмите на пункт, чтобы вычеркнуть." },
    nl: { add: "Toevoegen", yourlist: "Jouw boodschappenlijst", clear: "Lijst wissen", empty: "Voeg een of twee recepten toe en je gecombineerde lijst verschijnt hier, gedeelde ingrediënten samengevoegd.", pick: "Kies recepten", recipes: "Recepten", cup: "kopjes", tbsp: "el", tsp: "tl", note: "Hoeveelheden worden gecombineerd waar eenheden passen. Tik een item aan om het af te vinken." }
  };
  var VOLM = { cup: 240, cups: 240, tsp: 5, tbsp: 15, ml: 1, l: 1000,
    taza: 240, tazas: 240, cucharada: 15, cucharadas: 15, cucharadita: 5, cucharaditas: 5,
    cangkir: 240, "sendok": null,
    xícara: 240, xícaras: 240, colher: 15, colheres: 15,
    tasse: 240, tasses: 240,
    tassen: 240,
    tazze: 240, tazza: 240, cucchiaio: 15, cucchiai: 15, cucchiaino: 5, cucchiaini: 5,
    bardak: 240, bardağı: 240, kaşığı: 5, kaşık: 15,
    cốc: 240, thìa: 15, muỗng: 15,
    컵: 240, 큰술: 15, 작은술: 5, "カッ": 200,
    чашка: 240, чашки: 240, ложка: 15, ложки: 15,
    kopje: 240, kopjes: 240, eetlepel: 15, eetlepels: 15, theelepel: 5, theelepels: 5,
    el: 15, tl: 5, sdm: 15, sdt: 5, "大さじ": 15, "小さじ": 5, कप: 240 };
  var MASSG = { g: 1, gram: 1, grams: 1, gramas: 1, gramo: 1, gramos: 1, kg: 1000,
    oz: 28.35, ounce: 28.35, ounces: 28.35, lb: 453.6, libra: 453.6, libras: 453.6,
    onça: 28.35, onças: 28.35, onza: 28.35, onzas: 28.35, グラム: 1 };
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0];
    return STR[l] ? l : "en";
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function num(tok) { var v = parseFloat(String(tok).replace(",", ".")); return isNaN(v) ? null : v; }
  function init() {
    var root = document.getElementById("cr-shoppinglist");
    if (!root || !window.CR_SCALE) return;
    var code = lang(), t = STR[code];
    var q = root.querySelector("#sl-q"), pick = root.querySelector("#sl-pick"),
        addBtn = root.querySelector("#sl-add"), chosenEl = root.querySelector("#sl-chosen"),
        listEl = root.querySelector("#sl-list"), clearBtn = root.querySelector("#sl-clear");
    var prefix = root.getAttribute("data-prefix") || "";
    Promise.all([
      fetch("/tools/recipes-" + code + ".json").then(function (r) { return r.json(); }),
      fetch("/tools/pantry-" + code + ".json").then(function (r) { return r.json(); })
    ]).then(function (ds) {
      var REC = ds[0], PAN = ds[1];
      var chosen = []; // {slug, f}
      function fill() {
        var s = q.value.trim().toLowerCase();
        var keys = Object.keys(REC).filter(function (k) {
          return REC[k][0].toLowerCase().indexOf(s) >= 0;
        });
        keys.sort(function (a, b) { return REC[a][0].localeCompare(REC[b][0]); });
        pick.innerHTML = keys.map(function (k) {
          return '<option value="' + k + '">' + esc(REC[k][0]) + "</option>";
        }).join("");
      }
      function render() {
        chosenEl.innerHTML = chosen.map(function (c, i) {
          return '<div class="sl-chosen"><a href="https://clearrecipe.net/' +
            (prefix ? prefix + "/" : "") + c.slug + '/">' + esc(REC[c.slug][0]) + "</a>" +
            [0.5, 1, 2].map(function (f) {
              return '<button type="button" data-i="' + i + '" data-f="' + f + '"' +
                (c.f === f ? ' class="on"' : "") + ">" + (f === 0.5 ? "½×" : f + "×") + "</button>";
            }).join("") +
            '<button type="button" data-rm="' + i + '">×</button></div>';
        }).join("");
        renderList();
      }
      function renderList() {
        if (!chosen.length) { listEl.innerHTML = '<p class="cw-none">' + t.empty + "</p>"; return; }
        var groups = {};
        chosen.forEach(function (c) {
          var dish = REC[c.slug], ids = PAN.dishes[c.slug] ? PAN.dishes[c.slug].i : [];
          dish[2].forEach(function (line, idx) {
            var cid = idx < ids.length ? ids[idx] : -1;
            var p = window.CR_SCALE.parseLead(line);
            var name = cid >= 0 ? PAN.names[cid] : null;
            if (!p) {
              var k0 = "raw:" + (name || line.toLowerCase());
              groups[k0] = groups[k0] || { label: name || line, qty: null };
              return;
            }
            var qty = p.lo * c.f;
            var restToks = p.rest.trim().split(/\s+/);
            var unit = (restToks[0] || "").toLowerCase().replace(/[.,]$/, "");
            var fam = null, base = null;
            if (VOLM.hasOwnProperty(unit) && VOLM[unit]) { fam = "vol"; base = qty * VOLM[unit]; }
            else if (MASSG.hasOwnProperty(unit)) { fam = "mass"; base = qty * MASSG[unit]; }
            var key = cid >= 0
              ? (fam ? "c" + cid + ":" + fam : "c" + cid + ":u:" + unit)
              : "raw:" + line.toLowerCase();
            if (!groups[key]) groups[key] = { label: name || line, fam: fam, base: 0, unit: unit, qty: 0 };
            if (fam) groups[key].base += base;
            else { groups[key].qty += qty; groups[key].unit = unit; }
          });
        });
        var keys = Object.keys(groups).sort(function (a, b) {
          return groups[a].label.localeCompare(groups[b].label);
        });
        listEl.innerHTML = "<h2>" + t.yourlist + "</h2><p class='cw-min'>" + t.note + "</p>" +
          keys.map(function (k) {
            var g = groups[k], amt = "";
            if (g.fam === "vol") {
              amt = g.base >= 240 ? window.CR_SCALE.fmt(g.base / 240) + " " + t.cup
                : g.base >= 15 ? window.CR_SCALE.fmt(g.base / 15) + " " + t.tbsp
                : window.CR_SCALE.fmt(g.base / 5) + " " + t.tsp;
            } else if (g.fam === "mass") {
              amt = g.base >= 1000 ? window.CR_SCALE.fmt(g.base / 1000) + " kg" : Math.round(g.base) + " g";
            } else if (g.qty) {
              amt = window.CR_SCALE.fmt(g.qty) + (g.unit ? " " + g.unit : "");
            }
            return '<label class="sl-item"><input type="checkbox"> <span>' +
              (amt ? "<b>" + esc(amt) + "</b> " : "") + esc(g.label) + "</span></label>";
          }).join("");
      }
      addBtn.textContent = t.add;
      clearBtn.textContent = t.clear;
      q.setAttribute("placeholder", t.pick);
      addBtn.addEventListener("click", function () {
        var slug = pick.value;
        if (!slug) return;
        if (!chosen.some(function (c) { return c.slug === slug; })) chosen.push({ slug: slug, f: 1 });
        render();
      });
      chosenEl.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("button") : null;
        if (!b) return;
        if (b.hasAttribute("data-rm")) chosen.splice(Number(b.getAttribute("data-rm")), 1);
        else chosen[Number(b.getAttribute("data-i"))].f = parseFloat(b.getAttribute("data-f"));
        render();
      });
      clearBtn.addEventListener("click", function () { chosen = []; render(); });
      q.addEventListener("input", fill);
      fill(); render();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
