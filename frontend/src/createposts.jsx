import { useState, useEffect } from 'react';
import axios from 'axios';

function CreatePost() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);

  const handlePost = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/posts/create', { content });
      alert(res.data.message);
      setPosts((prev) => [res.data.savedPost, ...prev]);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to post to LinkedIn');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/posts/${id}`);
      alert(res.data.message);
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete post');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch posts.');
      }
    };

    fetchPosts();
  }, []);

  // Format date to something like "June 18, 2025, 11:32 PM"
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Create Post Form */}
      <div>
        <h2>Create Post</h2>
        <textarea
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your LinkedIn post here..."
          style={{
            width: '300px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'none',
          }}
        />
        <br />
        <button onClick={handlePost} style={{ marginTop: '8px' }}>
          Post to LinkedIn
        </button>
      </div>

      {/* Display Posts */}
      <div>
        <h2>Your Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post) => (
              <li
                key={post._id}
                style={{
                  background: '#1e1e1e',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  color: '#ccc',
                  border: '1px solid #444',
                  maxWidth: '300px',
                  wordBreak: 'break-word',
                }}
              >
                <p>{post.content}</p>
                <small style={{ color: '#999' }}>
                  Posted on: {formatDate(post.createdAt)}
                </small>
                <br />
                <button
                  onClick={() => handleDelete(post._id)}
                  style={{
                    marginTop: '6px',
                    backgroundColor: '#cc0000',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
