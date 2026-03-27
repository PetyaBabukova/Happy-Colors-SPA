// src/app/sitemap.js

import {
  PROD_SITE_URL,
  shouldIndexSite,
} from '@/config/siteSeo';

export default function sitemap() {
  if (!shouldIndexSite) {
    return [];
  }

  const now = new Date();

  return [
    {
      url: `${PROD_SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${PROD_SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${PROD_SITE_URL}/aboutus`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${PROD_SITE_URL}/contacts`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}