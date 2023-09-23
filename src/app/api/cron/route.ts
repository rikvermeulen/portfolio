import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

import { env } from '@/env.mjs';

import { getSupabaseClient } from '@/lib/db';

const userClient = new TwitterApi({
  appKey: env.TWITTER_CONSUMER_KEY,
  appSecret: env.TWITTER_CONSUMER_SECRET,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function fetchTwitterData() {
  const readOnlyClient = userClient.readWrite;

  try {
    const user = await readOnlyClient.v2.me({
      expansions: ['pinned_tweet_id'],
      'tweet.fields': ['created_at', 'attachments', 'author_id', 'text', 'public_metrics'],
      'user.fields': ['name', 'profile_image_url'],
    });
    return user;
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
}

async function updateDatabase(userData: any, tweetData: any) {
  const supabase = getSupabaseClient();
  try {
    const { data: existingTweets } = await supabase
      .from('twitter_data')
      .select('id')
      .eq('pinnedTweetId', tweetData?.id || '');

    if (existingTweets && existingTweets.length) {
      await supabase.from('twitter_data').delete().match({ id: existingTweets[0].id });
    }

    const res = await supabase.from('twitter_data').insert({
      id: tweetData?.id,
      twitterUserId: userData.id,
      userName: userData.username,
      profile_image_url: userData.profile_image_url,
      pinned_tweet_id: userData.pinned_tweet_id,
      tweetCreatedAt: tweetData?.created_at,
      tweetText: tweetData?.text,
      tweetRetweetCount: tweetData?.public_metrics?.retweet_count,
      tweetReplyCount: tweetData?.public_metrics?.reply_count,
      tweetLikeCount: tweetData?.public_metrics?.like_count,
      tweetAttachments: tweetData?.attachments,
    });

    if (res.error) {
      console.error('Error updating database:', res.error);
      throw new Error(res.error.message);
    }
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const user = await fetchTwitterData();
    const u = user.data;
    const t = user.includes?.tweets?.[0];
    await updateDatabase(u, t);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ ok: false, error: error });
  }
}
