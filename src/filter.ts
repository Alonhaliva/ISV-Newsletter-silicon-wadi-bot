import { Article } from './fetcher';

export function filterAndSelectArticles(articles: Article[]): Article[] {
    // 1. Deduplicate by title (fuzzy match or exact)
    const uniqueArticles = articles.filter((article, index, self) =>
        index === self.findIndex((t) => (
            t.title === article.title
        ))
    );

    // 2. Score/Filter based on keywords (Boost specific topics)
    // Since the RSS query is already specific, we mainly need to ensure quality.
    // We can prioritize items that have "Startup", "Raise", "Acquire", "Round", "IPO" in title.

    const keywords = ['Startup', 'Raise', 'Round', 'Acquire', 'Merger', 'IPO', 'Exit', 'Billion', 'Million', 'Tech', 'AI', 'Cyber'];

    const scoredArticles = uniqueArticles.map(article => {
        let score = 0;
        const titleLower = article.title.toLowerCase();
        keywords.forEach(keyword => {
            if (titleLower.includes(keyword.toLowerCase())) {
                score += 1;
            }
        });
        return { ...article, score };
    });

    // 3. Sort by score desc, then by date (most recent first)
    scoredArticles.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // 4. Return top 5
    return scoredArticles.slice(0, 5);
}
