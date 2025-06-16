import { useState } from 'react';
import axios from 'axios';

function CreatePost() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]); // Stores submitted posts

  const handlePost = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/posts/create', {
        content,
      });

      alert(res.data.message);

      // Add the submitted post to the list and clear the textarea
      setPosts((prev) => [...prev, content]);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to post to LinkedIn');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Post form */}
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

      {/* Display submitted posts */}
      <div>
        <h2>Your Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post, index) => (
              <li
                key={index}
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
                {post}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
