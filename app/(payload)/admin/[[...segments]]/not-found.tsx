import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap.js'
import React from 'react'

type PageParams = { segments: string[] }
type SearchParams = { [key: string]: string | string[] }

type Props = {
  params: Promise<PageParams>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params, searchParams }: Props) {
  return generatePageMetadata({
    config,
    params,
    searchParams,
  })
}

export default async function NotFound({ params, searchParams }: Props) {
  return (
    <NotFoundPage
      config={config}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  )
}
