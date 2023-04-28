'use client';

import { useEffect, useRef, useState } from 'react';

import { menu, news } from '../content/navigation';
import Container from './Container';
import Navigation from './Navigation';
import News from './News';

const SCROLL_TRESHOLD = 50;

export default function Header() {
  const scrollPosition = useRef(0);

  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const newsItems = news.slice(-3) || [];

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
        <News news={newsItems} hasScrolled={scrolled} isVisible={showMenu} />
      </Container>
    </header>
  );
}
