import Image from 'next/image';

import Bento from '@/components/Bento/Bento';
import { ButtonPrimary } from '@/components/Button';
import Icon from '@/components/Icons/Icon';

interface TweetProps {
  userName: string;
  tweetText: string;
  tweetCreatedAt: string;
  tweetLikeCount: number;
  tweetRetweetCount: number;
}

function Twitter({ tweet }: { tweet: TweetProps }) {
  const { userName, tweetText, tweetCreatedAt, tweetLikeCount, tweetRetweetCount } = tweet;

  return (
    <Bento size="1x1" className="bento p-5" icon="twitter" href="https://www.twitter.com">
      <div className="flex h-full flex-col justify-between">
        <header>
          <h3 className="flex items-center gap-1 text-lg font-bold text-[#1d9bf0]">
            # <span className="!text-base">Latest Tweet</span>
          </h3>
          <div className="mt-4 flex gap-3">
            <Image
              src={'/images/me.jpg'}
              alt="Twitter"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="flex flex-col justify-center font-medium">
              <p className="text-sm">Rik Vermeulen</p>
              <p className="text-xs text-black/30">@{userName}</p>
            </div>
          </div>
        </header>
        <div>
          <p className="text-[22px]">{tweetText} that I tweeted for my new portfolio</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-black/30">{tweetCreatedAt}</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs text-[#1d9bf0]">
                <Icon name="heart" className="h-3 w-3 fill-[#1d9bf0]" type={'heartFill'} />
                <span>{tweetLikeCount}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#1d9bf0]">
                <Icon name="heart" className="h-3 w-3 fill-sky-500" type={'heartFill'} />
                <span>{tweetRetweetCount}</span>
              </div>
            </div>
          </div>
        </div>
        <ButtonPrimary
          href="https://www.twitter.com"
          className="mt-4 w-fit"
          label="Read mid tweets"
        />
      </div>
    </Bento>
  );
}

export default Twitter;
