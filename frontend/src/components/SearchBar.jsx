import React from 'react';

const SearchBar = ({
    searchQuery,
    onSearchChange,
    bodyPartFilter,
    onBodyPartChange,
    equipmentFilter,
    onEquipmentChange,
    bodyParts,
    equipmentTypes,
    onClearFilters,
    hasFilters
}) => {
    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search exercises by name, target, or body part..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-6 py-4 pl-14 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#FE9A00] transition-all"
                />
                <svg
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FE9A00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                {/* Body Part Filter */}
                <select
                    value={bodyPartFilter}
                    onChange={(e) => onBodyPartChange(e.target.value)}
                    className="px-4 py-2 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-lg text-white focus:outline-none focus:border-[#FE9A00] transition-all capitalize cursor-pointer"
                >
                    {bodyParts.map(part => (
                        <option key={part} value={part} className="bg-[#0f1115] capitalize">
                            {part === 'all' ? 'All Body Parts' : part}
                        </option>
                    ))}
                </select>

                {/* Equipment Filter */}
                <select
                    value={equipmentFilter}
                    onChange={(e) => onEquipmentChange(e.target.value)}
                    className="px-4 py-2 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-lg text-white focus:outline-none focus:border-[#FE9A00] transition-all capitalize cursor-pointer"
                >
                    {equipmentTypes.map(type => (
                        <option key={type} value={type} className="bg-[#0f1115] capitalize">
                            {type === 'all' ? 'All Equipment' : type}
                        </option>
                    ))}
                </select>

                {/* Clear Filters Button */}
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-lg text-[#FE9A00] hover:bg-[#FE9A00]/30 transition-all font-medium"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
