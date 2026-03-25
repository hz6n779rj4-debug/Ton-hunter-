import { sampleTokens } from './sample-data';
import { supabaseAdmin } from './supabase';
import { ListedToken } from './types';

const TONAPI_BASE=process.env.TONAPI_BASE_URL||'https://tonapi.io/v2';
const STON_API_BASE=process.env.STON_API_BASE_URL||'https://api.ston.fi/v1';
const headers=():HeadersInit=>{const token=process.env.TONAPI_KEY;return token?{Authorization:`Bearer ${token}`}:{}};

async function getDbTokens():Promise<ListedToken[]>{
  if(!supabaseAdmin) return sampleTokens;
  const {data,error}=await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('status','approved')
    .order('promoted',{ascending:false})
    .order('votes_24h',{ascending:false});
  if(error||!data?.length) return sampleTokens;
  return data as ListedToken[];
}

async function enrichToken(token:ListedToken):Promise<ListedToken>{
  try{
    const [jetton, market]=await Promise.all([
      fetch(`${TONAPI_BASE}/jettons/${token.address}`,{headers:headers(),next:{revalidate:180}}),
      fetch(`${STON_API_BASE}/assets/${token.address}`,{next:{revalidate:180}}),
    ]);
    const jettonJson=jetton.ok?await jetton.json():null;
    const marketJson=market.ok?await market.json():null;
    const resolved=marketJson?.asset||marketJson?.data||marketJson||{};
    return {
      ...token,
      name:jettonJson?.metadata?.name||token.name,
      symbol:jettonJson?.metadata?.symbol||token.symbol,
      logo_url:token.logo_url||jettonJson?.metadata?.image||'/tonhunters-logo.jpeg',
      description:token.description||jettonJson?.metadata?.description||'',
      holders:Number(jettonJson?.holders_count||token.holders),
      price_usd:Number(resolved?.dex_usd_price||resolved?.priceUsd||token.price_usd),
      market_cap_usd:Number(resolved?.dex_market_cap_usd||resolved?.marketCapUsd||token.market_cap_usd),
      liquidity_usd:Number(resolved?.dex_liquidity_usd||resolved?.liquidityUsd||token.liquidity_usd),
      volume_24h_usd:Number(resolved?.volume_24h_usd||resolved?.volume24hUsd||token.volume_24h_usd),
      change_24h_percent:Number(resolved?.price_change_24h||resolved?.change24h||token.change_24h_percent),
    };
  }catch{
    return token;
  }
}

export async function getTokens():Promise<ListedToken[]>{
  const tokens=await getDbTokens();
  return Promise.all(tokens.map((token)=>enrichToken(token)));
}

export async function getTokenByAddress(address:string):Promise<ListedToken|null>{
  const tokens=await getTokens();
  return tokens.find((token)=>token.address===address)||null;
}

export async function getHomepageData(){
  const tokens=await getTokens();
  const promoted=tokens.filter((token)=>token.promoted).slice(0,3);
  const topVoted=[...tokens].sort((a,b)=>b.votes_all_time-a.votes_all_time).slice(0,6);
  const top24h=[...tokens].sort((a,b)=>b.votes_24h-a.votes_24h).slice(0,6);
  const topGainers=[...tokens].filter((token)=>typeof token.change_24h_percent==='number').sort((a,b)=>(b.change_24h_percent||0)-(a.change_24h_percent||0)).slice(0,6);
  const latest=[...tokens].sort((a,b)=>new Date(b.listed_at).getTime()-new Date(a.listed_at).getTime()).slice(0,6);
  const stats={totalTokens:tokens.length,totalVotes24h:tokens.reduce((sum,token)=>sum+(token.votes_24h||0),0),promotedCount:tokens.filter((token)=>token.promoted).length,totalMarketCap:tokens.reduce((sum,token)=>sum+(token.market_cap_usd||0),0)};
  return {tokens,promoted,topVoted,top24h,topGainers,latest,stats};
}
