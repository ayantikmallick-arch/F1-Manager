const svgFiles = import.meta.glob("./tracks/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseTrackSvg(filePath, source) {
  const svgTag = source.match(/<svg\b[^>]*>/i)?.[0];
  const pathData = source.match(/<path\b[^>]*\bd="([^"]+)"/i)?.[1];
  if (!svgTag || !pathData || !/^[MmLlHhVvCcSsQqTtAaZz0-9+.,\-\s]+$/.test(pathData)) {
    throw new Error(`Invalid circuit SVG asset: ${filePath}`);
  }

  const attribute = (name) => svgTag.match(new RegExp(`\\b${name}="([^"]+)"`, "i"))?.[1];
  const viewBox = attribute("viewBox");
  const dimensions = viewBox || `0 0 ${Number.parseFloat(attribute("width"))} ${Number.parseFloat(attribute("height"))}`;
  if (!dimensions.split(/\s+/).every((value) => Number.isFinite(Number(value)))) {
    throw new Error(`Circuit SVG has invalid dimensions: ${filePath}`);
  }

  const layoutId = filePath.split("/").pop().replace(/\.svg$/i, "");
  return [layoutId, { layoutId, viewBox: dimensions, path: pathData.replace(/\s+/g, " ").trim() }];
}

const trackAssets = Object.fromEntries(
  Object.entries(svgFiles).map(([filePath, source]) => parseTrackSvg(filePath, source)),
);

export function getTrackAsset(layoutId) {
  const asset = trackAssets[layoutId];
  if (!asset) throw new Error(`Missing official circuit SVG layout: ${layoutId}`);
  return asset;
}
