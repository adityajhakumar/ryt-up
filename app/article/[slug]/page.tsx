import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArticleView } from '@/components/article-view'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

async function getArticle(slug: string) {
  // First try to find by slug
  let { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .not('answer', 'is', null)
    .single()

  // If not found by slug, try to find by ID (for backward compatibility)
  if (error || !data) {
    const { data: dataById, error: errorById } = await supabase
      .from('posts')
      .select('*')
      .eq('id', slug)
      .not('answer', 'is', null)
      .single()
    
    if (dataById && !errorById) {
      data = dataById
      error = errorById
    }
  }

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found | RytUp',
      description: 'The article you are looking for could not be found.'
    }
  }

  const description = article.description || article.answer?.slice(0, 150) + '...' || 'Read this insightful article on RytUp'
  const url = `https://rytup.vercel.app/article/${article.slug || article.id}`

  return {
    title: `${article.question} | RytUp`,
    description,
    openGraph: {
      title: article.question,
      description,
      url,
      type: 'article',
      siteName: 'RytUp - Voices of India',
      images: [
        {
          url: article.image_url || 'https://rytup.vercel.app/og-image.png',
          width: 1200,
          height: 630,
          alt: article.question,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.question,
      description,
      images: [article.image_url || 'https://rytup.vercel.app/og-image.png'],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return <ArticleView article={article} />
}
