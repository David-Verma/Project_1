import User from '../models/User.js';
import Post from '../models/Post.js';
export async function getProfile(req, res) {
  const user = await User.findById(req.params.id).select('name bio avatarUrl createdAt');
  if (!user) return res.status(404).json({ message: 'Profile not found.' });
  const posts = await Post.find({ author: user.id, status: 'published' }).sort({ createdAt: -1 }).populate('author', 'name bio avatarUrl').populate('tags', 'name slug');
  res.json({ user, posts });
}
export async function updateProfile(req, res) {
  const { name, bio, avatarUrl } = req.body;
  if (name !== undefined && !String(name).trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
  if (name !== undefined) req.user.name = String(name).trim().slice(0, 80);
  if (bio !== undefined) req.user.bio = String(bio).slice(0, 200);
  if (avatarUrl !== undefined) req.user.avatarUrl = String(avatarUrl).slice(0, 500);
  await req.user.save(); res.json({ user: req.user });
}
