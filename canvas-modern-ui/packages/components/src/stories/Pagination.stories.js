import { jsx as _jsx } from "react/jsx-runtime";
import { Pagination } from '../ui/pagination/Pagination';
import { useState } from 'react';
const meta = {
    title: 'Components/Pagination',
    component: Pagination,
    tags: ['autodocs'],
};
export default meta;
export const Default = {
    render: () => {
        const [page, setPage] = useState(1);
        return _jsx(Pagination, { currentPage: page, totalPages: 10, onPageChange: setPage });
    },
};
export const ManyPages = {
    render: () => {
        const [page, setPage] = useState(5);
        return _jsx(Pagination, { currentPage: page, totalPages: 50, onPageChange: setPage });
    },
};
export const FewPages = {
    render: () => {
        const [page, setPage] = useState(1);
        return _jsx(Pagination, { currentPage: page, totalPages: 3, onPageChange: setPage });
    },
};
//# sourceMappingURL=Pagination.stories.js.map