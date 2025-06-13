import CreatePost from './createposts';

function App() {
  return (
    <div>
      <h1>LinkedIn Crossposter</h1>
<a href="http://localhost:5000/api/linkedin/login" target="_blank" rel="noopener noreferrer">
  Login with LinkedIn
</a>

      <CreatePost />
    </div>
  );
}

export default App;
