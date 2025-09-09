const BASE_URL = "https://api.github.com/search/repositories?q=user:kyawsoe-dev+fork:true&sort=updated&per_page=10&type=All";
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

    if (repos.length === 0) {
    hasMore = false;
    const endMessage = document.createElement("p");
    endMessage.className = "text-center text-muted my-3";
    endMessage.innerText = "No more repositories";
    container.appendChild(endMessage);
    } else {
    repos.forEach((repo) => {
        const repoCard = document.createElement("div");
        repoCard.className = "repo-card";
        repoCard.innerHTML = `
        <a href="${repo.html_url}" class="share-btn" target="_blank">
            <i class="fas fa-external-link-alt"></i>
        </a>
        <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
        <p>${repo.description || "No description"}</p>
        <div class="repo-meta">
            ⭐ ${repo.stargazers_count} &nbsp;&nbsp; 
            <i class="fas fa-code-branch"></i> ${repo.forks_count} &nbsp;&nbsp; 
            🕒 Updated ${new Date(repo.updated_at).toLocaleDateString()}
        </div>`;
        container.appendChild(repoCard);
    });

    currentPage++;
    }
    isLoading = false;
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