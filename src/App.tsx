import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from "react";
import "./App.css";
import BaseLayout from './components/BaseLayout';

function App() {
  const [message, setMessage] = useState<string>("");

  return (
    <div className="App">
      <BaseLayout />
    </div>
  );
}

export default App;
