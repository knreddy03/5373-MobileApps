export const haversineDistance = (coord1, coord2) => {
    const toRadian = (degree) => (degree * Math.PI) / 180;
  
    const R = 6371; // Earth's radius in km
    const dLat = toRadian(coord2.latitude - coord1.latitude);
    const dLng = toRadian(coord2.longitude - coord1.longitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadian(coord1.latitude)) *
        Math.cos(toRadian(coord2.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Return distance in km
  };
  