// import Autocomplete from './components/Autocomplete';
import { useState } from "react";
import Results from "./components/Results";
import SearchComponent from "./components/SearchComponent";

function App() {
  const [results, setResults] = useState([]);
  const [noresult, setNoResult] = useState(false);
  const handleResult = (value) => {
    setResults(value);
  }
  const handleNoResult = (value) => {
    setNoResult(value);
  }
  return (
    <div className="App">
      <SearchComponent handleResult={handleResult} handleNoResult={handleNoResult} />
      <Results results={results} noresult={noresult} />
    </div>
  );
}

export default App;
