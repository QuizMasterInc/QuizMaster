const functions = require('firebase-functions');
const { onRequest, onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

function resolveDeckOwnerId(deckData = {}) {
  return (
    deckData.creatorId ||
    deckData.creator?.uid ||
    deckData.createdBy ||
    deckData.userId ||
    deckData.ownerId ||
    null
  );
}

exports.addCustomFlashcardDeck = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const dataType = req.get('content-type');
    if (dataType && dataType.includes('application/json')) {
      const data = JSON.parse(JSON.stringify(req.body));

      const creatorID = data.creatorId;
      const title = data.title;
      const cards = data.cards || [];
      const tags = data.tags || '';

      if (!creatorID || !title.trim() || !Array.isArray(cards) || cards.length === 0) {
        return res.json({
          status: 400,
          success: false,
          message: 'Missing required parameters: creatorID, title, and cards array',
        });
      }

      try {
        const user = await admin.firestore().collection('users').doc(creatorID);
        const userDoc = await user.get();

        let creatorInfo = {
          uid: creatorID,
          displayName: 'Anonymous User',
          username: 'Anonymous User',
        };

        if (userDoc.exists) {
          const userData = userDoc.data();
          creatorInfo = {
            uid: creatorID,
            displayName:
              userData.profile?.displayName ||
              userData.displayName ||
              `${userData.profile?.firstName || 'Anonymous'} ${
                userData.profile?.lastName || 'User'
              }`.trim(),
            username: userData.profile?.displayName || userData.displayName || 'Anonymous User',
          };
        }

        const currentDate = new Date().toISOString();

        const cardsArray = cards.map((card, index) => ({
          id: `card_${index + 1}`,
          front: card.front || '',
          back: card.back || '',
          type: card.type || 'basic',
        }));

        const newFlashcardDeck = {
          title: title,
          description: data.description || '',
          category: data.category || 'General',
          tags: Array.isArray(tags)
            ? tags
            : tags
            ? tags.split(',').map((t) => t.trim())
            : [],
          difficulty: data.difficulty || 'medium',
          isPublic: data.isPublic || false,
          allowCopying: data.allowCopying ?? true,

          creatorId: creatorInfo.uid,
          creatorName: creatorInfo.displayName,

          cardCount: cards.length,
          cards: cardsArray,

          analytics: data.analytics || {
            stats: {
              averageScore: 0,
              timesStudied: 0,
              lastStudied: null,
              totalReviews: 0,
            },
          },

          createdAt: currentDate,
          updatedAt: currentDate,
          timestamps: {
            createdAt: currentDate,
            updatedAt: currentDate,
          },
          lastStudiedAt: null,

          isActive: true,
        };

        const result = await admin.firestore().collection('flashcard_decks').add(newFlashcardDeck);

        try {
          if (userDoc.exists) {
            await user.update({
              'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(1),
              'recentActivity.flashcardIds': admin.firestore.FieldValue.arrayUnion(result.id),
              'timestamps.updatedAt': currentDate,
              'timestamps.lastActiveAt': currentDate,
            });
          }
        } catch (error) {
          console.error('Error updating user stats for flashcard deck:', error);
        }

        return res.json({
          status: 200,
          success: true,
          message: 'Flashcard deck created successfully',
          deckID: result.id,
          data: newFlashcardDeck,
        });
      } catch (error) {
        console.error('Error creating flashcard deck:', error);
        return res.json({
          status: 500,
          success: false,
          message: error.message,
        });
      }
    } else {
      return res.json({
        status: 400,
        success: false,
        message: 'Content-Type must be application/json',
      });
    }
  });
});

