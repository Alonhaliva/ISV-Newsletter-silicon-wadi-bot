import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser();

export interface Article {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    source?: string;
}

export interface StockData {
    symbol: string;
    price: string;
    change: string;
    changePercent: string;
    isUp: boolean;
}

export async function fetchNews(): Promise<Article[]> {
    const sources = [
        { name: 'Times of Israel', url: 'https://www.timesofisrael.com/topic/high-tech/feed/' },
        { name: 'Jerusalem Post', url: 'https://rss.jpost.com/rss/rsstechandstartups' },
        { name: 'Globes', url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=1725' }
    ];

    try {
        const feedPromises = sources.map(async (source) => {
            try {
                const feed = await parser.parseURL(source.url);
                return feed.items.map(item => ({
                    title: item.title || 'No Title',
                    link: item.link || '#',
                    pubDate: item.pubDate || new Date().toISOString(),
                    contentSnippet: (item.contentSnippet || item.summary || '').substring(0, 400),
                    source: source.name
                }));
            } catch (e) {
                console.error(`Error fetching from ${source.name}:`, e);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        // Flatten array
        const allArticles = results.flat();
        return allArticles;

    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

import fs from 'fs';
import path from 'path';

export interface Hook {
    type: string;
    content: string;
    author?: string;
}

export interface Slang {
    word: string;
    definition: string;
    usage: string;
}

export interface Spotlight {
    name: string;
    company: string;
    vision: string;
    connection: string;
}

export function getDailyHook(): Hook {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/hooks.json'), 'utf-8'));
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return data.hooks[dayOfYear % data.hooks.length];
    } catch (err) {
        return { type: 'Fact', content: 'Israel remains a global leader in cybersecurity and AI innovation.' };
    }
}

export function getDailySlang(): Slang {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/slang.json'), 'utf-8'));
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return data.slang[dayOfYear % data.slang.length];
    } catch (err) {
        return { word: 'Chutzpah', definition: 'Audacity.', usage: 'Israeli tech is built on chutzpah.' };
    }
}

export function getDailySpotlight(): Spotlight {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/spotlights.json'), 'utf-8'));
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return data.spotlights[dayOfYear % data.spotlights.length];
    } catch (err) {
        return {
            name: 'Israeli Innovator',
            company: 'Startup Nation',
            vision: 'Building the future.',
            connection: 'Bridging Israel and SV.'
        };
    }
}

export async function fetchStocks(): Promise<StockData[]> {
    const symbols = ['WIX', 'CYBR', 'MNDY'];
    const results: StockData[] = [];

    for (const symbol of symbols) {
        try {
            const { data } = await axios.get(`https://finance.yahoo.com/quote/${symbol}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);

            const price = $('fin-streamer[data-field="regularMarketPrice"]').first().text();
            const rawChange = $('fin-streamer[data-field="regularMarketChange"]').first().text();
            const changePercent = $('fin-streamer[data-field="regularMarketChangePercent"]').first().text();

            const isUp = !rawChange.startsWith('-');

            results.push({
                symbol,
                price: price || 'N/A',
                change: rawChange || '0.00',
                changePercent: changePercent || '(0.00%)',
                isUp
            });
        } catch (err) {
            console.error(`Error fetching stock ${symbol}:`, err);
            results.push({ symbol, price: '---', change: '0.00', changePercent: '(---)', isUp: true });
        }
    }
    return results;
}
