import { Link } from 'react-router-dom';
function date(value) { return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
export default function PostCard({ post }) {
  return <article className="post-card"><div className="post-copy"><div className="byline"><Link to={`/profile/${post.author?._id}`} className="author-name">{post.author?.name || 'Developer'}</Link><span>·</span><time>{date(post.createdAt)}</time></div><Link to={`/post/${post.slug}`} className="post-title-link"><h2>{post.title}</h2></Link><p className="excerpt">{post.excerpt || post.content?.replace(/[#*`\[\]]/g, '').slice(0, 200)}</p><div className="tag-row">{post.tags?.map(tag => <Link className="tag" key={tag._id} to={`/tag/${tag.slug}`}>{tag.name}</Link>)}</div></div>{post.coverImage && <Link to={`/post/${post.slug}`} className="cover-thumb"><img src={post.coverImage} alt="" loading="lazy"/></Link>}</article>;
}
