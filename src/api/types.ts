export type GridVersion = {
    id: string,
    version: string,
    isLatest: boolean,
    lastUpdated: string,
    lastChecked: string
}

export type SearchResultMetadata = {
    slug: string,
    type: string,
    title: string,
    content: string,
    articleSlug: string,
    articleTitle: string,
    chunkContent: string,
    chunkType: string,
    semanticScore: number,
    lexicalScore: number
}

export type SearchResult = {
    sectionId: string,
    score: number,
    metadata: SearchResultMetadata
}

export type SearchResponse = {
    query: string,
    results: SearchResult[],
    meta: {
        total: number,
        framework: string,
        version: string
    }
}