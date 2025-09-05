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

      const yearBlocks = (data.years || [])
        .map((y) => {
          const items = (y.items || [])
            .map((p) => {
              const authors = (p.authors || [])
                .map((a) => highlight(a))
                .join(", ");
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
                  <h4 class="pub-title">${p.title || ""}</h4>
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

  // Render publications from JSON after the section HTML is injected
  await renderPublications();

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
