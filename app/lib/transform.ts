export const getOverallData = (data: any[]) => {
  return data.map((u) => ({
    name: u.name,
    points: u.totalPoints,
  }));
};

export const getDailyData = (data: any[]) => {
  const map: Record<string, any> = {};

  data.forEach((user) => {
    user.daily.forEach((d: any) => {
      if (!map[d.day]) map[d.day] = { day: d.day };

      map[d.day][user.name] = d.points;
    });
  });

  return Object.values(map);
};
