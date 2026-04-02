// src/app/robots.js

import {
  PROD_SITE_URL,
  currentSiteUrl,
  shouldIndexSite,
} from '@/config/siteSeo';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host: shouldIndexSite ? PROD_SITE_URL : currentSiteUrl,
    ...(shouldIndexSite
      ? {
          sitemap: `${PROD_SITE_URL}/sitemap.xml`,
        }
      : {}),
  };
}