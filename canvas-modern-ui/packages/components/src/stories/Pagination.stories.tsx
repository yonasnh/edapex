import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from '../ui/pagination/Pagination'
import React, { useState } from 'react'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj<typeof Pagination> = {
  render: () => {
    const [page, setPage] = useState(1)
    return <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
  },
}

export const ManyPages: StoryObj<typeof Pagination> = {
  render: () => {
    const [page, setPage] = useState(5)
    return <Pagination currentPage={page} totalPages={50} onPageChange={setPage} />
  },
}

export const FewPages: StoryObj<typeof Pagination> = {
  render: () => {
    const [page, setPage] = useState(1)
    return <Pagination currentPage={page} totalPages={3} onPageChange={setPage} />
  },
}
