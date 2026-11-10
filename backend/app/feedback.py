"""Anonymous, per-browser likes and ratings stored in MongoDB."""
from datetime import datetime, timezone
from functools import lru_cache

from pymongo import MongoClient

from app.config import MONGODB_DATABASE, MONGODB_URI


class FeedbackUnavailable(RuntimeError):
    """Raised when MongoDB is not configured or cannot be reached."""


@lru_cache(maxsize=1)
def _client():
    if not MONGODB_URI:
        raise FeedbackUnavailable('MongoDB is not configured. Set MONGODB_URI in backend/.env.')
    return MongoClient(MONGODB_URI, serverSelectionTimeoutMS=4000, connectTimeoutMS=4000)


def _collection():
    if not MONGODB_DATABASE:
        raise FeedbackUnavailable('MongoDB database name is empty. Set MONGODB_DATABASE in backend/.env.')
    return _client()[MONGODB_DATABASE]['feedback']


def _summary(collection, client_id):
    aggregate = next(collection.aggregate([
        {'$match': {'rating': {'$gte': 1, '$lte': 5}}},
        {'$group': {'_id': None, 'rating_count': {'$sum': 1}, 'average_rating': {'$avg': '$rating'}}},
    ]), None)
    own = collection.find_one({'_id': client_id}, {'liked': 1, 'rating': 1}) or {}
    return {
        'likes': collection.count_documents({'liked': True}),
        'rating_count': aggregate['rating_count'] if aggregate else 0,
        'average_rating': round(aggregate['average_rating'], 2) if aggregate else None,
        'liked': own.get('liked', False),
        'rating': own.get('rating'),
    }


def get_feedback_stats(client_id):
    collection = _collection()
    collection.database.client.admin.command('ping')
    return _summary(collection, client_id)


def update_feedback(client_id, liked=None, rating=None):
    collection = _collection()
    collection.database.client.admin.command('ping')
    fields = {'updated_at': datetime.now(timezone.utc)}
    if liked is not None:
        fields['liked'] = liked
    if rating is not None:
        fields['rating'] = rating
    collection.update_one({'_id': client_id}, {'$set': fields}, upsert=True)
    return _summary(collection, client_id)
