export const C = {
  bg:          '#060810',
  bgCard:      '#0D1117',
  bgElevated:  '#121827',
  bgHighlight: '#1A2235',

  accent:      '#FF9F1C',
  accentDim:   '#FF9F1C44',
  accentGlow:  '#FF9F1C1A',

  text:        '#EDF2FF',
  textSub:     '#7B8DB0',
  textDim:     '#3D4F6B',
  textAccent:  '#FF9F1C',

  success:     '#0DFFD4',
  error:       '#FF3B5C',

  border:      '#1E2A40',
  borderAccent:'#FF9F1C55',

  tab:         '#080C14',
  overlay:     'rgba(6,8,16,0.93)',
} as const;

export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const R = {
  sm:   6,
  md:   12,
  lg:   18,
  xl:   28,
  full: 999,
} as const;

export const F = {
  mono:       'JetBrainsMono_400Regular',
  monoBold:   'JetBrainsMono_700Bold',
  body:       'Inter_400Regular',
  bodyMed:    'Inter_500Medium',
  bodySemi:   'Inter_600SemiBold',
  bodyBold:   'Inter_700Bold',
} as const;
