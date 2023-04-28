'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import toggleBodyScrolling from '../util/toggleBodyScrolling';
import Menubutton from './buttons/MenuButton';
import NewsCard from './cards/NewsCard';

// animations
const variants = {
  default: { x: 0, y: 0 },
  scrolled: { y: '-140%', x: 0 },
};

const test = {
  default: { x: 0, y: 0, opacity: 1 },
  open: { y: '310px', x: 0, opacity: 1 },
};

export default function News({
  news,
  hasScrolled,
  isVisible,
}: {
  news: Array<{ image: string; title: string; description: string; url: string }>;
  hasScrolled: boolean;
  isVisible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (hasScrolled) setVisible(false);
  }, [hasScrolled]);

  function toggleNews() {
    setOpen(!open);
    setVisible(true);
    if (window.innerWidth >= 640) {
      toggleBodyScrolling(!open);
    }
  }

  return (
    <>
      <div
        className={clsx(
          open &&
            'absolute left-0 top-0 block h-screen w-screen opacity-100 backdrop-blur-lg transition-opacity',
          'opacity-0',
        )}
      />
      <div
        className={clsx(
          'relative z-50 flex transition-opacity',
          isVisible && 'opacity-0 sm:opacity-100',
        )}
      >
        <motion.div
          className={'absolute right-0 z-10 flex h-28 w-full flex-col gap-2 sm:w-72'}
          initial={{ x: '120%', y: '0%' }}
          animate={visible && (!hasScrolled || open) ? 'default' : 'scrolled'}
          transition={{ duration: 0.5 }}
          variants={variants}
          onClick={() => {
            toggleNews();
          }}
        >
          {news.map((item, key) => {
            if (!item.url) return null;

            const classes = ['', '-translate-y-24', '-translate-y-48'];
            return (
              <NewsCard
                key={key}
                id={key}
                className={classes[key]}
                image={item.image}
                title={item.title}
                description={item.description}
                isOpen={open}
              />
            );
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={open ? 'open' : 'default'}
          transition={{ duration: 0.5 }}
          className="absolute right-0 z-0"
          variants={test}
        >
          <Menubutton
            label={open ? 'Show less' : `News ${news.length}`}
            classNode="bg-black/80 w-max"
            onClick={() => {
              toggleNews();
            }}
          />
        </motion.div>
      </div>
    </>
  );
}
