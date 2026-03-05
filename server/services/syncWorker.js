const cron = require('node-cron');
const admin = require('firebase-admin');
const connectMongo = require('../config/mongoClient');

const firestoreDb = admin.firestore();

function startSyncWorker() {
    // This cron expression means "Run every 5 minutes"
    // Format: 'minute hour day month day-of-week'
    cron.schedule('*/5 * * * *', async () => {
        console.log("🔄 [SYNC WORKER] Checking for unsynced data...");

        try {
            const mongoDb = await connectMongo();
            if (!mongoDb) return;

            // Find all journals where syncedToFirestore is false
            const unsyncedJournals = await mongoDb.collection('journals')
                .find({ syncedToFirestore: false })
                .toArray();

            if (unsyncedJournals.length === 0) {
                console.log("✅ [SYNC WORKER] All data is in sync.");
                return;
            }

            console.log(`⚠️ [SYNC WORKER] Found ${unsyncedJournals.length} unsynced items. Attempting sync to Firestore...`);

            for (const journal of unsyncedJournals) {
                try {
                    // Extract fields that shouldn't go to Firestore
                    const { _id, userId, syncedToFirestore, ...journalData } = journal;

                    // Push the missed data back to Firestore
                    await firestoreDb.collection('users').doc(userId)
                        .collection('journals').doc(_id.toString())
                        .set(journalData, { merge: true }); // Use set with merge to create or update safely

                    // If Firestore succeeds, update the flag in MongoDB to true
                    await mongoDb.collection('journals').updateOne(
                        { _id: _id },
                        { $set: { syncedToFirestore: true } }
                    );

                    console.log(`✅ Synced journal ${_id} for user ${userId}`);
                } catch (syncError) {
                    // If Firestore is still down, it will fail here, and we'll try again in 5 minutes
                    console.error(`❌ Failed to sync journal ${journal._id}. Will retry later.`);
                }
            }
        } catch (error) {
            console.error("❌ [SYNC WORKER] Fatal error during sync process:", error);
        }
    });
}

module.exports = startSyncWorker;