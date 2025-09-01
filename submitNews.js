document.getElementById("newsForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const newsData = {
        title: document.getElementById("title").value,
        source: document.getElementById("source").value,
        description: document.getElementById("description").value,
        image_url: document.getElementById("image_url").value,
        article_url: document.getElementById("article_url").value,
        rumor_id: document.getElementById("rumor_id").value  // new field
    };

    try {
        const response = await fetch("http://127.0.0.1:3000/add-news", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newsData),
        });

        const result = await response.json();
        alert(result.message);

        // Reload news after submission
        fetchNews();
    } catch (error) {
        console.error("Error adding news:", error);
    }
});
