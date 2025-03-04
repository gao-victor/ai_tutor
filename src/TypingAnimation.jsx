import React, { useState, useEffect } from 'react';

function TypingAnimation({ text, typingSpeed = 50 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Reset displayed text when the input text changes
    setDisplayedText('');
    setIsTyping(true);
    
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };

    if (text && isTyping) {
      typeText();
    }

    // Cleanup timeout on unmount
    return () => setIsTyping(false);
  }, [text, typingSpeed]);

  return <div className='transcriptText'>{displayedText}</div>;
}

export default TypingAnimation;
