(function(){
  "use strict";

  // Clickjacking protection: GitHub Pages can't send X-Frame-Options / frame-ancestors,
  // so refuse to run inside someone else's frame.
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = "none"; }
    return;
  }
  document.documentElement.classList.add("js");

  // Email is assembled here so simple spam bots can't scrape it from the HTML.
  var EMAIL = ["contact.zaryaenterprise", "gmail.com"].join("@");
  document.querySelectorAll(".js-email").forEach(function(a){
    a.textContent = EMAIL;
    a.href = "mailto:" + EMAIL;
  });

  document.getElementById("yr").textContent = new Date().getFullYear();

  // mobile menu
  var btn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
  function closeMenu(){ menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function(){
    var open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", function(e){ if (e.target.tagName === "A") closeMenu(); });
  document.addEventListener("click", function(e){
    if (menu.classList.contains("open") && !menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

  // category links pre-select the form (only accepts values that exist in the list)
  var sel = document.getElementById("category");
  document.querySelectorAll("[data-cat]").forEach(function(a){
    a.addEventListener("click", function(){
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === a.dataset.cat) sel.selectedIndex = i;
      setTimeout(function(){ document.getElementById("items").focus({preventScroll:true}); }, 500);
    });
  });

  // copy email
  document.querySelectorAll("[data-copy-email]").forEach(function(b){
    b.addEventListener("click", function(){
      var done = function(){ b.textContent = "Copied ✓"; setTimeout(function(){ b.textContent = "Copy"; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, function(){});
    });
  });

  // "needed by" can't be in the past
  var when = document.getElementById("when");
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  when.min = t.toISOString().slice(0, 10);

  // quote form -> pre-filled email (nothing is sent to or stored on any server)
  var LIMITS = { name: 80, company: 120, items: 1200 };
  function clean(s, max){
    // strip control characters (except newlines in the item list) and cap the length
    return String(s).replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim().slice(0, max);
  }
  var lastSubmit = 0;
  document.getElementById("quoteForm").addEventListener("submit", function(e){
    e.preventDefault();
    var f = e.target, err = document.getElementById("formErr");
    var name = clean(f.elements.name.value, LIMITS.name).replace(/\n/g, " ");
    var company = clean(f.elements.company.value, LIMITS.company).replace(/\n/g, " ");
    var items = clean(f.elements.items.value, LIMITS.items);
    // only accept dropdown values that are actually in the list
    var category = f.elements.category.options[f.elements.category.selectedIndex].text;
    var city = f.elements.city.options[f.elements.city.selectedIndex].text;
    var date = /^\d{4}-\d{2}-\d{2}$/.test(f.elements.when.value) ? f.elements.when.value : "";

    if (!name || !company || !items) { err.style.display = "block"; return; }
    err.style.display = "none";
    if (Date.now() - lastSubmit < 3000) return; // ignore rapid double-taps
    lastSubmit = Date.now();

    var subject = "Quotation request: " + category + " (" + company + ")";
    var body = "Hi Zarya Enterprises team,\n\nPlease share a quotation for the following:\n\n" + items +
      "\n\nCategory: " + category +
      "\nDelivery city: " + city +
      (date ? "\nNeeded by: " + date : "") +
      "\n\nRegards,\n" + name + "\n" + company;
    window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  // hide floating "Get a quote" button while the hero or the form is on screen
  var floatBtn = document.querySelector(".float");
  if ("IntersectionObserver" in window && floatBtn) {
    var visible = {};
    var fo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ visible[en.target.id || "hero"] = en.isIntersecting; });
      floatBtn.classList.toggle("hide", !!(visible.quote || visible.hero));
    });
    fo.observe(document.getElementById("quote"));
    fo.observe(document.querySelector(".hero"));
  }

  // reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {threshold:.12});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });
  }
})();
