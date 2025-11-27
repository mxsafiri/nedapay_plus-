# 🎨 NEDAplus Landing Page

## Overview

Minimalist, modern landing page for NEDAplus with glassmorphism design, background video, and smooth animations.

## Features

### 🎬 Hero Section
- **Background Video**: BG.mp4 from public folder
- **Glassmorphism Cards**: Frosted glass effect with backdrop blur
- **Dual CTAs**: 
  - "NEDAplus+ Cross-Border" (Primary) → /auth/signup
  - "Tanzania nTZS" (Secondary) → /auth/signup
- **Trust Badges**: BoT Regulated, BaaS API, 130+ Countries

### ✨ Features Section
- **6 Key Features**:
  1. For Banks - White-label infrastructure
  2. API-First Platform - BaaS infrastructure
  3. Revenue Model - Banks & PSPs earn
  4. Instant Settlement - USDC-backed
  5. Fully Regulated - BoT licensed
  6. Global Coverage - 130+ countries
- **Stats Bar**: Countries, Revenue Potential, Uptime, Settlement Time

### 🤝 Partners Section
- **Infinite Scrolling Logos**: Stablecoins (USDC, USDT, EURC, etc.)
- **Network Partners**: Thunes, Hedera HCS, Base Network
- **Auto-pause on hover**

### 📣 CTA Section
- **Glowing Background Effect**
- **Dual CTAs**: Get Started Free + Sign In
- **Trust Indicators**: BoT Licensed, ISO 27001, AML/KYC

### 📱 Footer
- **Brand Info**: NEDAplus description
- **Contact**: Location, Email, Phone
- **Links**: Products, Company, Legal

## Design System

### Colors
- **Primary Gradient**: Emerald (500) → Cyan (500)
- **Background**: Black with subtle gradients
- **Glassmorphism**: White/10 with backdrop-blur-xl

### Typography
- **Headings**: Bold, Large (4xl-7xl)
- **Body**: Gray-200/300/400 for hierarchy
- **Accents**: Transparent bg-clip-text gradients

### Effects
- **Blur Cards**: `backdrop-blur-xl bg-white/10`
- **Hover Scale**: `hover:scale-105`
- **Shadows**: `shadow-2xl` with colored glows
- **Animations**: Pulse, bounce, fade-in

## Components Structure

```
app/page.tsx                          # Main landing page
├── components/landing/
│   ├── hero-section.tsx              # Hero with video background
│   ├── features-section.tsx          # 6 feature cards + stats
│   ├── partners-section.tsx          # Infinite scroll logos
│   ├── cta-section.tsx               # Final call-to-action
│   └── footer.tsx                    # Footer with links
```

## Key Messaging

### Primary Tagline
**"Pay anywhere, settle everywhere"**

### Subtitle
**"Unlocking Africa's Biggest Digital Asset Economy"**

### Description
**"Omnichannel layer for interoperability and money movement"**

### Regulation
**"Regulated by the Central Bank of Tanzania"**

## CTA Buttons

### NEDAplus+ Cross-Border
- **Icon**: Globe
- **Gradient**: Emerald → Cyan
- **Subtitle**: "130+ countries instantly"
- **Link**: /auth/signup

### Tanzania nTZS
- **Icon**: Shield
- **Color**: White/10 glass
- **Subtitle**: "Strategic Digital Reserve"
- **Link**: /auth/signup

## Assets Used

### Videos
- `/BG.mp4` - Background video loop

### Logos/Icons
- `/usdc-logo.svg` - USDC stablecoin
- `/usdt-coin.svg` - USDT stablecoin
- `/eurc-coin.png` - EURC stablecoin
- `/cadc-coin.png` - CADC stablecoin
- `/brl-coin.png` - BRL stablecoin
- `/cngn-icon.jpeg` - CNGN stablecoin
- `/zarp-coin.png` - ZARP stablecoin
- `/tryb-icon.png` - TRYB stablecoin

## Animations

### Infinite Scroll (Partners)
```css
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-120px * n - 48px * n)); }
}
```

