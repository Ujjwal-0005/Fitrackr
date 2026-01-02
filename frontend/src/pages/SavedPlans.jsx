import React, { useEffect, useState } from "react";
import { getPlans, deletePlan } from "../api/ai";
import PlanCard from "../components/PlanCard";

const SavedPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await getPlans();
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this plan?")) return;
    await deletePlan(index);
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Saved Workout Plans</h1>

      {loading ? (
        <p>Loading...</p>
      ) : plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan, idx) => (
            <PlanCard
              key={idx}
              plan={plan}
              onDelete={() => handleDelete(idx)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No saved plans yet. Generate one!</p>
      )}
    </div>
  );
};

export default SavedPlans;
