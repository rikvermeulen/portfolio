import X from '@/components/Bento/types/Twitter';

import { getSupabaseClient } from '@/lib/db';

interface TweetProps {
  userName: string;
  tweetText: string;
  tweetCreatedAt: string;
  tweetLikeCount: number;
  tweetRetweetCount: number;
}

async function getDataFromSupabase(): Promise<TweetProps> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('twitter_data')
    .select('*')
    .limit(1)
    .order('id', { ascending: false });
  if (error) throw error;
  return data[0] as unknown as TweetProps;
}

export default async function Twitter() {
  const data = await getDataFromSupabase();

  if (!data) return <></>;

  return <X tweet={data}></X>;
}
