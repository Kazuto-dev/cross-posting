import { useState } from 'react';
import axios from 'axios';

function CreatePost() {
  const [content, setContent] = useState('');


  const handlePost = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/posts/create', {
        content,
        accessToken,
        authorId,
      });
      alert('Posted to LinkedIn!');
    } catch (err) {
      console.error(err);
      alert('Failed to post');
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={handlePost}>Post to LinkedIn</button>
    </div>
  );
}

export default CreatePost;
