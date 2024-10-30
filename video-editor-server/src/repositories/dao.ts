import * as sqlite from 'sqlite3';
import fs from 'fs';
import path from 'path';

const sqlite3 = sqlite.verbose();

const dir = path.resolve(__dirname, '../../db'); // Use absolute path

// Create the directory if it does not exist
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const dbPath = path.join(dir, 'sqlite.db');
console.log('Database path:', dbPath); // Log the database path

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } 
});

// Define a generic type for database rows
interface DatabaseRow {
    [key: string]: any; // Allow any structure for rows
}

export default class TDao {
    // Setup the database for development
    static setupDbForDev(): void {
        db.serialize(() => {
            // Drop Tables:
            const dropLinksTable = "DROP TABLE IF EXISTS links";
            db.run(dropLinksTable);
            const dropVideosTable = "DROP TABLE IF EXISTS videos";
            db.run(dropVideosTable);
            
            // Create Tables:
            const createLinksTable = "CREATE TABLE links (id TEXT PRIMARY KEY, videoId INTEGER NOT NULL, temporaryLink TEXT NOT NULL, expiryTime DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (videoId) REFERENCES videos (id) ON DELETE CASCADE);";
            db.run(createLinksTable);

            const createVideosTable = "CREATE TABLE IF NOT EXISTS videos (id TEXT PRIMARY KEY, fileName TEXT NOT NULL, filePath TEXT NOT NULL, thumbnail TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)";
            db.run(createVideosTable);
        });
    }

    // Teardown the database
    static teardownDb(): void {
        // Drop all tables to clean up the database after tests
        try {
            db.serialize(() => {
                const dropLinksTable = "DROP TABLE IF EXISTS links";
                db.run(dropLinksTable);
                const dropVideosTable = "DROP TABLE IF EXISTS videos";
                db.run(dropVideosTable);
            });
        } catch (err) {
            console.error('Error during database teardown:', err);
        }
    }

    // Fetch all records
    static all<T extends DatabaseRow>(stmt: string, params: any[]): Promise<T[]> {
        return new Promise((res, rej) => {
            db.all(stmt, params, (error, result: T[]) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        });
    }

    // Fetch a single record
    static get<T extends DatabaseRow>(stmt: string, params: any[]): Promise<T | undefined> {
        return new Promise((res, rej) => {
            db.get(stmt, params, (error, result: T) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        });
    }

    // Run a statement
    static run(stmt: string, params: any[]): Promise<void> {
        return new Promise((res, rej) => {
            db.run(stmt, params, (error) => {
                if (error) {
                    return rej(error.message);
                }
                return res(); // Resolve with no value on success
            });
        });
    }
}
