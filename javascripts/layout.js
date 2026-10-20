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

  // 데스크톱에서 현재 항목을 다시 누르면, 그 아래 페이지 목차를 섹션처럼 접고 편다.
  const current = sidebar.querySelector(".md-nav__item--active > a.md-nav__link--active");
  const toc = current && current.parentElement.querySelector(":scope > .md-nav--secondary li");
  if (toc) {
    const item = current.parentElement;
    const icon = document.createElement("span");
    icon.className = "md-nav__icon md-icon cs-toc-icon";
    current.append(icon);
    current.setAttribute("aria-expanded", "true");
    current.title = "누르면 이 페이지 목차를 접고 편다";
    current.addEventListener("click", e => {
      if (!desktop.matches) return;
      e.preventDefault();
      const collapsed = item.classList.toggle("cs-toc-collapsed");
      current.setAttribute("aria-expanded", String(!collapsed));
    });
  }

  // 섹션 이름은 섹션 소개 페이지로 가는 링크다(navigation.indexes). 데스크톱에서 지금 있는 섹션의 이름을
  // 누르면 페이지를 다시 열지 않고 옆 화살표처럼 섹션을 접고 편다. 다른 섹션의 이름은 그 섹션 소개 페이지로 간다.
  sidebar.querySelectorAll(".md-nav__item--nested.md-nav__item--active > .md-nav__container > a.md-nav__link").forEach(link => {
    const arrow = link.parentElement.querySelector(":scope > label[for]");
    if (!arrow) return;
    link.title = "누르면 이 섹션을 접고 편다";
    link.addEventListener("click", e => {
      if (!desktop.matches) return;
      e.preventDefault();
      arrow.click();
    });
  });

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
