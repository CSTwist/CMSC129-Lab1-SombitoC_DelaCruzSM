const cron = require('node-cron');
const admin = require('firebase-admin');
const connectMongo = require('../config/mongoClient');

const firestoreDb = admin.firestore();

function startSyncWorker() {
    cron.schedule('*/5 * * * *', async () => {
        console.log("🔄 [SYNC WORKER] Checking for unsynced data...");

        try {
            const mongoDb = await connectMongo();
            if (!mongoDb) return;

            // =====================================
            // 1. SYNC JOURNALS
            // =====================================
            const unsyncedJournals = await mongoDb.collection('journals').find({ syncedToFirestore: false }).toArray();
            
            if (unsyncedJournals.length > 0) {
                console.log(`⚠️ [SYNC WORKER] Found ${unsyncedJournals.length} unsynced journals. Attempting sync...`);
                for (const journal of unsyncedJournals) {
                    try {
                        const { _id, userId, syncedToFirestore, ...journalData } = journal;
                        await firestoreDb.collection('users').doc(userId).collection('journals').doc(_id.toString()).set(journalData, { merge: true });
                        await mongoDb.collection('journals').updateOne({ _id: _id }, { $set: { syncedToFirestore: true } });
                        console.log(`✅ Synced journal ${_id} for user ${userId}`);
                    } catch (syncError) {
                        console.error(`❌ Failed to sync journal ${journal._id}. Will retry later.`);
                    }
                }
            }

            // =====================================
            // 2. SYNC USER PROFILES
            // =====================================
            const unsyncedUsers = await mongoDb.collection('users').find({ syncedToFirestore: false }).toArray();
            
            if (unsyncedUsers.length > 0) {
                console.log(`⚠️ [SYNC WORKER] Found ${unsyncedUsers.length} unsynced user profiles. Attempting sync...`);
                for (const user of unsyncedUsers) {
                    try {
                        const { _id, syncedToFirestore, ...userData } = user;
                        // Push user data back to Firestore
                        await firestoreDb.collection('users').doc(_id.toString()).set(userData, { merge: true });
                        // Update flag in MongoDB
                        await mongoDb.collection('users').updateOne({ _id: _id }, { $set: { syncedToFirestore: true } });
                        console.log(`✅ Synced profile for user ${_id}`);
                    } catch (syncError) {
                        console.error(`❌ Failed to sync user profile ${user._id}. Will retry later.`);
                    }
                }
            }

        } catch (error) {
            console.error("❌ [SYNC WORKER] Fatal error during sync process:", error);
        }
    });
}

module.exports = startSyncWorker;