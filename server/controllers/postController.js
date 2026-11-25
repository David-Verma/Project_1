import Post from '../models/Post.js';
import Tag from '../models/Tag.js';
import slugify from 'slugify';

async function resolveTags(input = []) {
  const names = [...new Set((Array.isArray(input) ? input : String(input).split(',')).map(x => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  const tags = [];
  for (const name of names) {
    if (name.length > 40) continue;
    const slug = slugify(name, { lower: true, strict: true }) || 'topic';
    const tag = await Tag.findOneAndUpdate({ name }, { $setOnInsert: { name, slug } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    tags.push(tag._id);
  }
  return tags;
}
async function uniqueSlug(title, exceptId) {
  const base = slugify(title, { lower: true, strict: true }) || 'untitled'; let slug = base; let n = 2;
  while (await Post.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })) slug = `${base}-${n++}`;
  return slug;
}
function populate(query) { return query.populate('author', 'name bio avatarUrl').populate('tags', 'name slug'); }

export async function listPosts(req, res) {
  const filter = { status: 'published' };
  if (req.query.search) {
    const safeSearch = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safeSearch, $options: 'i' };
  }
  if (req.query.tag) { const tag = await Tag.findOne({ slug: req.query.tag }); if (!tag) return res.json({ posts: [], page: 1, pages: 0, total: 0 }); filter.tags = tag._id; }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = 10;
  const [posts, total] = await Promise.all([populate(Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)), Post.countDocuments(filter)]);
  res.json({ posts, page, pages: Math.ceil(total / limit), total });
}
export async function getPost(req, res) {
  const post = await populate(Post.findOne({ slug: req.params.slug, status: 'published' }));
  if (!post) return res.status(404).json({ message: 'Post not found.' }); res.json({ post });
}
export async function myPosts(req, res) {
  const posts = await populate(Post.find({ author: req.user.id }).sort({ updatedAt: -1 })); res.json({ posts });
}
export async function createPost(req, res) {
  const { title, content, coverImage = '', status = 'draft' } = req.body;
  if (!String(title || '').trim() || !String(content || '').trim()) return res.status(400).json({ message: 'A title and post body are required.' });
  const post = await Post.create({ title, slug: await uniqueSlug(title), content, coverImage, status: status === 'published' ? 'published' : 'draft', author: req.user.id, tags: await resolveTags(req.body.tags), excerpt: String(req.body.excerpt || content.replace(/[#*`\[\]]/g, '')).slice(0, 240) });
  res.status(201).json({ post: await populate(Post.findById(post.id)) });
}
export async function updatePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (!post.author.equals(req.user.id)) return res.status(403).json({ message: 'You can only edit your own posts.' });
  const { title, content, coverImage, status, excerpt } = req.body;
  if (title !== undefined) { if (!String(title).trim()) return res.status(400).json({ message: 'A title is required.' }); post.title = title; post.slug = await uniqueSlug(title, post.id); }
  if (content !== undefined) {
    if (!String(content).trim()) return res.status(400).json({ message: 'A post body is required.' });
    post.content = content;
    if (excerpt === undefined) post.excerpt = String(content).replace(/[#*`\[\]]/g, '').slice(0, 240);
  }
  if (coverImage !== undefined) post.coverImage = coverImage;
  if (excerpt !== undefined) post.excerpt = String(excerpt).slice(0, 240);
  if (status !== undefined) post.status = status === 'published' ? 'published' : 'draft';
  if (req.body.tags !== undefined) post.tags = await resolveTags(req.body.tags);
  await post.save(); res.json({ post: await populate(Post.findById(post.id)) });
}
export async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (!post.author.equals(req.user.id)) return res.status(403).json({ message: 'You can only delete your own posts.' });
  await post.deleteOne(); res.json({ message: 'Post deleted.' });
}
