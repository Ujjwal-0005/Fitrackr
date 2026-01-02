// Plate Calculator - calculates which plates to load on each side of barbell
export const calculatePlates = (targetWeight, barWeight = 20) => {
  const weightPerSide = (targetWeight - barWeight) / 2;
  
  if (weightPerSide <= 0) {
    return { plates: [], message: "Weight is less than or equal to bar weight" };
  }

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const plates = [];
  let remaining = weightPerSide;

  for (const plate of availablePlates) {
    while (remaining >= plate) {
      plates.push(plate);
      remaining -= plate;
    }
  }

  if (Math.abs(remaining) > 0.01) {
    return {
      plates,
      message: `Closest match: ${(barWeight + plates.reduce((sum, p) => sum + p, 0) * 2).toFixed(2)}kg (${remaining.toFixed(2)}kg short)`,
    };
  }

  return {
    plates,
    message: `Load ${plates.join(", ")}kg on each side`,
  };
};

// Group plates by count
export const groupPlates = (plates) => {
  const grouped = {};
  plates.forEach((plate) => {
    grouped[plate] = (grouped[plate] || 0) + 1;
  });
  return Object.entries(grouped).map(([weight, count]) => ({
    weight: parseFloat(weight),
    count,
  }));
};
