async function fetchNews() {
    try {
        const response = await fetch('http://127.0.0.1:3000/news');
        const data = await response.json();

        if (data.articles) {
            displayNews(data.articles);
        } else {
            console.error("Error: No news articles found.");
        }
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function displayNews(articles) {
    const newsContainer = document.getElementById("news-container");
    newsContainer.innerHTML = ""; // Clear old news

    articles.forEach(article => {
        const newsItem = document.createElement("div");
        newsItem.classList.add("news-item");

        newsItem.innerHTML = `
            <h3>${article.title}</h3>
            <img src="${article.image_url || article.image}" alt="News Image" style="width:100%;">
            <p>${article.description || "No description available."}</p>
            <a href="${article.article_url || article.url}" target="_blank">Read more</a>
            <hr>
        `;

        newsContainer.appendChild(newsItem);
    });
}

// Fetch news when page loads
document.addEventListener("DOMContentLoaded", fetchNews);
