import * as sqlite from 'sqlite3'
const sqlite3 = sqlite.verbose();
const db = new sqlite3.Database('./db/sqlite.db');

export default class {

    static setupDbForDev() {
        db.serialize(function () {
            //   Drop Tables:
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

    static teardownDb() {
        // Drop all tables to clean up the database after tests
        try {
            db.serialize(function () {
                //   Drop Tables:
                const dropLinksTable = "DROP TABLE IF EXISTS links";
                db.run(dropLinksTable);
                const dropVideosTable = "DROP TABLE IF EXISTS videos";
                db.run(dropVideosTable);
            });
        } catch (err) {
            console.error('Error during database teardown:', err);
        }
    }

    static all(stmt, params) {
        return new Promise((res, rej) => {
            db.all(stmt, params, (error, result) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        })
    }
    static get(stmt, params) {
        return new Promise((res, rej) => {
            db.get(stmt, params, (error, result) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        })
    }

    static run(stmt, params) {
        return new Promise((res, rej) => {
            db.run(stmt, params, (error, result) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        })
    }


}
