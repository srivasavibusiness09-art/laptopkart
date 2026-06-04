# LaptopKart V2 Landing Page Design Specification

## Vision

Transform LaptopKart from a traditional ecommerce homepage into a premium Apple-style storytelling experience.

The user should experience a cinematic product reveal before reaching the actual shopping homepage.

The first screen should feel like a luxury technology commercial.

---

# User Flow

User enters website

↓

Premium Landing Experience

↓

Scroll-controlled cinematic animation

↓

Laptop fully assembled

↓

CTA appears

↓

Continue scrolling

↓

Homepage automatically revealed

↓

Standard ecommerce experience

---

# Global Theme

Replace the entire current blue ecommerce theme.

New theme inspired by:

* Apple Product Pages
* Alienware
* Nothing.tech
* ASUS ROG

## Colors

Background Primary

```css
#050816
```

Background Secondary

```css
#0B1220
```

Card Background

```css
#101827
```

Border

```css
#1E293B
```

Primary Glow

```css
#3B82F6
```

Secondary Glow

```css
#38BDF8
```

Text

```css
#E6EEF8
```

Muted Text

```css
#94A3B8
```

---

# Landing Page (Section 0)

This section appears BEFORE the current homepage.

Height:

```css
500vh
```

Purpose:

Allow scroll-controlled image sequence playback.

---

# Navigation (Landing Mode)

Navbar should be completely different from ecommerce navbar.

Layout:

Left:
Menu Icon

Center:
LaptopKart Logo

Right:
Skip Intro

Example

[ ☰ ]     LaptopKart     [ Home ]

---

# Home Button Behaviour

If user clicks Home

Do NOT instantly navigate.

Instead:

Play remaining frames rapidly.

Animate scroll.

Go directly to homepage.

User should still see transition.

---

# Landing Background

Pure dark premium theme.

No cards.

No buttons.

No product listings.

No distractions.

Only:

* Navbar
* Scroll animation
* Story text

---

# Main Animation

Use image sequence.

Folder:

```text
/public/frames/
```

Example:

```text
frame_0001.webp
frame_0002.webp
frame_0003.webp
...
frame_0300.webp
```

Animation occupies:

80% viewport height

Centered.

---

# Animation Story

## Scene 1

0% → 15%

Motherboard appears.

Text:

LaptopKart

Premium Refurbished Technology

Subtext:

Built for performance.
Tested for reliability.

---

## Scene 2

15% → 30%

CPU flies into motherboard.

Text:

Performance Restored

---

## Scene 3

30% → 45%

RAM enters.

Text:

Memory Upgraded

---

## Scene 4

45% → 60%

SSD enters.

Text:

Lightning Fast Storage

---

## Scene 5

60% → 75%

Cooling fan enters.

Text:

Thermally Tested

---

## Scene 6

75% → 90%

Display and keyboard connect.

Laptop completed.

Text:

72 Point Quality Check

---

## Scene 7

90% → 100%

Laptop rotates.

Blue glow increases.

Text:

Feels Brand New

Button:

Continue To Store

---

# Transition To Homepage

When landing section ends:

Background slowly changes.

Dark cinematic environment transitions into ecommerce homepage.

Feels like entering the store.

---

# Homepage Redesign

Current homepage structure remains.

But styling changes.

---

# Navbar (Homepage Mode)

Replace landing navbar.

Show:

Logo

Search

Offers

Laptops

Desktops

Accessories

Wishlist

Cart

Login

Like current design.

---

# Homepage Hero Section

Current image must be removed.

Replace with:

Completed laptop render from final animation frame.

Right side:

Premium floating laptop.

Left side:

Headline

```text
Certified Refurbished.
Built To Perform.
```

Subheadline

```text
Every device undergoes
72-point quality testing.
```

Buttons

```text
Shop Laptops
Why Refurbished?
```

---

# Hero Visual Effects

Floating animation

3D movement on mouse

Blue glow behind laptop

Subtle particles

Glassmorphism info cards

---

# Trust Metrics

Replace current boxes.

Use premium floating glass cards.

50,000+ Devices Sold

72+ Quality Checks

1 Year Warranty

4.8/5 Rating

---

# Scroll Experience

Landing Page:
Storytelling

Homepage:
Shopping

User should clearly feel:

"I finished watching a premium tech commercial and entered the store."

---

# Mobile Behaviour

Landing animation remains.

Use portrait crop.

Navbar remains:

Menu
Logo
Home

Animation width:

100%

Text below animation.

---

# Design Goal

When users visit LaptopKart they should immediately think:

"This feels like an Apple product page."

Not:

"This is another refurbished laptop website."
