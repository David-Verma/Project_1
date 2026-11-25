import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorText } from '../api/axios';
import Markdown from '../components/Markdown';
import { ErrorNotice, Loading } from '../components/Layout';
function date(value) { return new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }); }
export default function PostDetail() {
  const { slug } = useParams(); const [post, setPost] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(`/posts/${slug}`).then(r => setPost(r.data.post)).catch(e => setError(errorText(e))); }, [slug]);
  if (error) return <div className="narrow"><ErrorNotice>{error}</ErrorNotice><Link to="/" className="back-link">← Back to the feed</Link></div>;
  if (!post) return <Loading/>;
  const words = post.content.trim().split(/\s+/).length; const reading = Math.max(1, Math.ceil(words / 220));
  return <article className="article"><Link to="/" className="back-link">← All stories</Link>{post.coverImage && <img className="article-cover" src={post.coverImage} alt=""/>}<p className="eyebrow">A field note</p><h1>{post.title}</h1><div className="article-meta"><Link to={`/profile/${post.author?._id}`} className="author-chip">{post.author?.avatarUrl ? <img src={post.author.avatarUrl} alt=""/> : <span>{post.author?.name?.[0]}</span>}<b>{post.author?.name}</b></Link><span>{date(post.createdAt)}</span><span>{reading} min read</span></div><div className="tag-row article-tags">{post.tags?.map(t => <Link className="tag" key={t._id} to={`/tag/${t.slug}`}>{t.name}</Link>)}</div><Markdown>{post.content}</Markdown></article>;
}
