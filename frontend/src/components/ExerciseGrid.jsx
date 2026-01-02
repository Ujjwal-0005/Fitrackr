import React from 'react';
import ExerciseCard from './ExerciseCard';

const ExerciseGrid = ({ exercises, onExerciseClick }) => {
    if (exercises.length === 0) {
        return (
            <div className="text-center py-32">
                <div className="mb-6">
                    <svg className="w-20 h-20 mx-auto text-[#FE9A00]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-[#6b7280] text-xl font-medium mb-2">No exercises found</p>
                <p className="text-[#6b7280] text-sm">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {exercises.map((exercise, index) => (
                <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onClick={() => onExerciseClick(exercise)}
                />
            ))}
        </div>
    );
};

export default ExerciseGrid;
