import { createRef, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { TMovieListProps } from '@/types/types';

import Icon from '@/components/Icons/Icon';
import { Indicator } from '@/components/Indicator';

import cc from '@/lib/cc';
import truncateText from '@/utils/truncateText';

const imageURL = 'https://image.tmdb.org/t/p/original';

const SearchBar = ({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => (
  <div className="flex h-8 w-3/4 items-center rounded-xl bg-[#1C1C1E]">
    <Icon type="loop" className="mx-3 w-3 fill-[#98989F]" />
    <input
      type="text"
      placeholder="Search..."
      className="bg-transparent p-0 text-sm text-white outline-none"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

const FilterButtons = ({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (term: string) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef(['Shows', 'Movies'].map(() => createRef<any>()));

  useEffect(() => {
    setActiveIndex(filter === 'Shows' ? 0 : 1);
  }, [filter]);

  return (
    <div className="relative my-2 flex gap-2 text-xs font-medium text-white">
      <Indicator activeIndex={activeIndex} itemRefs={buttonRefs.current} className="bg-blue-600" />
      {['Shows', 'Movies'].map((term, index) => (
        <button
          key={term}
          ref={buttonRefs.current[index] as RefObject<HTMLButtonElement>}
          onClick={() => setFilter(term)}
          className="rounded-full px-3 py-1"
        >
          {term === 'Shows' ? 'Series' : 'Movies'}
        </button>
      ))}
    </div>
  );
};

export default function WatchList({
  isListVisible,
  toggleListVisibility,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  movies,
  shows,
}: TMovieListProps) {
  const filteredData = useMemo(() => {
    const data = filter === 'Shows' ? shows : movies;
    return data.filter(
      (item) => (item.name || item.title)?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [filter, searchTerm, movies, shows]);

  return (
    <div
      className={cc(
        isListVisible ? 'translate-x-0' : 'translate-x-96',
        'absolute bg-gradient-to-b from-[#2B3833] to-[#0F1314] duration-300 transition-transform left-0 top-0 w-full h-full px-5 z-50',
      )}
    >
      <header className="mt-5 flex items-center justify-between">
        <div className="flex cursor-pointer items-center gap-2" onClick={toggleListVisibility}>
          <Icon type="chevron" className="w-1.5 fill-blue-600" />
          <p className="text-sm text-blue-600">Back</p>
        </div>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>
      <FilterButtons filter={filter} setFilter={setFilter} />
      <div className="no-scrollbar max-h-[250px]" style={{ overflowY: 'scroll', height: '100%' }}>
        <p className="pb-1 text-sm font-bold text-white">What I watched</p>
        {filteredData.map((show, index) => (
          <div
            key={index}
            className="flex gap-3 border-b-[0.5px] border-solid border-[#484848] py-2"
          >
            <Image
              src={`${imageURL}${show.backdrop_path}`}
              className={`rounded`}
              alt={show.name || show.title || 'media'}
              width={70}
              height={40}
              loading="lazy"
            />
            <div className="flex flex-col justify-center">
              <p className="text-xs font-medium text-white">{show.name || show.title}</p>
              <p className="text-2xs text-[#8a8a8a]">{truncateText(show.overview, 40)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
