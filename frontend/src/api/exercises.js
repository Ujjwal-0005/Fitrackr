/**
 * Exercise API Helper
 * Fetches exercise data from static JSON endpoint
 */

const EXERCISES_URL = 'https://fitrackr-ivory.vercel.app/final-exercises.json';

/**
 * Fetch all exercises from static JSON
 * This should only be called ONCE per session
 */
export const fetchExercises = async () => {
    try {
        const response = await fetch(EXERCISES_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Fetched exercises:', data.length);
        return data;
    } catch (error) {
        console.error('❌ Error fetching exercises:', error);
        throw error;
    }
};
