import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
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

export default async function Page({ params, searchParams }: Props) {
  return (
    <RootPage
      config={config}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  )
}
