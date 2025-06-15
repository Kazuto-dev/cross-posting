import { useState } from 'react';
import axios from 'axios';

function CreatePost() {
  const [content, setContent] = useState('');

  const handlePost = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/posts/create', {
        content,
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to post to LinkedIn');
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <textarea
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your LinkedIn post here..."
      />
      <br />
      <button onClick={handlePost}>Post to LinkedIn</button>
    </div>
  );
}

export default CreatePost;
