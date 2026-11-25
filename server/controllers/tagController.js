import Tag from '../models/Tag.js';
import Post from '../models/Post.js';
export async function listTags(req, res) {
  const tags = await Tag.aggregate([{ $lookup: { from: 'posts', let: { tagId: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $in: ['$$tagId', '$tags'] }, { $eq: ['$status', 'published'] }] } } }, { $count: 'count' }], as: 'published' } }, { $project: { name: 1, slug: 1, count: { $ifNull: [{ $arrayElemAt: ['$published.count', 0] }, 0] } } }, { $sort: { name: 1 } }]);
  res.json({ tags });
}
export async function postsByTag(req, res) {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) return res.status(404).json({ message: 'Tag not found.' });
  const posts = await Post.find({ status: 'published', tags: tag.id }).sort({ createdAt: -1 }).populate('author', 'name bio avatarUrl').populate('tags', 'name slug');
  res.json({ tag, posts });
}
