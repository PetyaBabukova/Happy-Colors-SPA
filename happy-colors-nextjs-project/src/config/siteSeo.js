// src/config/siteSeo.js

const PROD_SITE_URL = 'https://happycolors.eu';
const LOCAL_URL = 'http://localhost:3000';

export const SITE_ENV = process.env.NEXT_PUBLIC_SITE_ENV || 'development';
export const IS_PULL_REQUEST_PREVIEW =
  process.env.IS_PULL_REQUEST === 'true';

export const isProductionSite = SITE_ENV === 'production';
export const isPreviewSite =
  SITE_ENV === 'preview' || IS_PULL_REQUEST_PREVIEW;

export const shouldIndexSite = isProductionSite;

export const currentSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (isProductionSite ? PROD_SITE_URL : LOCAL_URL);

export const metadataBaseUrl = new URL(
  isProductionSite ? PROD_SITE_URL : currentSiteUrl
);

export { PROD_SITE_URL };

export function buildPageMetadata({
  title,
  description,
  path,
  indexable = true,
}) {
  const canIndexThisPage = shouldIndexSite && indexable;

  return {
    title,
    description,
    robots: {
      index: canIndexThisPage,
      follow: canIndexThisPage,
    },
    ...(canIndexThisPage && path
      ? {
          alternates: {
            canonical: path,
          },
        }
      : {}),
  };
}