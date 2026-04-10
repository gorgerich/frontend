import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
return [
{
url: 'https://tihiydom.com',
lastModified: new Date(),
changeFrequency: 'weekly',
priority: 1,
},
{
url: 'https://tihiydom.com/articles',
lastModified: new Date(),
changeFrequency: 'weekly',
priority: 0.8,
},
{
url: 'https://tihiydom.com/faq',
lastModified: new Date(),
changeFrequency: 'monthly',
priority: 0.7,
},
]
}