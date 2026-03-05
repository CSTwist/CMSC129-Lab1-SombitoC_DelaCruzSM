const admin = require('firebase-admin');
const connectMongo = require('../config/mongoClient');

const firestoreDb = admin.firestore();

const DbService = {
    // ==========================================
    // READ OPERATIONS (Failover to Backup)
    // ==========================================

    async getActiveJournals(uid) {
        try {
            // 1. Try Primary (Firestore)
            const snapshot = await firestoreDb.collection('users').doc(uid).collection('journals')
                .where('isDeleted', '==', false)
                .orderBy('createdAt', 'desc')
                .get();
            
            const journals = [];
            snapshot.forEach(doc => journals.push({ id: doc.id, ...doc.data() }));
            return journals;

        } catch (error) {
            console.warn("Firestore failed. Fetching Active Journals from MongoDB...", error.message);
            
            // 2. Fallback to Secondary (MongoDB)
            const mongoDb = await connectMongo();
            if (!mongoDb) throw new Error("Both databases are unreachable.");

            const journals = await mongoDb.collection('journals')
                .find({ userId: uid, isDeleted: false })
                .sort({ createdAt: -1 })
                .toArray();
            
            return journals.map(j => ({ ...j, id: j._id.toString(), _id: undefined }));
        }
    },

    async getTrash(uid) {
        try {
            // 1. Try Primary
            const snapshot = await firestoreDb.collection('users').doc(uid).collection('journals')
                .where('isDeleted', '==', true)
                .orderBy('deletedAt', 'desc')
                .get();

            const journals = [];
            snapshot.forEach(doc => journals.push({ id: doc.id, ...doc.data() }));
            return journals;
        } catch (error) {
            console.warn("Firestore failed. Fetching Trash from MongoDB...", error.message);
            
            // 2. Fallback to Secondary
            const mongoDb = await connectMongo();
            if (!mongoDb) throw new Error("Both databases are unreachable.");

            const journals = await mongoDb.collection('journals')
                .find({ userId: uid, isDeleted: true })
                .sort({ deletedAt: -1 })
                .toArray();
            
            return journals.map(j => ({ ...j, id: j._id.toString(), _id: undefined }));
        }
    },

    // ==========================================
    // WRITE OPERATIONS (Dual-Write to keep in sync)
    // ==========================================

    async createJournal(uid, journalData) {
        let createdId;
        let syncedToFirestore = true; // Initialize flag
        
        const newJournal = {
            ...journalData,
            createdAt: Date.now(),
            isDeleted: false,
            deletedAt: Date.now() // Initialize deletedAt to prevent Firestore null issues
        };

        // 1. Write to Primary (Firestore)
        try {
            const docRef = await firestoreDb.collection('users').doc(uid).collection('journals').add(newJournal);
            createdId = docRef.id;
        } catch (error) {
            console.warn("Firestore write failed. Generating ID for MongoDB fallback...", error.message);
            const crypto = require('crypto');
            createdId = crypto.randomBytes(10).toString('hex');
            syncedToFirestore = false; // Flag as unsynced
        }

        // 2. Write to Secondary (MongoDB)
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').insertOne({
                    _id: createdId, 
                    userId: uid,
                    syncedToFirestore: syncedToFirestore, // Save flag to Mongo
                    ...newJournal
                });
            }
        } catch (error) {
            console.error("MongoDB backup write failed on create!", error.message);
        }

        return { id: createdId, ...newJournal };
    },

    async updateJournal(uid, journalId, updateData) {
        let syncedToFirestore = true; // Initialize flag
        
        // 1. Write to Primary
        try {
            await firestoreDb.collection('users').doc(uid).collection('journals').doc(journalId).update(updateData);
        } catch (error) {
            console.warn(`Firestore update failed for ${journalId}. Updating MongoDB...`, error.message);
            syncedToFirestore = false; // Flag as unsynced
        }

        // 2. Write to Secondary
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').updateOne(
                    { _id: journalId, userId: uid }, 
                    { $set: { ...updateData, syncedToFirestore: syncedToFirestore } } // Include flag in update
                );
            }
        } catch (error) {
            console.error("MongoDB backup write failed on update!", error.message);
        }
    },

    async softDeleteJournal(uid, journalId) {
        let syncedToFirestore = true; // Initialize flag
        const updateData = {
            isDeleted: true,
            deletedAt: Date.now()
        };

        // 1. Write to Primary
        try {
            await firestoreDb.collection('users').doc(uid).collection('journals').doc(journalId).update(updateData);
        } catch (error) {
            console.warn(`Firestore soft delete failed for ${journalId}. Updating MongoDB...`, error.message);
            syncedToFirestore = false; // Flag as unsynced
        }

        // 2. Write to Secondary
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').updateOne(
                    { _id: journalId, userId: uid }, 
                    { $set: { ...updateData, syncedToFirestore: syncedToFirestore } } // Include flag in update
                );
            }
        } catch (error) {
            console.error("MongoDB backup write failed on soft delete!", error.message);
        }
    },

    async restoreJournal(uid, journalId) {
        let syncedToFirestore = true; // Initialize flag
        const updateData = {
            isDeleted: false,
            deletedAt: null
        };

        // 1. Write to Primary
        try {
            await firestoreDb.collection('users').doc(uid).collection('journals').doc(journalId).update(updateData);
        } catch (error) {
            console.warn(`Firestore restore failed for ${journalId}. Updating MongoDB...`, error.message);
            syncedToFirestore = false; // Flag as unsynced
        }

        // 2. Write to Secondary
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').updateOne(
                    { _id: journalId, userId: uid }, 
                    { $set: { ...updateData, syncedToFirestore: syncedToFirestore } } // Include flag in update
                );
            }
        } catch (error) {
            console.error("MongoDB backup write failed on restore!", error.message);
        }
    },

    // ==========================================
    // DELETE OPERATIONS (Dual-Delete)
    // ==========================================

    async permanentDelete(uid, journalId) {
        // 1. Delete from Primary
        try {
            await firestoreDb.collection('users').doc(uid).collection('journals').doc(journalId).delete();
        } catch (error) {
            console.warn(`Firestore permanent delete failed for ${journalId}. Deleting from MongoDB...`, error.message);
            // No sync flag needed here because the document is being completely removed from the backup DB
        }

        // 2. Delete from Secondary
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').deleteOne({ _id: journalId, userId: uid });
            }
        } catch (error) {
            console.error("MongoDB backup delete failed on permanent delete!", error.message);
        }
    },

    async emptyTrash(uid) {
        // 1. Empty Primary (Using Firestore Batch)
        try {
            const snapshot = await firestoreDb.collection('users').doc(uid).collection('journals')
                .where('isDeleted', '==', true)
                .get();

            if (!snapshot.empty) {
                const batch = firestoreDb.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        } catch (error) {
            console.warn("Firestore empty trash failed. Emptying MongoDB...", error.message);
        }

        // 2. Empty Secondary
        try {
            const mongoDb = await connectMongo();
            if (mongoDb) {
                await mongoDb.collection('journals').deleteMany({ userId: uid, isDeleted: true });
            }
        } catch (error) {
            console.error("MongoDB backup delete failed on empty trash!", error.message);
        }
    }
};

module.exports = DbService;