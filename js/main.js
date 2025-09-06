async function loadSection(targetId, file) {
  try {
    const resp = await fetch(file);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} loading ${file}`);
    const html = await resp.text();
    document.getElementById(targetId).innerHTML = html;
  } catch (e) {
    console.error("Failed to load", file, e);
  }
}

async function init() {
  async function renderPublications() {
    const root = document.getElementById("pubs-root");
    if (!root) return;
    try {
      const resp = await fetch("data/publications.json");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const highlight = (name) =>
        name === data.highlightAuthor
          ? `<span class="author-highlight">${name}</span>`
          : name;

      const pickTitleHref = (p) => {
        if (p.titleHref) return p.titleHref;
        const links = Array.isArray(p.links) ? p.links : [];
        const byLabel = (label) =>
          links.find(
            (l) => l && typeof l.label === "string" && l.label.toLowerCase() === label && l.href
          )?.href;
        return (
          byLabel("project") ||
          byLabel("pdf") ||
          links.find((l) => l && l.href)?.href ||
          null
        );
      };

      const yearBlocks = (data.years || [])
        .map((y) => {
          const items = (y.items || [])
            .map((p) => {
              const authors = (p.authors || [])
                .map((a) => highlight(a))
                .join(", ");
              const titleHref = pickTitleHref(p);
              const titleHTML = titleHref
                ? `<a class="pub-title-link" href="${titleHref}" target="_blank" rel="noopener">${p.title || ""}</a>`
                : (p.title || "");
              const links = (p.links || [])
                .map((l) => {
                  if (!l || !l.label) return "";
                  const href = l.href || "#";
                  const cls = l.alt ? "pub-badge alt" : "pub-badge";
                  return `<a class="${cls}" href="${href}">${l.label}</a>`;
                })
                .join("\n");
              return `
                <article class="pub-item">
                  <div class="pub-venue">${p.venue || ""}</div>
                  <h4 class="pub-title">${titleHTML}</h4>
                  <p class="pub-authors">${authors}</p>
                  <div class="pub-links">${links}</div>
                </article>`;
            })
            .join("\n");

          return `
            <div class="pub-year reveal">
              <h3 class="pub-year-title">${y.year}</h3>
              <div class="pub-grid">${items}</div>
            </div>`;
        })
        .join("\n");

      root.innerHTML = yearBlocks;
      if (typeof window.reveal === "function") {
        window.reveal();
      }
    } catch (e) {
      console.error("Failed to render publications:", e);
      root.innerHTML = "<p style=\"color:#999\">Failed to load publications.</p>";
    }
  }
  await Promise.all([
    loadSection("include-header", "pages/header.html"),
    loadSection("include-home", "pages/home.html"),
    loadSection("include-news", "pages/news.html"),
    loadSection("include-publications", "pages/publications.html"),
    loadSection("include-projects", "pages/projects.html"),
    loadSection("include-members", "pages/members.html"),
    loadSection("include-contact", "pages/contact.html"),
    // loadSection("include-footer", "pages/footer.html"),
  ]);

  // Set current date only for the hiring news item after news section is injected
  (function setHiringNewsDate() {
    const badges = document.querySelectorAll(".news-badge.is-hiring");
    if (!badges.length) return;
    const now = new Date();
    const day = now.getDate().toString();
    const monthShort = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear().toString();
    const monthLong = now.toLocaleString("en-US", { month: "long" });

    badges.forEach((badge) => {
      const meta = badge.closest(".news-meta");
      if (!meta) return;
      const c = meta.querySelector(".news-date");
      if (!c) return;
      const d = c.querySelector(".day");
      const m = c.querySelector(".month");
      const y = c.querySelector(".year");
      if (d) d.textContent = day;
      if (m) m.textContent = monthShort;
      if (y) y.textContent = year;
      c.setAttribute(
        "aria-label",
        `Published on ${monthLong} ${day}, ${year}`
      );
    });
  })();

  // Render publications from JSON after the section HTML is injected
  await renderPublications();

  // Bind expandable member cards after members section is injected
  (function bindMemberCards() {
    const cards = document.querySelectorAll('#our-members .grid-item');
    if (!cards.length) return;
    cards.forEach((card) => {
      card.classList.add('expandable');
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      const extra = card.querySelector('.member-extra');
      const toggleBtn = card.querySelector('.member-toggle');
      const setExpanded = (expanded) => {
        if (expanded) {
          card.classList.add('expanded');
        } else {
          card.classList.remove('expanded');
        }
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(expanded));
        if (extra) extra.setAttribute('aria-hidden', String(!expanded));
        if (toggleBtn) toggleBtn.textContent = expanded ? 'Collapse' : 'More';
      };
      const toggle = () => setExpanded(!card.classList.contains('expanded'));

      // Entire card toggles unless clicking an interactive element
      card.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.member-links a')) return; // ignore social links
        if (target.closest('.member-toggle')) return;  // handled below
        toggle();
      });
      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
          e.preventDefault();
          toggle();
        }
      });
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggle();
        });
      }
      // initialize hidden state
      setExpanded(false);
    });
  })();

  // After HTML is injected, bind scripts that depend on DOM
  // --- Reveal on scroll
  window.addEventListener("scroll", reveal);
  function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
      var windowheight = window.innerHeight;
      var revealtop = reveals[i].getBoundingClientRect().top;
      var revealpoint = 150;
      if (revealtop < windowheight - revealpoint) {
        reveals[i].classList.add("active");
      } else {
        reveals[i].classList.remove("active");
      }
    }
  }

  // --- Mobile nav toggle
  window.toggleMenu = function () {
    var x = document.getElementById("nav-links-sub");
    if (x && x.style.left != "0px") {
      x.style.left = "0px";
      document.body.style.overflowY = "hidden";
    } else if (x) {
      x.style.left = "-200px";
      document.body.style.overflowY = "visible";
    }
  };

  // --- Parallax title
  let titleOne = document.getElementById("title-one");
  let titleTwo = document.getElementById("title-two");
  window.addEventListener("scroll", function () {
    let value = window.scrollY;
    if (titleOne) titleOne.style.right = value * 0.5 + "px";
    if (titleTwo) titleTwo.style.left = value * 0.5 + "px";
  });

  // Trigger initial reveal state
  reveal();
}

document.addEventListener("DOMContentLoaded", init);

// --- Original inline script from your page ---
window.addEventListener("scroll", reveal);

function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowheight = window.innerHeight;
    var revealtop = reveals[i].getBoundingClientRect().top;
    var revealpoint = 150;

    if (revealtop < windowheight - revealpoint) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

//adding responsive nav for mobile screens
//learned this from Youtube Tutorial - by Easy Tutorials - https://www.youtube.com/watch?v=oYRda7UtuhA

function toggleMenu() {
  var x = document.getElementById("nav-links-sub");
  if (x.style.left != "0px") {
    x.style.left = "0px";
    document.body.style.overflowY = "hidden";
  } else {
    x.style.left = "-200px";
    document.body.style.overflowY = "visible";
  }
}
