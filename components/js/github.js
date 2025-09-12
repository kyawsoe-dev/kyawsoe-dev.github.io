const BASE_URL =
  "https://api.github.com/search/repositories?q=user:kyawsoe-dev+fork:true&sort=updated&per_page=10&type=All";
let currentPage = 1;
let isLoading = false;
let hasMore = true;

async function fetchRepositories(page) {
  try {
    const response = await fetch(`${BASE_URL}&page=${page}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}

async function displayRepos() {
  if (isLoading || !hasMore) return;
  isLoading = true;

  const container = document.getElementById("repos");
  const loading = document.createElement("div");
  loading.id = "loading";
  loading.className = "text-center my-3";
  loading.innerText = "Loading...";
  container.appendChild(loading);

  const repos = await fetchRepositories(currentPage);
  document.getElementById("loading").remove();

  const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Ruby: "#701516",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    "C#": "#178600",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Rust: "#dea584",
    Kotlin: "#F18E33",
    Dart: "#00B4AB",
    Swift: "#ffac45",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Dockerfile: "#0db7ed",
  };

  if (!repos || repos.length === 0) {
    hasMore = false;
    const endMessage = document.createElement("p");
    endMessage.className = "text-center text-muted my-3";
    endMessage.innerText = "No more repositories";
    container.appendChild(endMessage);
  } else {
    repos.forEach((repo) => {
      const lang = repo.language || "JavaScript";
      const color = languageColors[lang] || languageColors["JavaScript"];

      const repoCard = document.createElement("div");
      repoCard.className = "repo-card";

      repoCard.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <a href="${
            repo.html_url
          }" class="share-btn" target="_blank" title="Open repository">
            <i class="fas fa-external-link-alt"></i>
          </a>
          <div style="flex:1">
            <h4 class="repo-title">
              <span class="repo-icon mt-1" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11a.5.5 0 0 1-.757.429L8 10.101l-5.243 3.828A.5.5 0 0 1 2 13.5v-11Zm2.5-1.5A1.5 1.5 0 0 0 3 2.5v10.566l4.743-3.465a.5.5 0 0 1 .514 0L13 13.066V2.5A1.5 1.5 0 0 0 11.5 1h-7Z"/>
                </svg>
              </span>

              <a class="text-primary" href="${
                repo.html_url
              }" target="_blank" rel="noopener noreferrer">${repo.name}</a>
            </h4>
            <p class="repo-description">${
              repo.description ? escapeHtml(repo.description) : "No description"
            }</p>

            <div class="repo-meta">
              <span class="repo-lang" title="${lang}">
                <span class="lang-dot" style="background:${color}"></span>
                ${lang}
              </span>

              <span>⭐ ${repo.stargazers_count ?? 0}</span>
              <span><i class="fas fa-code-branch" aria-hidden="true"></i> ${
                repo.forks_count ?? 0
              }</span>
              <span>Updated ${new Date(
                repo.updated_at
              ).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;

      container.appendChild(repoCard);
    });

    currentPage++;
  }

  isLoading = false;
}

function escapeHtml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    displayRepos();
  }
});

async function loadContributions(year = "last") {
  const summary = document.getElementById("contrib-summary");
  const container = document.getElementById("contrib-graph");
  const yearFilter = document.getElementById("year-filter");

  summary.innerText = "Loading contributions...";
  container.innerHTML = "";

  try {
    const resp = await fetch(
      `https://github-contributions-api.jogruber.de/v4/kyawsoe-dev?y=${year}`
    );
    const data = await resp.json();

    if (!data || !Array.isArray(data.contributions)) {
      summary.innerText = "No contributions available";
      return;
    }

    if (!yearFilter.options.length) {
      const lastOpt = document.createElement("option");
      lastOpt.value = "last";
      lastOpt.text = "Last 12 months";
      lastOpt.selected = true;
      yearFilter.appendChild(lastOpt);

      const currentYear = new Date().getFullYear();
      for (let y = currentYear; y >= 2020; y--) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.text = y;
        if (String(y) === String(year)) opt.selected = true;
        yearFilter.appendChild(opt);
      }
    } else {
      yearFilter.value = year;
    }

    container.innerHTML = "";
    let total = 0;

    data.contributions.forEach((c) => {
      total += c.count;
      const cell = document.createElement("div");
      cell.className = `contrib-cell level-${c.level}`;
      cell.title = `${c.count} contributions on ${c.date}`;
      container.appendChild(cell);
    });

    summary.innerText =
      year === "last"
        ? `${total} contributions in the last 12 months`
        : `${total} contributions in ${year}`;
  } catch (err) {
    console.log("Error loading contributions:", err);
    summary.innerText = "Unable to load contributions";
  }
}

document.getElementById("year-filter").addEventListener("change", (e) => {
  loadContributions(e.target.value);
});

displayRepos();
loadContributions("last");
