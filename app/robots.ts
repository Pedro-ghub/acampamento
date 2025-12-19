import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/__adm_acampamento_carnaval_2026__', '/admin'],
      },
    ],
  }
}

