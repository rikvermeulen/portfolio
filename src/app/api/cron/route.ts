import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { TwitterApi } from 'twitter-api-v2';

import { env } from '@/env.mjs';

const userClient = new TwitterApi({
  appKey: env.TWITTER_CONSUMER_KEY,
  appSecret: env.TWITTER_CONSUMER_SECRET,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
});

export async function POST(req: NextRequest, res: NextResponse) {
  const supabase = createMiddlewareClient({ req, res });

  const readOnlyClient = userClient.readWrite;

  const user = await readOnlyClient.v2.me({
    expansions: ['pinned_tweet_id'],
    'tweet.fields': ['created_at', 'attachments', 'author_id', 'text'],
    'user.fields': ['name', 'profile_image_url'],
  });

  const u = user.data;
  const t = user.includes?.tweets?.[0];

  const { data: existingTweets } = await supabase
    .from('twitter_data')
    .select('id')
    .eq('pinnedTweetId', t?.id);

  if (existingTweets && existingTweets.length) {
    await supabase.from('twitter_data').delete().match({ id: existingTweets[0].id });
  }

  await supabase.from('twitter_data').insert({
    id: t?.id,
    twitterUserId: u.id,
    userName: u.name,
    userProfileImageUrl: u.profile_image_url,
    pinnedTweetId: t?.id,
    tweetCreatedAt: t?.created_at,
    tweetText: t?.text,
    tweetRetweetCount: t?.public_metrics?.retweet_count,
    tweetReplyCount: t?.public_metrics?.reply_count,
    tweetLikeCount: t?.public_metrics?.like_count,
    tweetAttachments: t?.attachments,
  });

  return NextResponse.json({ ok: true });
}
