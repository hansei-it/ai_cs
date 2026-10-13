// 데스크톱 목차: 햄버거 버튼으로 접고 펴기, 경계선을 끌어 폭 조절.
// 접힘 상태와 폭은 브라우저에 기억한다. 모바일은 Material 기본 서랍 메뉴를 쓴다.
(() => {
  const desktop = matchMedia("(min-width: 76.25em)");
  const root = document.documentElement;
  const MIN = 200;
  const MAX = 560;
  const STEP = 16;

  const store = {
    get: key => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
  };

  const setWidth = px => {
    px = Math.round(Math.min(MAX, Math.max(MIN, px)));
    root.style.setProperty("--cs-nav-width", `${px}px`);
    return px;
  };

  const saved = Number(store.get("cs.navWidth"));
  if (saved) setWidth(saved);
  if (store.get("cs.navCollapsed") === "1") root.classList.add("cs-nav-collapsed");

  // 데스크톱에서는 햄버거 버튼이 서랍 대신 목차를 접고 편다.
  document.addEventListener("click", e => {
    if (!desktop.matches || !e.target.closest('.md-header__button[for="__drawer"]')) return;
    e.preventDefault();
    const collapsed = root.classList.toggle("cs-nav-collapsed");
    store.set("cs.navCollapsed", collapsed ? "1" : "0");
  });

  const sidebar = document.querySelector(".md-sidebar--primary");
  if (!sidebar) return;

  const bar = document.createElement("div");
  bar.className = "cs-resizer";
  bar.tabIndex = 0;
  bar.title = "끌어서 목차 폭 조절 · 더블클릭하면 기본 폭";
  bar.setAttribute("role", "separator");
  bar.setAttribute("aria-orientation", "vertical");
  bar.setAttribute("aria-label", "목차 폭 조절");
  sidebar.after(bar);

  bar.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    e.preventDefault();
    const left = sidebar.getBoundingClientRect().left;
    let width = sidebar.getBoundingClientRect().width;
    const move = ev => { width = setWidth(ev.clientX - left); };
    bar.setPointerCapture(e.pointerId);
    root.classList.add("cs-resizing");
    bar.addEventListener("pointermove", move);
    bar.addEventListener("lostpointercapture", () => {
      bar.removeEventListener("pointermove", move);
      root.classList.remove("cs-resizing");
      store.set("cs.navWidth", width);
    }, { once: true });
  });

  bar.addEventListener("dblclick", () => {
    root.style.removeProperty("--cs-nav-width");
    store.set("cs.navWidth", "");
  });

  bar.addEventListener("keydown", e => {
    const step = { ArrowLeft: -STEP, ArrowRight: STEP }[e.key];
    if (!step) return;
    e.preventDefault();
    store.set("cs.navWidth", setWidth(sidebar.getBoundingClientRect().width + step));
  });
})();
