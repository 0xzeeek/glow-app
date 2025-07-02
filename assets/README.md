# Assets Directory Structure

## Directory Organization

```
assets/
├── images/
│   ├── onboarding/       # Onboarding screen illustrations
│   ├── logos/            # App logos and brand assets
│   ├── backgrounds/      # Background images/patterns
│   └── tokens/           # Token/coin logos
├── icons/
│   ├── ui/              # UI icons (navigation, actions, etc.)
│   ├── social/          # Social media icons
│   └── crypto/          # Cryptocurrency/blockchain icons
├── animations/
│   └── onboarding/      # Lottie files or animation assets
└── fonts/               # Custom fonts (if any)
```

## Asset Naming Conventions

- Use lowercase with hyphens: `welcome-illustration.png`
- Include size in filename for multiple resolutions: `logo-2x.png`, `logo-3x.png`
- For dark/light variants: `icon-moon-dark.svg`, `icon-moon-light.svg`

## Image Guidelines

### Onboarding Images
- Preferred format: PNG with transparency or SVG
- Recommended sizes: 
  - Illustrations: 375x375 @2x, @3x
  - Full screen backgrounds: Device width x height

### Icons
- Format: SVG preferred, PNG fallback
- Sizes: 24x24, 32x32, 48x48 (with @2x, @3x variants)
- Ensure proper padding within icon bounds

### Logos
- Multiple formats: SVG + PNG
- Variations: Full logo, icon only, horizontal, stacked
- Include light and dark variants

## Optimization

- Compress all images before adding
- Use WebP format where supported
- Keep total asset size minimal for app performance
- Consider using vector (SVG) for icons and simple graphics

## File Size Limits

- Individual images: < 500KB
- Animations: < 1MB
- Total onboarding assets: < 5MB 