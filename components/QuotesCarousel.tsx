'use client';

import { useState, useEffect } from 'react';

const quotes = [
  {
    text: "I have not failed. I've just found 10,000 ways that won't work",
    author: 'Thomas Edison',
  },
  {
    text: 'A Goal without a plan is just a wish',
    author: 'Antoine De Saint-Exupéry',
  },
  {
    text: 'No amount of psychological techniques will help the vastly overleveraged trader.',
    author: 'Dr. Brett Steenbarger',
  },
  {
    text: 'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    text: 'It’s not whether you’re right or wrong that’s important, it’s how much money you make when you’re right and how much you lose when you’re wrong',
    author: 'George Soros',
  },
  {
    text: 'Cut your losses short and let your profits run.',
    author: 'Trading Wisdom',
  },

  {
    text: "Trading is not about being right, it's about being profitable.",
    author: 'Anonymous',
  },
  {
    text: 'Plan your trade and trade your plan.',
    author: 'Trading Maxim',
  },
];

export default function QuotesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentIndex];

  return (
    <div className='w-full max-w-3xl mx-auto mb-6 px-4'>
      <div
        className={`transition-all duration-300 ${
          isAnimating
            ? 'opacity-0 transform translate-y-2'
            : 'opacity-100 transform translate-y-0'
        }`}
      >
        <p className='text-base md:text-lg text-foreground/80 italic text-center mb-2'>
          &ldquo;{currentQuote.text}&rdquo;
        </p>
        <p className='text-sm text-muted-foreground text-center'>
          — {currentQuote.author}
        </p>
      </div>
    </div>
  );
}
