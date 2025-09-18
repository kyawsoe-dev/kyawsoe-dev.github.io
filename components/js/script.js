function loadComponent(id, file) {
  fetch(file)
    .then((res) => res.text())
    .then((data) => {
      document.getElementById(id).innerHTML = data;

      if (file.includes("navbar.html")) {
        initThemeToggle();
        setActiveNav();
        initSidebarClose();
      }

      if (file.includes("footer.html")) {
        setYear();
      }
    })
    .catch((err) => console.error("Error loading " + file, err));
}

function initSidebarClose() {
  const closeBtn = document.querySelector(".mobile-sidebar .close-btn");
  const sidebar = document.getElementById("navbarNav");
  const navLinks = document.querySelectorAll(".mobile-sidebar .nav-link");

  if (!sidebar) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("show");
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        sidebar.classList.remove("show");
      }
    });
  });

  document.addEventListener("click", (event) => {
    const isClickInside = sidebar.contains(event.target) || event.target.closest(".navbar-toggler");
    if (!isClickInside && window.innerWidth < 768) {
      sidebar.classList.remove("show");
    }
  });
}


function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const body = document.body;
  const savedTheme = localStorage.getItem("theme") || "dark";

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    body.classList.remove("dark-mode");
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
}

function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("#navbar .nav-link");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.classList.remove("text-dark", "text-secondary");
    } else {
      link.classList.remove("active");
      link.classList.remove("text-secondary");
      link.classList.add("text-dark");
    }
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("Service Worker registered:", reg))
      .catch((err) => console.log("Service Worker failed:", err));
  });
}

function setYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

loadComponent("navbar", "components/navbar.html");
loadComponent("footer", "components/footer.html");
