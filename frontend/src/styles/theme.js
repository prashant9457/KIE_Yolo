// Single source of truth for application colors and third-party component themes.
export const colors = Object.freeze({
  page: '#f6f7f9',
  surface: '#ffffff',
  canvas: '#f0f2f5',
  subtle: '#f8f9fb',
  text: '#202124',
  secondary: '#5f6368',
  muted: '#747980',
  line: '#e1e4e8',
  outline: '#b8bfc8',
  accent: '#0b57d0',
  accentHover: '#0848ae',
  accentSoft: '#eaf1fd',
  onAccent: '#ffffff',
  success: '#246b45',
  successSoft: '#edf5ef',
  error: '#b3261e',
  errorSoft: '#fceeed',
});

export const radii = Object.freeze({ control: 12, panel: 24, inner: 18, pill: 999 });
export const easing = [0.22, 1, 0.36, 1];
export const annotationColors = Object.freeze(['#0b57d0', '#476b9c', '#356d69', '#795b32']);

export const themeVariables = Object.fromEntries([
  ...Object.entries(colors).map(([key, value]) => [`--color-${key}`, value]),
  ...Object.entries(radii).map(([key, value]) => [`--radius-${key}`, `${value}px`]),
]);

export function applyTheme(element) {
  for (const [token, value] of Object.entries(themeVariables))
    element.style.setProperty(token, value);
}

export const listTheme = {
  '--al-tile': colors.surface,
  '--al-tile-edge': 'transparent',
  '--al-tile-highlight': 'transparent',
  '--al-tile-shadow': 'none',
  '--al-well': colors.canvas,
  '--al-ink': colors.text,
  '--al-muted': colors.secondary,
  '--al-thumb': colors.outline,
  '--al-ring': colors.line,
  '--al-ring-fill': colors.accentSoft,
  '--al-hover': 'none',
  '--al-press': 'none',
  '--al-active': 'none',
};
