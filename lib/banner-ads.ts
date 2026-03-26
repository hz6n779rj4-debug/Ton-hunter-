import { unstable_noStore as noStore } from 'next/cache';
import { supabaseAdmin, storageBucket } from './supabase';
import { BannerAd } from './types';

const bannerBucket = process.env.NEXT_PUBLIC_SUPABASE_BANNER_BUCKET || storageBucket;

const sampleBannerAds: BannerAd[] = [
  {
    id: 'sample-banner-1',
    title: 'Book a Ton Gemz banner',
    image_url: '/tongemz-logo.png',
    target_url: '/banner-ads',
    is_active: true,
    starts_at: null,
    ends_at: null,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
];

function normalizeBannerAd(ad: Partial<BannerAd>): BannerAd {
  return {
    id: String(ad.id || crypto.randomUUID()),
    title: String(ad.title || 'Banner Ad'),
    image_url: String(ad.image_url || '/tongemz-logo.png'),
    target_url: String(ad.target_url || '/banner-ads'),
    is_active: Boolean(ad.is_active),
    starts_at: ad.starts_at || null,
    ends_at: ad.ends_at || null,
    display_order: Number(ad.display_order || 0),
    created_at: String(ad.created_at || new Date().toISOString()),
  };
}

function isBannerLive(ad: BannerAd) {
  const now = Date.now();
  const startsOk = !ad.starts_at || new Date(ad.starts_at).getTime() <= now;
  const endsOk = !ad.ends_at || new Date(ad.ends_at).getTime() >= now;
  return ad.is_active && startsOk && endsOk;
}

function resolvePublicImage(imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
  if (!supabaseAdmin) return imageUrl;
  const { data } = supabaseAdmin.storage.from(bannerBucket).getPublicUrl(imageUrl);
  return data.publicUrl;
}

export async function getBannerAds(includeInactive = false): Promise<BannerAd[]> {
  noStore();
  if (!supabaseAdmin) {
    const sample = sampleBannerAds.map(normalizeBannerAd);
    return includeInactive ? sample : sample.filter(isBannerLive);
  }

  const { data, error } = await supabaseAdmin
    .from('banner_ads')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    const sample = sampleBannerAds.map(normalizeBannerAd);
    return includeInactive ? sample : sample.filter(isBannerLive);
  }

  const normalized = data.map((item) => normalizeBannerAd(item as Partial<BannerAd>)).map((item) => ({
    ...item,
    image_url: resolvePublicImage(item.image_url),
  }));

  return includeInactive ? normalized : normalized.filter(isBannerLive);
}

export async function getPrimaryBannerAd() {
  noStore();
  const liveBanners = await getBannerAds(false);
  if (liveBanners[0]) return liveBanners[0];

  const allBanners = await getBannerAds(true);
  return allBanners.find((banner) => banner.is_active) || null;
}

export async function uploadBannerImage(file: File) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin storage is not configured.');
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const filePath = `banner-ads/${fileName}`;

  const { error } = await supabaseAdmin.storage.from(bannerBucket).upload(filePath, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw error;
  return filePath;
}