exports.getUserFlashcardDecks = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const userId = req.query.userId || req.body?.userId;

    if (!userId) {
      return res.json({
        status: 400,
        success: false,
        message: 'User ID is required',
      });
    }

    try {
      const query = admin
        .firestore()
        .collection('flashcard_decks')
        .where('creatorId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('updatedAt', 'desc');

      const querySnapshot = await query.get();
      const decks = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        decks.push({
          id: doc.id,
          ...data,
        });
      });

      return res.json({
        status: 200,
        success: true,
        message: 'Flashcard decks retrieved successfully',
        data: decks,
        count: decks.length,
      });
    } catch (error) {
      console.error('Error fetching user flashcard decks:', error);
      return res.json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  });
});

exports.getFlashcardDeck = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const deckId = req.query.deckId || req.body?.deckId;

    if (!deckId) {
      return res.json({
        status: 400,
        success: false,
        message: 'Deck ID is required',
      });
    }

    try {
      const deckDoc = await admin.firestore().collection('flashcard_decks').doc(deckId).get();

      if (!deckDoc.exists) {
        return res.json({
          status: 404,
          success: false,
          message: 'Flashcard deck not found',
        });
      }

      const deckData = deckDoc.data();

      return res.json({
        status: 200,
        success: true,
        message: 'Flashcard deck retrieved successfully',
        data: {
          id: deckDoc.id,
          ...deckData,
        },
      });
    } catch (error) {
      console.error('Error fetching flashcard deck:', error);
      return res.json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  });
});

