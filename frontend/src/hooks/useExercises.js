import { useState, useEffect, useMemo } from 'react';
import { fetchExercises } from '../api/exercises';

const ITEMS_PER_PAGE = 20;

/**
 * Custom hook for managing exercises
 * Fetches once, provides search/filter/pagination functionality
 */
export const useExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bodyPartFilter, setBodyPartFilter] = useState('all');
    const [equipmentFilter, setEquipmentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch exercises once on mount
    useEffect(() => {
        const loadExercises = async () => {
            try {
                setLoading(true);
                const data = await fetchExercises();
                setExercises(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to load exercises:', err);
            } finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, []);

    // Get unique body parts for filter
    const bodyParts = useMemo(() => {
        const parts = new Set(exercises.map(ex => ex.bodyPart));
        return ['all', ...Array.from(parts).sort()];
    }, [exercises]);

    // Get unique equipment for filter
    const equipmentTypes = useMemo(() => {
        const types = new Set(exercises.map(ex => ex.equipment));
        return ['all', ...Array.from(types).sort()];
    }, [exercises]);

    // Filter exercises based on search and filters
    const filteredExercises = useMemo(() => {
        return exercises.filter(exercise => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exercise.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exercise.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());

            // Body part filter
            const matchesBodyPart = bodyPartFilter === 'all' ||
                exercise.bodyPart === bodyPartFilter;

            // Equipment filter
            const matchesEquipment = equipmentFilter === 'all' ||
                exercise.equipment === equipmentFilter;

            return matchesSearch && matchesBodyPart && matchesEquipment;
        });
    }, [exercises, searchQuery, bodyPartFilter, equipmentFilter]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedExercises = filteredExercises.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, bodyPartFilter, equipmentFilter]);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setBodyPartFilter('all');
        setEquipmentFilter('all');
        setCurrentPage(1);
    };

    // Pagination controls
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return {
        exercises: paginatedExercises,
        allExercises: exercises,
        filteredCount: filteredExercises.length,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        bodyPartFilter,
        setBodyPartFilter,
        equipmentFilter,
        setEquipmentFilter,
        bodyParts,
        equipmentTypes,
        clearFilters,
        hasFilters: searchQuery !== '' || bodyPartFilter !== 'all' || equipmentFilter !== 'all',
        // Pagination
        currentPage,
        totalPages,
        itemsPerPage: ITEMS_PER_PAGE,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, filteredExercises.length)
    };
};
