import Image from 'next/image';

import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';
import truncateText from '@/utils/truncateText';

const imageURL = 'https://image.tmdb.org/t/p/original';

type ShowOrMovie = {
  backdrop_path: string;
  name?: string;
  title?: string;
  overview: string;
};

type MovieListProps = {
  isListVisible: boolean;
  toggleListVisibility: () => void;
  filter: string;
  setFilter: (filterType: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  movies: ShowOrMovie[];
  shows: ShowOrMovie[];
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
}: MovieListProps) {
  const filteredData = (filter === 'Shows' ? shows : movies).filter(
    (item) => (item.name || item.title)?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className={cc(
        isListVisible ? 'translate-x-0' : 'translate-x-96 ',
        'absolute bg-gradient-to-b from-[#2B3833] to-[#0F1314] duration-300 transition-transform left-0 top-0 w-full h-full px-5',
      )}
    >
      <header>
        <div className=" mt-5 flex items-center justify-between">
          <div className="flex cursor-pointer items-center gap-2" onClick={toggleListVisibility}>
            <Icon type="chevron" className="w-1.5 fill-blue-600" />
            <p className="text-sm text-blue-600">Back</p>
          </div>
          <div className=" flex h-8 w-3/4 items-center rounded-xl bg-[#1C1C1E]">
            <Icon type="loop" className="mx-3 w-3 fill-[#98989F]" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent p-0 text-sm text-white outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 py-2 text-xs font-medium text-white">
          <button
            onClick={() => setFilter('Shows')}
            className={`rounded-full px-3 py-1 ${filter === 'Shows' ? 'bg-blue-600' : ''}`}
          >
            Series
          </button>
          <button
            onClick={() => setFilter('Movies')}
            className={`rounded-full px-3 py-1 ${filter === 'Movies' ? 'bg-blue-600' : ''}`}
          >
            Movies
          </button>
        </div>
      </header>
      <div className="max-h-[250px]" style={{ overflowY: 'scroll', height: '100%' }}>
        <p className="pb-1 text-sm font-bold text-white">What I watched</p>
        {filteredData &&
          filteredData.map((show, index) => (
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
              />
              <div className="flex flex-col justify-center">
                <p className=" text-xs font-medium text-white">{show.name || show.title}</p>
                <p className="text-[10px] text-[#8a8a8a]">{truncateText(show.overview, 40)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
