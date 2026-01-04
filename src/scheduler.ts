import cron from 'node-cron';
import { fetchNews, fetchStocks, getDailyHook, getDailySlang, getDailySpotlight } from './fetcher';
import { filterAndSelectArticles } from './filter';
import { sendNewsletter } from './mailer';
import { syncSubscribers } from './sync_subscribers';
import dotenv from 'dotenv';
dotenv.config();

console.log('Silicon Wadi Dispatch Bot started...');
console.log('Current Time:', new Date().toString());

async function runTask() {
    console.log('Running scheduled task: Fetching news, stocks, and hooks...');
    try {
        const allArticles = await fetchNews();
        console.log(`Fetched ${allArticles.length} articles.`);

        const selectedArticles = filterAndSelectArticles(allArticles);
        console.log(`Selected ${selectedArticles.length} articles for newsletter.`);

        const stockData = await fetchStocks();
        console.log(`Fetched data for ${stockData.length} stocks.`);

        const hook = getDailyHook();
        console.log('Picked daily hook.');

        const slang = getDailySlang();
        console.log('Picked daily slang.');

        const spotlight = getDailySpotlight();
        console.log('Picked daily spotlight.');

        // SYNC SUBSCRIBERS
        const subscribers = await syncSubscribers();

        // Add the test email from .env to the list so you always get it too
        if (process.env.EMAIL_TO) {
            subscribers.push(process.env.EMAIL_TO);
        }

        if (selectedArticles.length > 0) {
            if (subscribers.length === 0) {
                console.log('No subscribers to send to.');
            } else {
                await sendNewsletter(subscribers, selectedArticles, stockData, hook, slang, spotlight);
                console.log('Newsletter sending process completed.');
            }
        } else {
            console.log('No articles found matching criteria today.');
        }
    } catch (error) {
        console.error('Error in task execution:', error);
    }
}

// Validation run on startup (optional, commented out to avoid spamming on restart)
// runTask(); 

// Schedule task for 8:00 AM every day
// Cron format: Minute Hour Day Month DayOfWeek
// 8:00 AM
cron.schedule('0 8 * * *', () => {
    console.log('Triggering daily newsletter request at 8:00 AM');
    runTask();
}, {
    scheduled: true,
    timezone: "America/Los_Angeles" // California time
});

console.log('Scheduler is active. Waiting for 8:00 AM America/Los_Angeles time.');
