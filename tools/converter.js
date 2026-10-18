/* Clear Recipe cooking measurement converter (Oct 17, Dave's 30-day plan
   tools). Drives the /converter/ landings in all 15 languages. Ingredient
   densities are read from the page's own density table (data-g = grams
   per cup), so the table and the tool can never disagree. Pure
   client-side: no tool state ever gets its own URL. */
(function () {
  "use strict";
  var STR = {
    en: { amount: "Amount", from: "From", to: "To", ingredient: "Ingredient (for volume to weight)", none: "None", approx: "Approximate, based on standard baking weights.", need: "Pick an ingredient above to convert between volume and weight.", cups: "cups", tbsp: "tablespoons", tsp: "teaspoons", floz: "fluid ounces", pint: "pints", quart: "quarts" },
    es: { amount: "Cantidad", from: "De", to: "A", ingredient: "Ingrediente (para volumen a peso)", none: "Ninguno", approx: "Aproximado, según pesos estándar de repostería.", need: "Elige un ingrediente para convertir entre volumen y peso.", cups: "tazas", tbsp: "cucharadas", tsp: "cucharaditas", floz: "onzas líquidas", pint: "pintas", quart: "cuartos" },
    id: { amount: "Jumlah", from: "Dari", to: "Ke", ingredient: "Bahan (untuk volume ke berat)", none: "Tidak ada", approx: "Perkiraan, berdasarkan berat baku standar.", need: "Pilih bahan di atas untuk mengonversi volume dan berat.", cups: "cangkir", tbsp: "sendok makan", tsp: "sendok teh", floz: "ons cair", pint: "pint", quart: "kuart" },
    pt: { amount: "Quantidade", from: "De", to: "Para", ingredient: "Ingrediente (para volume a peso)", none: "Nenhum", approx: "Aproximado, com base em pesos padrão de confeitaria.", need: "Escolha um ingrediente para converter entre volume e peso.", cups: "xícaras", tbsp: "colheres de sopa", tsp: "colheres de chá", floz: "onças líquidas", pint: "pints", quart: "quartos" },
    fr: { amount: "Quantité", from: "De", to: "Vers", ingredient: "Ingrédient (pour volume en poids)", none: "Aucun", approx: "Approximatif, d'après les poids standard de pâtisserie.", need: "Choisissez un ingrédient pour convertir entre volume et poids.", cups: "tasses", tbsp: "cuillères à soupe", tsp: "cuillères à café", floz: "onces liquides", pint: "pintes", quart: "quarts" },
    de: { amount: "Menge", from: "Von", to: "Nach", ingredient: "Zutat (für Volumen zu Gewicht)", none: "Keine", approx: "Ungefähr, nach üblichen Backgewichten.", need: "Wählen Sie eine Zutat, um zwischen Volumen und Gewicht umzurechnen.", cups: "Tassen", tbsp: "Esslöffel", tsp: "Teelöffel", floz: "Flüssigunzen", pint: "Pints", quart: "Quarts" },
    hi: { amount: "मात्रा", from: "से", to: "में", ingredient: "सामग्री (आयतन से वज़न के लिए)", none: "कोई नहीं", approx: "अनुमानित, मानक बेकिंग वज़न के आधार पर.", need: "आयतन और वज़न के बीच बदलने के लिए सामग्री चुनें.", cups: "कप", tbsp: "बड़े चम्मच", tsp: "छोटे चम्मच", floz: "द्रव औंस", pint: "पिंट", quart: "क्वार्ट" },
    it: { amount: "Quantità", from: "Da", to: "A", ingredient: "Ingrediente (da volume a peso)", none: "Nessuno", approx: "Approssimativo, secondo i pesi standard di pasticceria.", need: "Scegli un ingrediente per convertire tra volume e peso.", cups: "tazze", tbsp: "cucchiai", tsp: "cucchiaini", floz: "once liquide", pint: "pinte", quart: "quarti" },
    ja: { amount: "量", from: "変換元", to: "変換先", ingredient: "材料 (体積と重さの変換用)", none: "なし", approx: "標準的な製菓重量に基づく目安です。", need: "体積と重さを変換するには材料を選んでください。", cups: "カップ", tbsp: "大さじ", tsp: "小さじ", floz: "液量オンス", pint: "パイント", quart: "クォート" },
    ar: { amount: "الكمية", from: "من", to: "إلى", ingredient: "المكوّن (للحجم إلى الوزن)", none: "لا شيء", approx: "تقريبي، بناءً على أوزان الخبز القياسية.", need: "اختر مكوّنًا للتحويل بين الحجم والوزن.", cups: "أكواب", tbsp: "ملاعق كبيرة", tsp: "ملاعق صغيرة", floz: "أونصات سائلة", pint: "باينت", quart: "كوارت" },
    tr: { amount: "Miktar", from: "Birim", to: "Birime", ingredient: "Malzeme (hacimden ağırlığa)", none: "Yok", approx: "Yaklaşık değer, standart pişirme ağırlıklarına göre.", need: "Hacim ile ağırlık arasında çevirmek için bir malzeme seçin.", cups: "su bardağı", tbsp: "yemek kaşığı", tsp: "çay kaşığı", floz: "sıvı ons", pint: "pint", quart: "kuart" },
    vi: { amount: "Lượng", from: "Từ", to: "Sang", ingredient: "Nguyên liệu (để đổi thể tích sang khối lượng)", none: "Không", approx: "Giá trị ước tính, theo trọng lượng làm bánh tiêu chuẩn.", need: "Chọn một nguyên liệu để đổi giữa thể tích và khối lượng.", cups: "cốc", tbsp: "thìa canh", tsp: "thìa cà phê", floz: "ounce chất lỏng", pint: "pint", quart: "quart" },
    ko: { amount: "양", from: "변환 전", to: "변환 후", ingredient: "재료 (부피와 무게 변환용)", none: "없음", approx: "표준 베이킹 무게 기준의 대략적인 값입니다.", need: "부피와 무게를 변환하려면 재료를 선택하세요.", cups: "컵", tbsp: "큰술", tsp: "작은술", floz: "액량 온스", pint: "파인트", quart: "쿼트" },
    ru: { amount: "Количество", from: "Из", to: "В", ingredient: "Ингредиент (для объёма в вес)", none: "Нет", approx: "Приблизительно, по стандартным пекарским весам.", need: "Выберите ингредиент, чтобы переводить между объёмом и весом.", cups: "чашки", tbsp: "столовые ложки", tsp: "чайные ложки", floz: "жидкие унции", pint: "пинты", quart: "кварты" },
    nl: { amount: "Hoeveelheid", from: "Van", to: "Naar", ingredient: "Ingrediënt (voor volume naar gewicht)", none: "Geen", approx: "Bij benadering, op basis van standaard bakgewichten.", need: "Kies een ingrediënt om tussen volume en gewicht om te rekenen.", cups: "kopjes", tbsp: "eetlepels", tsp: "theelepels", floz: "fluid ounces", pint: "pints", quart: "quarts" }
  };
  function uiLang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0];
    return STR[l] ? l : "en";
  }
  var VOL = { ml: 1, l: 1000, tsp: 5, tbsp: 15, floz: 29.5735, cup: 240, pint: 480, quart: 960 };
  var MASS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
  function fmt(v) {
    if (!isFinite(v)) return "";
    var a = Math.abs(v);
    var r = a >= 100 ? Math.round(v) : a >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100;
    return String(r);
  }
  function init() {
    var root = document.getElementById("cr-converter");
    if (!root) return;
    var t = STR[uiLang()];
    var amt = root.querySelector("#cv-amt"), from = root.querySelector("#cv-from"),
        to = root.querySelector("#cv-to"), ing = root.querySelector("#cv-ing"),
        out = root.querySelector("#cv-out"), note = root.querySelector("#cv-note");
    function unitName(u) {
      if (u === "cup") return t.cups; if (u === "tbsp") return t.tbsp; if (u === "tsp") return t.tsp;
      if (u === "floz") return t.floz; if (u === "pint") return t.pint; if (u === "quart") return t.quart;
      return u;
    }
    function fillUnits(sel, withTemp) {
      var groups = [["ml", "l", "tsp", "tbsp", "floz", "cup", "pint", "quart"], ["g", "kg", "oz", "lb"]];
      groups.forEach(function (g) { g.forEach(function (u) {
        var o = document.createElement("option"); o.value = u; o.textContent = unitName(u); sel.appendChild(o);
      }); });
      if (withTemp) ["°C", "°F"].forEach(function (u) {
        var o = document.createElement("option"); o.value = u; o.textContent = u; sel.appendChild(o);
      });
    }
    fillUnits(from, true); fillUnits(to, true);
    from.value = "cup"; to.value = "g";
    var none = document.createElement("option");
    none.value = ""; none.textContent = t.none; ing.appendChild(none);
    document.querySelectorAll("table.density tbody tr").forEach(function (tr) {
      var o = document.createElement("option");
      o.value = tr.getAttribute("data-g");
      o.textContent = tr.cells[0].textContent;
      ing.appendChild(o);
    });
    root.querySelectorAll("[data-lab]").forEach(function (el) {
      var k = el.getAttribute("data-lab"); if (t[k]) el.textContent = t[k];
    });
    function kind(u) { return u === "°C" || u === "°F" ? "temp" : VOL.hasOwnProperty(u) ? "vol" : "mass"; }
    function calc() {
      var v = parseFloat((amt.value || "").replace(",", "."));
      if (isNaN(v)) { out.textContent = ""; note.textContent = ""; return; }
      var fu = from.value, tu = to.value, fk = kind(fu), tk = kind(tu), res = null, extra = "";
      if (fk === "temp" && tk === "temp") {
        res = fu === tu ? v : fu === "°C" ? v * 9 / 5 + 32 : (v - 32) * 5 / 9;
      } else if (fk === "vol" && tk === "vol") {
        res = v * VOL[fu] / VOL[tu];
      } else if (fk === "mass" && tk === "mass") {
        res = v * MASS[fu] / MASS[tu];
      } else if ((fk === "vol" && tk === "mass") || (fk === "mass" && tk === "vol")) {
        var gpc = parseFloat(ing.value);
        if (!gpc) { out.textContent = ""; note.textContent = t.need; return; }
        var grams = fk === "vol" ? v * VOL[fu] / 240 * gpc : v * MASS[fu];
        res = tk === "mass" ? grams / MASS[tu] : grams / gpc * 240 / VOL[tu];
        extra = " " + t.approx;
      }
      if (res === null) { out.textContent = ""; note.textContent = ""; return; }
      out.textContent = fmt(v) + " " + unitName(fu) + " = " + fmt(res) + " " + unitName(tu);
      note.textContent = extra.replace(/^ /, "");
    }
    [amt, from, to, ing].forEach(function (el) {
      el.addEventListener("input", calc); el.addEventListener("change", calc);
    });
    amt.value = "1"; calc();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
