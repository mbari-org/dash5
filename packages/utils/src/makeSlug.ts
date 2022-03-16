/**
 * A generic type that features all of the index keys on the master resource table.
 */
interface IMasterResource {
  indexSortKey: string
  secondaryIndexSortKey: string
  partitionKey: string
  sortKey: string
}

/**
 * Generates a unique slug based on a supplied title. An increment will
 * to the name if a conflict exists in the index.
 * @param title The title used to generate the url friendly slug
 * @param currentId An optional ID used to filter out the existing result from potential conflicts.
 */
export const makeSlug = async <T extends IMasterResource>({
  title,
  currentId,
  lookupMatches,
}: {
  title: string
  lookupMatches: (params: { slug: string }) => Promise<T[]>
  currentId?: string
}): Promise<string> => {
  const slug = (title ?? 'unknown')
    .toLowerCase()
    .split(' ')
    .map((w) => w.replace(/[^0-9a-z]/gi, ''))
    .join('-')
  const matches = (await lookupMatches({ slug })) ?? []
  const slugs = matches.map((m) => m.indexSortKey ?? '')
  const slugUnique = slugs.filter((s) => s === slug).length === 1
  const exactMatch = matches.filter((m) => m.partitionKey === currentId)[0]

  if (currentId && exactMatch?.indexSortKey === slug && slugUnique) {
    return slug
  }

  const increments = slugs
    .map((slug) => parseInt(slug.split('-').reverse()[0] ?? '0', 0))
    .map((n, i) => (isNaN(n) ? i : n))
  const increment = Math.max(...increments)
  const finalSlug = [slug, increment > 0 ? increment + 1 : null]
    .filter((i) => i)
    .join('-')
  return finalSlug
}