exports.deleteFlashcardDeck = onRequest({invoker: 'public'}, async (req, res) => {
  cors(req, res, async () => {
    const deckId = req.query.deckId || req.body?.deckId;
    const userId = req.query.userId || req.body?.userId;

    if (!deckId || !userId) {
      return res.json({
        status: 400,
        success: false,
        message: 'Deck ID and User ID are required',
      });
    }

    try {
      const deckDoc = await admin.firestore().collection('flashcard_decks').doc(deckId).get();

      if (!deckDoc.exists) {
        return res.json({
          status: 404,
          success: false,
          message: 'Flashcard deck not found',
        });
      }

      const deckData = deckDoc.data();

      const ownerId = resolveDeckOwnerId(deckData);

      if (ownerId !== userId) {
        return res.json({
          status: 403,
          success: false,
          message: 'Unauthorized: You can only delete your own decks',
        });
      }

      await admin.firestore().collection('flashcard_decks').doc(deckId).update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

      const sessionsSnapshot = await admin.firestore().collection('study_sessions').where('deckId', '==', deckId).get();
      if (!sessionsSnapshot.empty) {
        const sessionsBatch = admin.firestore().batch();
        sessionsSnapshot.forEach(doc => sessionsBatch.delete(doc.ref));
        await sessionsBatch.commit();
      }

      try {
        const user = admin.firestore().collection('users').doc(userId);
        await user.update({
          'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(-1),
          'recentActivity.flashcardIds': admin.firestore.FieldValue.arrayRemove(deckId),
          'timestamps.updatedAt': new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating user stats for flashcard deck deletion:', error);
      }

      return res.json({
        status: 200,
        success: true,
        message: 'Flashcard deck deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      return res.json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  });
});

exports.updateFlashcardDeck = onRequest({invoker: 'public'}, async (req, res) => {
  cors(req, res, async () => {
    const contentType = req.get('content-type');
    const data =
      contentType && contentType.includes('application/json')
        ? JSON.parse(JSON.stringify(req.body))
        : req.body || {};

    const {
      deckId,
      userId,
      title,
      description,
      cards,
      isPublic,
      category,
      difficulty,
      tags,
      allowCopying,
    } = data;

    if (!deckId || !userId) {
      return res.json({
        status: 400,
        success: false,
        message: 'Deck ID and User ID are required',
      });
    }

    try {
      const db = admin.firestore();
      const deckRef = db.collection('flashcard_decks').doc(deckId);
      const deckDoc = await deckRef.get();

      if (!deckDoc.exists) {
        return res.json({
          status: 404,
          success: false,
          message: 'Flashcard deck not found',
        });
      }

      const deckData = deckDoc.data();

      const ownerId = resolveDeckOwnerId(deckData);

      if (ownerId !== userId) {
        return res.json({
          status: 403,
          success: false,
          message: 'Unauthorized: You can only edit your own decks',
        });
      }

      const updates = {
        updatedAt: new Date().toISOString(),
      };

      if (title !== undefined && title.trim()) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (difficulty !== undefined) updates.difficulty = difficulty;
      if (isPublic !== undefined) updates.isPublic = isPublic;
      if (allowCopying !== undefined) updates.allowCopying = allowCopying;
      if (tags !== undefined) {
        updates.tags = Array.isArray(tags)
          ? tags
          : tags
          ? tags.split(',').map((t) => t.trim())
          : [];
      }

      if (cards !== undefined) {
        if (!Array.isArray(cards)) {
          return res.json({
            status: 400,
            success: false,
            message: 'Cards must be an array',
          });
        }
        updates.cards = cards.map((card, index) => ({
          id: card.id || `card_${Date.now()}_${index}`,
          front: card.front || '',
          back: card.back || '',
          type: card.type || 'basic',
        }));
        updates.cardCount = cards.length;
      }

      await deckRef.update(updates);

      return res.json({
        status: 200,
        success: true,
        message: 'Flashcard deck updated successfully',
        data: { id: deckId, ...updates },
      });
    } catch (error) {
      console.error('Error updating flashcard deck:', error);
      return res.json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  });
});

exports.updateFlashcardDeckAnalytics = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const deckId = req.query.deckId || req.body?.deckId;

    if (!deckId) {
      return res.json({
        status: 400,
        success: false,
        message: 'Deck ID is required',
      });
    }

    try {
      const deckRef = admin.firestore().collection('flashcard_decks').doc(deckId);
      const deckDoc = await deckRef.get();

      if (!deckDoc.exists) {
        return res.json({
          status: 404,
          success: false,
          message: 'Flashcard deck not found',
        });
      }

      const deckData = deckDoc.data();
      const currentTimesStudied = deckData.analytics?.stats?.timesStudied || 0;

      await deckRef.update({
        'analytics.stats.timesStudied': currentTimesStudied + 1,
        'analytics.stats.lastStudiedAt': new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.json({
        status: 200,
        success: true,
        message: 'Deck analytics updated successfully',
      });
    } catch (error) {
      console.error('Error updating deck analytics:', error);
      return res.json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  });
});

exports.browsePublicFlashcards = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use GET.',
      });
    }

    try {
      const db = admin.firestore();
      const { category, difficulty, sortBy = 'recent', limit: limitCount = 50 } = req.query;

      let query = db
        .collection('flashcard_decks')
        .where('isPublic', '==', true)
        .where('isActive', '==', true);

      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }

      if (difficulty && difficulty !== 'all') {
        query = query.where('difficulty', '==', difficulty);
      }

      if (sortBy === 'recent') {
        query = query.orderBy('updatedAt', 'desc');
      } else if (sortBy === 'oldest') {
        query = query.orderBy('createdAt', 'asc');
      } else if (sortBy === 'popular') {
        query = query.orderBy('analytics.stats.timesStudied', 'desc');
      }

      query = query.limit(parseInt(limitCount) || 50);

      const snapshot = await query.get();
      const decks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({
        success: true,
        count: decks.length,
        decks,
      });
    } catch (error) {
      console.error('Error browsing public flashcards:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to browse public flashcards',
        error: error.message,
      });
    }
  });
});

exports.getFlashcardCategories = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use GET.',
      });
    }

    try {
      const db = admin.firestore();

      const snapshot = await db
        .collection('flashcard_decks')
        .where('isPublic', '==', true)
        .where('isActive', '==', true)
        .select('category')
        .get();

      const categoriesSet = new Set();
      snapshot.docs.forEach((doc) => {
        const category = doc.data().category;
        if (category) {
          categoriesSet.add(category);
        }
      });

      const categories = Array.from(categoriesSet).sort();

      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      console.error('Error fetching flashcard categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      });
    }
  });
});
