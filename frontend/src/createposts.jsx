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

      if (res.data.savedPost) {
        setPosts((prev) => [res.data.savedPost, ...prev]);
      } else {
        console.warn('⚠️ No savedPost returned from backend:', res.data);
      }

      setContent('');
    } catch (err) {
      console.error('❌ Failed to post to LinkedIn:', err);
      alert('❌ Failed to post to LinkedIn');
    }
  };

const handleDelete = async (id) => {
  console.log('🧪 handleDelete called with ID:', id);

  if (!window.confirm('Are you sure you want to delete this post?')) {
    console.log('❌ Deletion cancelled by user');
    return;
  }

  try {
    const res = await axios.delete(`http://localhost:5000/api/posts/${id}`, {
      timeout: 10000, // ← Add this
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Delete response:', res.data);
    alert(res.data.message);
    setPosts((prev) => prev.filter((post) => post._id !== id));
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.error('⏱️ Delete request timed out:', err.message);
      alert('⏱️ Delete timed out');
    } else if (err.response) {
      console.error('❌ Server error:', err.response.status, err.response.data);
      alert(`❌ Server error: ${err.response.status}`);
    } else {
      console.error('💥 Unexpected delete error:', err.message);
      alert('❌ Unexpected error deleting post');
    }
  }
};


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data || []);
      } catch (err) {
        console.error('❌ Fetch failed:', err);
        alert('Failed to fetch posts.');
      }
    };

    fetchPosts();
  }, []);

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
            {posts.map((post, idx) => {
              if (!post || typeof post !== 'object') {
                console.warn(`⚠️ Skipping invalid post at index ${idx}`, post);
                return null;
              }

              return (
                <li
                  key={post._id || idx}
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
