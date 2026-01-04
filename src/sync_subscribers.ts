import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1TPvbUn1p4eaJxhkEKAdLJkWYW3IKH-jNcJfTgBqakYw/export?format=csv';
const DB_PATH = path.join(__dirname, 'data', 'subscribers.json');

export async function syncSubscribers() {
    console.log('🔄 Syncing subscribers from Google Sheet...');

    try {
        const response = await axios.get(SHEET_CSV_URL);
        const csvData = response.data;

        // Parse CSV (Skip header row if needed, but usually simple enough to just filter)
        // Assuming column A (index 0) is Timestamp, and B (index 1) is Email
        const records = parse(csvData, {
            columns: false,
            skip_empty_lines: true
        });

        // Current DB
        let currentSubscribers: string[] = [];
        if (fs.existsSync(DB_PATH)) {
            currentSubscribers = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        }

        let newCount = 0;

        // Process records (skip header if it exists)
        records.forEach((row: any[], index: number) => {
            // Usually row[1] is the email in a standard Google Form sheet (Timestamp, Email)
            // We'll look for the first column that looks like an email to be safe
            const email = row.find((cell: string) => cell.includes('@') && cell.includes('.'));

            if (email) {
                const cleanEmail = email.trim().toLowerCase();
                if (!currentSubscribers.includes(cleanEmail)) {
                    currentSubscribers.push(cleanEmail);
                    newCount++;
                }
            }
        });

        // Save back to DB
        fs.writeFileSync(DB_PATH, JSON.stringify(currentSubscribers, null, 2));
        console.log(`✅ Sync complete. Added ${newCount} new subscribers. Total: ${currentSubscribers.length}`);

        return currentSubscribers;

    } catch (error) {
        console.error('❌ Error syncing subscribers:', error);
        return [];
    }
}

if (require.main === module) {
    syncSubscribers();
}
