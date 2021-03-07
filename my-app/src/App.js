import './App.css';
import { useState } from 'react';
require('dotenv').config();

const axios = require('axios');

// Setup Google Cloud Client
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();

function App() {
  const [state, setState] = useState("Loading...");
  const [score, setScore] = useState(0);
  const [magnitude, setMagnitude] = useState(0);

  // Setup NewsAPI: https://newsapi.org/
  const today = new Date().toISOString()
  const newsApiURL = `https://newsapi.org/v2/everything?q=market&language=en&from=${today}&to=${today}&sortBy=popularity&apiKey=${process.env.REACT_APP_NEWS_API}`
  axios.get(newsApiURL).then(async (response) => {
    if (response.status === "ok") {
      const articles = response.articles;

      let texts = [];
      for (const article of articles) {
        texts.push(article.description)
      }
      if (texts.length === 0) {
        setState("No news found.");
        return;
      }
      const totalText = texts.join(" ");
      setSentiment(totalText)
    } else {
      setState("Error: No news found.");
    }
  });

  async function setSentiment(text) {   
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };
   
    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    if (sentiment.score > 0.8) {
      setState("Positive")
    } else if (sentiment.score < -0.6) {
      setState("Negative")
    } else {
      if (sentiment.magnitude > 4) {
        setState("Mixed")
      } else {
        setState("Neutral")
      }
    }
    setScore(sentiment.score)
    setMagnitude(sentiment.magnitude)
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Today's Stock Market Sentiment:
        </p>
        <p>
          {state}
        </p>
        {state.contains("Loading") ?
         '' : 
         <>
          <p>Score: {score}</p>
          <p>Magnitude: {magnitude}</p>
         </>
        }
      </header>
    </div>
  );
}

export default App;
