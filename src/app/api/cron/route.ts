import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

import { env } from '@/env.mjs';

import { supabase } from '@/lib/db';

const userClient = new TwitterApi({
  appKey: env.TWITTER_CONSUMER_KEY,
  appSecret: env.TWITTER_CONSUMER_SECRET,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
});

export async function GET() {
  const readOnlyClient = userClient.readWrite;

  const user = await readOnlyClient.v2.me({
    expansions: ['pinned_tweet_id'],
    'tweet.fields': ['created_at', 'attachments', 'author_id', 'text', 'public_metrics'],
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

  const res = await supabase.from('twitter_data').insert({
    id: t?.id,
    twitterUserId: u.id,
    userName: u.username,
    profile_image_url: u.profile_image_url,
    pinned_tweet_id: u.pinned_tweet_id,
    tweetCreatedAt: t?.created_at,
    tweetText: t?.text,
    tweetRetweetCount: t?.public_metrics?.retweet_count,
    tweetReplyCount: t?.public_metrics?.reply_count,
    tweetLikeCount: t?.public_metrics?.like_count,
    tweetAttachments: t?.attachments,
  });

  if (res.status !== 200) {
    console.log(res);
  }

  return NextResponse.json({ ok: true });
}
