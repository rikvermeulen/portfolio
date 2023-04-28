'use client';

import { useEffect, useRef, useState } from 'react';

import Container from './Container';
import Navigation from './Navigation';
import News from './News';

const SCROLL_TRESHOLD = 50;

const menu = [
  {
    label: 'Work',
    url: '/',
  },
  {
    label: 'About',
    url: '/',
  },
  {
    label: 'Archive',
    url: '/',
  },
];

const newsItem = [
  {
    image:
      'https://uploads-ssl.webflow.com/6244a97f9e639f5341766070/636e40e79f60d8c4c1ba5496_Domestika-newsfeed-icon.png',
    title: 'title',
    description: 'description',
    url: '/',
  },
  {
    image:
      'https://uploads-ssl.webflow.com/6244a97f9e639f5341766070/636e40e79f60d8c4c1ba5496_Domestika-newsfeed-icon.png',
    title: 'title',
    description: 'description',
    url: '/',
  },
  {
    image:
      'https://uploads-ssl.webflow.com/6244a97f9e639f5341766070/636e40e79f60d8c4c1ba5496_Domestika-newsfeed-icon.png',
    title: 'title',
    description: 'description',
    url: '/',
  },
];

export default function Header() {
  const scrollPosition = useRef(0);

  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const news = newsItem.slice(-3) || [];

  function handleIfScrolled() {
    if (window.innerWidth >= 640) {
      if (window.scrollY === 0) {
        setScrolled(false);
      }
      // scrolling up after you have scrolled down
      if (window.scrollY < scrollPosition.current) {
        setScrolled(false);
      }
      // if you move down from top of page
      else if (window.scrollY > SCROLL_TRESHOLD) {
        setScrolled(true);
      }

      scrollPosition.current = window.scrollY;
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleIfScrolled);

    return () => window.removeEventListener('scroll', handleIfScrolled);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 640) {
      if (scrolled && showMenu) setShowMenu(false);
      if (!scrolled && !showMenu) setShowMenu(true);
    }
  }, [scrolled]);

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <Container className="flex place-items-start justify-between">
        <Navigation
          menu={menu}
          isOpen={showMenu}
          callbackMenu={(state) => {
            setShowMenu(state);
          }}
        />
        <News news={news} hasScrolled={scrolled} isVisible={showMenu} />
      </Container>
    </header>
  );
}
