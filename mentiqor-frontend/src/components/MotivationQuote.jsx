import { useState, useEffect } from 'react';
import { fetchQuote } from '../services/api';

const MotivationQuote = () => {
  const [quote,  setQuote]  = useState('Loading motivation...');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetchQuote()
      .then(data => {
        setQuote(data.quote);
        setAuthor(data.author);
      })
      .catch(() => {
        setQuote('Keep going! Every question mastered is a step closer to success.');
        setAuthor('Mentiqor');
      });
  }, []);

  return (
    <div className="motivation-card">
      <p className="quote-text">"{quote}"</p>
      <p className="quote-author">— {author}</p>
    </div>
  );
};

export default MotivationQuote;