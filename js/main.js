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
  await Promise.all([
    loadSection("include-header", "pages/header.html"),
    loadSection("include-home", "pages/home.html"),
    loadSection("include-news", "pages/news.html"),
    loadSection("include-publications", "pages/publications.html"),
    loadSection("include-projects", "pages/projects.html"),
    loadSection("include-members", "pages/members.html"),
    loadSection("include-contact", "pages/contact.html"),
    loadSection("include-footer", "pages/footer.html"),
  ]);

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

//adding parallax effect to the home section title
//learned this from Youtube Tutorial - by Online Tutorials - https://www.youtube.com/watch?v=1wfeqDyMUx4

let titleOne = document.getElementById("title-one");
let titleTwo = document.getElementById("title-two");

// window.addEventListener("scroll", function () {
//   let value = window.scrollY;

//   titleOne.style.right = value * 0.5 + "px";
//   titleTwo.style.left = value * 0.5 + "px";
// });
