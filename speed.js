// clear recipe corner: the speed bolt only, all the way in the bottom right of every page. Same bolt as clr.fm.
// Click the speed button for a popup with this page's real load numbers.
// Rule 13 (Dave, Oct 18 2026): under 0.50s super fast (half second stretch goal),
// 0.50 to 0.75s fast (inside the 0.75 second rule), over 0.75s slower than the rule.
// The verdict keys on the visitor's own unrounded load time.
(function () {
  var css = ''
    + '.crcorner{position:fixed;right:4px;bottom:4px;z-index:9998;display:flex;align-items:center;gap:9px;font-family:ui-monospace,Menlo,monospace;}'
    + '.crspeedbtn{background:none;border:none;cursor:pointer;padding:2px;color:#bdc1c6;display:flex;align-items:center;}'
    + '.crspeedbtn:hover{color:#5f6368;}'
    + '.crspeedbtn svg{width:22.75px;height:22.75px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}'
    + '.crhist{font-size:16px;text-decoration:none;opacity:1;line-height:1;padding:6px;}'
    + '.crhist:hover{opacity:1;}'
    + '.crpop{position:fixed;right:8px;bottom:34px;z-index:9999;width:196px;max-width:calc(100vw - 28px);background:#fff;border:1px solid #e8eaed;border-radius:10px;box-shadow:0 6px 22px rgba(32,33,36,.18);padding:11px 13px 9px;font-family:arial,sans-serif;color:#202124;display:none;}'
    + '.crpop.open{display:block;}'
    + '.crpop .crhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}'
    + '.crpop .crtitle{font-family:ui-monospace,Menlo,monospace;font-size:9px;letter-spacing:1.5px;color:#70757a;text-transform:uppercase;display:flex;align-items:center;gap:7px;}'
    + '.crpop .crx{background:none;border:none;font-size:14px;color:#9aa0a6;cursor:pointer;line-height:1;padding:2px;}'
    + '.crpop .crbig{font-size:31px;font-weight:700;letter-spacing:-1px;line-height:1.1;}'
    + '.crpop .crbig small{font-size:12px;font-weight:400;color:#5f6368;letter-spacing:0;}'
    + '.crpop .crrows{font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#3c4043;margin-top:6px;}'
    + '.crpop .crrows div{display:flex;justify-content:space-between;padding:2.5px 0;border-bottom:1px solid #f1f3f4;}'
    + '.crpop .crverdict{font-size:11px;margin-top:7px;display:flex;align-items:center;gap:7px;}'
    + '.crg{display:inline-block;width:7px;height:7px;border-radius:50%;flex:none;}'
    + '.crg-up{background:#34a853;} .crg-down{background:#d93025;}'
    + '.crg-warn{width:0;height:0;border-radius:0;background:none;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:7.5px solid #f9ab00;}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var corner = document.createElement('div');
  corner.className = 'crcorner';
  corner.innerHTML = ''
    + '<button class="crspeedbtn" id="crspeedbtn" type="button" title="How fast did this page load?" aria-label="Page speed">'
    + '<svg viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L9.8 22 19 10h-6.5L13 2z"/></svg>'
    + '</button>';
  document.body.appendChild(corner);

  var pop = document.createElement('div');
  pop.className = 'crpop';
  pop.id = 'crpop';
  pop.innerHTML = ''
    + '<div class="crhead"><span class="crtitle"><span class="crg crg-up" id="crdot"></span> Page speed</span>'
    + '<button class="crx" id="crx" type="button" aria-label="Close">×</button></div>'
    + '<div class="crbig"><span id="crbig">…</span> <small>seconds</small></div>'
    + '<div class="crrows">'
    + '<div><span>DNS</span><span id="crdns">…</span></div>'
    + '<div><span>Connect</span><span id="crconn">…</span></div>'
    + '<div><span>First byte</span><span id="crttfb">…</span></div>'
    + '<div><span>DOM ready</span><span id="crdom">…</span></div>'
    + '<div><span>Page size</span><span id="crsize">…</span></div>'
    + '<div><span>Requests</span><span id="crreq">…</span></div>'
    + '</div>'
    + '<div class="crverdict" id="crverdict"></div>';
  document.body.appendChild(pop);

  function fmtKB(b) {
    if (!b) return 'n/a';
    if (b < 1024) return b + ' B';
    var kb = b / 1024;
    return (kb >= 100 ? Math.round(kb) : kb.toFixed(1)) + ' KB';
  }
  function fill() {
    var navs = performance.getEntriesByType('navigation');
    if (!navs.length) return;
    var n = navs[0];
    var secs = n.duration / 1000;
    document.getElementById('crbig').textContent = secs.toFixed(2);
    document.getElementById('crdns').textContent = Math.max(0, Math.round(n.domainLookupEnd - n.domainLookupStart)) + ' ms';
    document.getElementById('crconn').textContent = Math.max(0, Math.round(n.connectEnd - n.connectStart)) + ' ms';
    document.getElementById('crttfb').textContent = Math.round(n.responseStart - n.startTime) + ' ms';
    document.getElementById('crdom').textContent = (n.domContentLoadedEventEnd / 1000).toFixed(2) + ' s';
    var res = performance.getEntriesByType('resource');
    var bytes = (n.transferSize || n.encodedBodySize || 0);
    res.forEach(function (r) { bytes += (r.transferSize || r.encodedBodySize || 0); });
    document.getElementById('crsize').textContent = fmtKB(bytes);
    document.getElementById('crreq').textContent = String(res.length + 1);
    var dot = document.getElementById('crdot');
    var verdict = document.getElementById('crverdict');
    if (secs < 0.5) {
      dot.className = 'crg crg-up';
      verdict.innerHTML = '<span class="crg crg-up"></span> Super fast. Inside our half second stretch goal.';
    } else if (secs <= 0.75) {
      dot.className = 'crg crg-up';
      verdict.innerHTML = '<span class="crg crg-up"></span> Fast. Inside our 0.75 second rule.';
    } else {
      dot.className = 'crg crg-warn';
      verdict.innerHTML = '<span class="crg crg-warn"></span> Slower than our 0.75 second rule.';
    }
  }
  var btn = document.getElementById('crspeedbtn');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    fill();
    pop.classList.toggle('open');
  });
  document.getElementById('crx').addEventListener('click', function () { pop.classList.remove('open'); });
  document.addEventListener('click', function (e) {
    if (pop.classList.contains('open') && !pop.contains(e.target)) pop.classList.remove('open');
  });
})();
