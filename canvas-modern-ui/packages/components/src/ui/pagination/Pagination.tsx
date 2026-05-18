import React, { memo, useCallback } from 'react'
import clsx from 'clsx'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  showFirstLast?: boolean
  className?: string
}

function range(start: number, end: number): (number | 'ellipsis')[] {
  const items: (number | 'ellipsis')[] = []
  for (let i = start; i <= end; i++) items.push(i)
  return items
}

function getPageNumbers(current: number, total: number, siblings: number): (number | 'ellipsis')[] {
  if (total <= 7) return range(1, total)

  const leftSibling = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblings
    return [...range(1, leftCount), 'ellipsis', total]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblings
    return [1, 'ellipsis', ...range(total - rightCount + 1, total)]
  }

  return [1, 'ellipsis', ...range(leftSibling, rightSibling), 'ellipsis', total]
}

export const Pagination = memo<PaginationProps>(({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
}) => {
  const go = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page)
  }, [onPageChange, totalPages])

  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages, siblingCount)

  return (
    <nav className={clsx('cm-pagination', className)} aria-label="Pagination">
      {showFirstLast && (
        <button className="cm-pagination__btn" onClick={() => go(1)} disabled={currentPage === 1} aria-label="First page">«</button>
      )}
      <button className="cm-pagination__btn" onClick={() => go(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="cm-pagination__ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={clsx('cm-pagination__btn', 'cm-pagination__page', p === currentPage && 'cm-pagination__page--active')}
            onClick={() => go(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        )
      )}
      <button className="cm-pagination__btn" onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
      {showFirstLast && (
        <button className="cm-pagination__btn" onClick={() => go(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">»</button>
      )}
    </nav>
  )
})

Pagination.displayName = 'Pagination'