### Hover Effects
- **Scale**: `hover:scale-105`
- **Shadow**: `hover:shadow-emerald-500/50`
- **Translate**: Arrow icons translate on hover

### Background Effects
- **Pulse**: Gradient backgrounds
- **Bounce**: Scroll indicator
- **Blur**: Glassmorphism throughout

## Customization

### Change Colors
Edit gradient classes:
```tsx
// From
className="bg-gradient-to-r from-emerald-500 to-cyan-500"

// To
className="bg-gradient-to-r from-purple-500 to-pink-500"
```

### Change Video
Replace `/BG.mp4` in public folder, or update:
```tsx
<source src="/YOUR-VIDEO.mp4" type="video/mp4" />
```

### Add More Partners
Edit `partners-section.tsx`:
```tsx
const partners = [
  { name: 'New Partner', logo: '/new-logo.png', type: 'crypto' },
  // ...
];
```

### Update Stats
Edit `features-section.tsx`:
```tsx
const stats = [
  { value: '130+', label: 'Countries' },
  { value: '$4.2M', label: 'Annual Revenue Potential' },
  // Add more...
];
```

## Responsive Design

### Breakpoints
- **Mobile**: Default (320px+)
- **Tablet**: md: (768px+)
- **Desktop**: lg: (1024px+)

### Mobile Optimizations
- Stack CTAs vertically on mobile
- Reduce text sizes: `text-4xl md:text-7xl`
- Adjust padding: `px-4 sm:px-6 lg:px-8`

## Performance

### Video Optimization
- **Autoplay**: Muted for browser compatibility
- **Loop**: Infinite playback
- **playsInline**: iOS compatibility

### Image Optimization
- Next.js Image component used
- Lazy loading enabled
- Proper width/height attributes

### Animations
- CSS-based (hardware accelerated)
- Reduced motion respected
- Pause on hover (infinite scroll)

## Accessibility

### Screen Readers
- Semantic HTML5 elements
- Alt text for all images
- ARIA labels where needed

### Keyboard Navigation
- All CTAs focusable
- Tab order logical
- Focus indicators visible

### Color Contrast
- WCAG AA compliant
- White text on dark backgrounds
- Sufficient contrast ratios

## SEO

### Meta Tags
Add to `app/layout.tsx`:
```tsx
export const metadata = {
  title: 'NEDAplus - Pay anywhere, settle everywhere',
  description: 'Africa\'s leading B2B payment infrastructure...',
};
```

### Structured Data
Consider adding JSON-LD for:
- Organization
- Product
- Service

## Browser Support

### Modern Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Features Used
- `backdrop-filter` (glassmorphism)
- CSS Grid
- Flexbox
- CSS Animations
- HTML5 Video

## Deployment Checklist

- [ ] Update contact email in footer
- [ ] Replace placeholder phone number
- [ ] Add real partner logos
- [ ] Compress video (< 5MB recommended)
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Add analytics tracking
- [ ] Set up meta tags
- [ ] Test video autoplay
- [ ] Check loading performance

## Marketing Copy Guidelines

### Tone
- Professional but approachable
- Confident and innovative
- Clear and concise

### Keywords
- Cross-border payments
- Digital assets
- Stablecoin
- BaaS (Banking as a Service)
- Regulated infrastructure
- Omnichannel

### Target Audience
1. **Banks**: Revenue opportunity, white-label
2. **PSPs**: Commission earnings, API access
3. **Enterprises**: Payment infrastructure, compliance

## Future Enhancements

### Phase 2
- [ ] Add video testimonials section
- [ ] Live transaction counter
- [ ] Interactive API explorer
- [ ] Case studies carousel
- [ ] Live chat widget

### Phase 3
- [ ] Multi-language support
- [ ] Dark/Light mode toggle
- [ ] Advanced animations (Framer Motion)
- [ ] Blog integration
- [ ] Documentation portal

## Support

For questions or customization help:
- Email: info@nedaplus.com
- Documentation: /docs
- API Reference: /api-docs

---

**Built with:** Next.js 15, React 19, TailwindCSS, TypeScript
**Last Updated:** November 2025
