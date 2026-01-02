import React from 'react';

const Pagination = ({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    onGoToPage,
    hasPrevious,
    hasNext,
    startIndex,
    endIndex,
    totalItems
}) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show current page with 2 pages before and after
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, currentPage + 2);

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            {/* Results info */}
            <p className="text-[#a8adb3] text-sm">
                Showing <span className="text-[#FE9A00] font-bold">{startIndex}</span> to{' '}
                <span className="text-[#FE9A00] font-bold">{endIndex}</span> of{' '}
                <span className="text-[#FE9A00] font-bold">{totalItems}</span> exercises
            </p>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${hasPrevious
                            ? 'bg-[#FE9A00]/20 border border-[#FE9A00]/40 text-[#FE9A00] hover:bg-[#FE9A00]/30'
                            : 'bg-[#1a1d23]/40 border border-[#1a1d23] text-[#6b7280] cursor-not-allowed'
                        }`}
                >
                    ← Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-2">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#6b7280]">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onGoToPage(page)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${page === currentPage
                                        ? 'bg-[#FE9A00] text-black'
                                        : 'bg-[#1a1d23]/40 border border-[#FE9A00]/20 text-[#FE9A00] hover:bg-[#FE9A00]/20'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next button */}
                <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${hasNext
                            ? 'bg-[#FE9A00]/20 border border-[#FE9A00]/40 text-[#FE9A00] hover:bg-[#FE9A00]/30'
                            : 'bg-[#1a1d23]/40 border border-[#1a1d23] text-[#6b7280] cursor-not-allowed'
                        }`}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Pagination;
