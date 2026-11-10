export function getValidRegions(results) {
  const regions = results?.json?.detected_regions;
  if (!Array.isArray(regions)) return [];
  return regions.filter(
    (region) =>
      Array.isArray(region?.bbox) &&
      region.bbox.length === 4 &&
      region.bbox.every(Number.isFinite) &&
      region.bbox[0] >= 0 &&
      region.bbox[1] >= 0 &&
      region.bbox[2] > region.bbox[0] &&
      region.bbox[3] > region.bbox[1],
  );
}
