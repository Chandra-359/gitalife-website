# Gita Life NYC — Website Specification Document

> A detailed blueprint for the Gita Life NYC website, an ISKCON preaching initiative.

---

## 1. Purpose & Vision

**Goal:** Create a warm, modern, mobile-first website that introduces newcomers to Gita Life NYC's spiritual programs and helps them find the right program based on their age, location, interests, and background.

**Target Audience:**
- College students (18–24) discovering spirituality for the first time
- Young professionals (24–35) looking for community and deeper meaning
- Women seeking a supportive spiritual community
- Anyone in NYC curious about the Bhagavad Gita, Vedic philosophy, or ISKCON

**Tone:** Welcoming, modern, spiritual but not preachy. Think "cool friend who invites you to something life-changing" — not "institutional religious org."

---

## 2. Site Map

```
Home Page (/)
├── Hero Section
├── What is Gita Life?
├── Impact Stats
├── Our Programs
├── Testimonials
├── Meet the Team / About
├── FAQ (optional)
└── Footer

Get Connected (/get-connected)
├── Step 1: About You (Name, Age, Gender)
├── Step 2: Your Interests & Location
├── Step 3: Personalized Recommendation
└── Next Steps & Contact Info

Programs (Phase 2 — /programs)
├── University Programs
├── MYF (Monday Youth Forum)
├── Retreats
├── Girls' Preaching
└── Festival Events

Gallery (Phase 2 — /gallery)
Schedule (Phase 2 — /schedule)
```

---

## 3. Home Page — Section-by-Section Breakdown

### 3.1 Hero Section

**Layout:** Full-screen background image or video with overlay text.

**Content:**
- Headline: "Discover the Timeless Wisdom of the Bhagavad Gita — Right Here in NYC"
- Subheadline: "Weekly programs, retreats, and a community that feels like family. Whether you're a curious beginner or a seasoned practitioner — there's a place for you."
- Primary CTA: **"Get Connected"** (large, prominent button → links to /get-connected)
- Secondary CTA: "Explore Our Programs" (scroll down to Programs section)

**Image Suggestions:** Group photo at a retreat, kirtan session, or a vibrant group of young people at a program.

---

### 3.2 What is Gita Life?

**Layout:** Two-column — text on one side, image/illustration on the other.

**Content:**
- "Gita Life NYC is a community of young seekers exploring the Bhagavad Gita's timeless wisdom — through weekly discussions, kirtans, retreats, and deep friendships."
- "Founded under the guidance of ISKCON, we host programs across New York City — at universities, community centers, temples, and homes."
- "No prior experience needed. No pressure. Just genuine conversations about life's biggest questions."

**Key Message:** Accessible, non-intimidating, community-driven.

---

### 3.3 Impact Stats

**Layout:** Horizontal bar with 4–5 animated counters.

| Stat | Display |
|------|---------|
| Students Reached | 500+ |
| Weekly Programs | 10+ |
| NYC Locations | 5+ |
| Retreats Hosted | 20+ |
| Years Active | X years |

**Note:** These are placeholder numbers. Replace with actuals.

---

### 3.4 Our Programs

**Layout:** Responsive card grid (2 columns on desktop, 1 on mobile).

Each card contains:
- Image (program photo)
- Program Name
- Short Description (2–3 sentences)
- Tag: Day/time if applicable
- CTA: "Learn More" (Phase 2: links to /programs/[slug])

#### Program Cards:

**1. University Programs**
- "Weekly Bhagavad Gita study groups at NYU, Columbia, Rutgers, and more. Perfect for students looking for deeper meaning beyond textbooks."
- Tags: Various days, campus locations

**2. MYF (Monday Youth Forum)**
- "Our flagship weekly gathering for young professionals. Dive into Gita philosophy, enjoy kirtan, and connect with like-minded seekers — every Monday evening."
- Tags: Mondays, 7:00 PM

**3. Retreats**
- "Step away from the city noise. Our weekend retreats combine meditation, philosophy workshops, nature walks, and soul-nourishing prasadam."
- Tags: Monthly / Seasonal

**4. Girls' Preaching**
- "A dedicated space for women to explore spirituality, share experiences, and grow together in a supportive, understanding environment."
- Tags: Weekly

**5. Festival Celebrations**
- "Experience the joy of Janmashtami, Gaura Purnima, Ratha Yatra, and other vibrant Vedic festivals with hundreds of enthusiastic participants."
- Tags: Throughout the year

**6. Home Programs / Bhakti Houses**
- "Intimate gatherings in devotee homes across NYC. Home-cooked prasadam, small group discussions, and lasting friendships."
- Tags: Various locations

---

### 3.5 Testimonials

**Layout:** Carousel or stacked cards with quotes.

**Structure per testimonial:**
- Quote (2–3 sentences)
- Name (first name or first name + last initial)
- Program they attended
- Small profile photo (optional)

**Sample Placeholders:**

> "I walked into a Monday Youth Forum not knowing what to expect. A year later, the Gita has completely transformed how I see challenges in my life."
> — Priya S., MYF

> "The retreats are where the magic happens. I made lifelong friends and found answers to questions I didn't even know I had."
> — Alex R., Retreats

> "As a woman, I always felt a bit out of place in spiritual settings. The girls' program changed that completely — it's like a family."
> — Meera K., Girls' Preaching

> "Coming from a non-Indian background, I was nervous. But Gita Life welcomed me with open arms. The philosophy is universal."
> — Jordan T., University Program

---

### 3.6 Meet the Team / About

**Layout:** Brief intro paragraph + grid of mentor/leader photos with names and roles.

**Content:**
- "Gita Life NYC is guided by dedicated mentors and volunteers who have committed their lives to sharing the Bhagavad Gita's wisdom."
- "Under the spiritual guidance of ISKCON and the teachings of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, our team brings ancient wisdom to modern life."

**Team Cards:**
- Photo
- Name
- Role (e.g., "Program Director," "University Outreach Lead," "Girls' Preaching Coordinator")
- Short one-liner

---

### 3.7 Footer

**Columns:**

| Column 1: Quick Links | Column 2: Programs | Column 3: Connect |
|------------------------|--------------------|--------------------|
| Home | University Programs | Instagram |
| About | MYF | YouTube |
| Get Connected | Retreats | WhatsApp Group |
| Gallery (Phase 2) | Girls' Preaching | Email |
| Schedule (Phase 2) | Festivals | Phone |

**Bottom Bar:**
- "Gita Life NYC — A community initiative under ISKCON"
- Copyright notice
- Optional: Address of main center

---

## 4. Get Connected Page — Detailed Flow

### Purpose
Replace the generic "Contact Us" form with an intelligent, friendly questionnaire that:
1. Learns about the visitor
2. Recommends the best-fit program
3. Gives them a clear next step (WhatsApp link, event RSVP, etc.)

### Form Design: Multi-Step (One Question Per Screen)

The form should feel **conversational**, not like a survey. Think of it as a friendly guide, not a data collection form.

---

#### Step 1: Welcome

**Screen Content:**
- Heading: "Let's Find the Right Program for You"
- Subtext: "Answer a few quick questions and we'll suggest the best way to get started. Takes less than a minute."
- Button: "Let's Go"

---

#### Step 2: Name

- "What's your name?"
- Input: Text field
- Keep it warm: "Nice to meet you, [Name]!" (shown on next screen)

---

#### Step 3: Age Range

- "How old are you, [Name]?"
- Options (radio buttons / selectable cards):
  - 16–18 (High school)
  - 18–22 (College)
  - 23–30 (Young professional)
  - 30+ (Professional / other)

---

#### Step 4: Gender

- "Just so we can share the most relevant programs:"
- Options:
  - Male
  - Female
  - Prefer not to say

---

#### Step 5: Location

- "Where in NYC are you based?"
- Options:
  - Manhattan
  - Brooklyn
  - Queens
  - Bronx
  - Staten Island
  - New Jersey (nearby)
  - Other

---

#### Step 6: Interest

- "What draws you to Gita Life?" (Can select multiple)
- Options:
  - Philosophy & Wisdom (Bhagavad Gita study)
  - Meditation & Inner Peace
  - Community & Friendships
  - Music & Kirtan
  - Vegetarian/Vegan Cooking (Prasadam)
  - Retreats & Getaways
  - Just Curious!

---

#### Step 7: Experience Level

- "Have you attended any spiritual or yoga programs before?"
- Options:
  - Completely new to this
  - I've explored a bit (yoga, meditation apps, etc.)
  - I'm familiar with ISKCON / Vedic philosophy
  - I'm a practicing devotee

---

#### Step 8: Personalized Recommendation (Result Screen)

Based on the answers, display a recommendation using simple logic:

**Recommendation Logic:**

| Condition | Recommended Program |
|-----------|-------------------|
| Age 18–22 | University Programs (suggest nearest campus) |
| Age 23–30, Male | MYF (Monday Youth Forum) |
| Age 23–30, Female | Girls' Preaching + MYF |
| Female (any age) | Also mention Girls' Preaching |
| Interest: Retreats | Highlight upcoming retreat |
| Interest: Music/Kirtan | Mention kirtan events |
| Completely new | Suggest most beginner-friendly option |
| Practicing devotee | Suggest advanced study groups / seva opportunities |

**Result Card Content:**
- "Hey [Name], here's what we think is perfect for you:"
- Program Name
- When: Day & Time
- Where: Location + Google Maps link
- What to Expect: 1–2 sentences
- CTA: "Join Our WhatsApp Group" / "RSVP for Next Session"
- Secondary: "Want to explore other programs?" (link back to programs section)

**Also include:**
- "Have questions? Reach out to [Contact Name] at [phone/WhatsApp]"
- Direct WhatsApp message link with pre-filled text: "Hi! I'm [Name], I just filled out the Gita Life form and I'm interested in [Program]."

---

## 5. Design Guidelines

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Saffron Orange | #E8751A | CTAs, highlights, headers |
| Secondary | Deep Teal | #1A5C5E | Section backgrounds, accents |
| Accent | Gold | #D4A843 | Icons, decorative elements |
| Background | Warm Off-White | #FFF9F0 | Page backgrounds |
| Surface | Soft Cream | #FFF3E0 | Card backgrounds |
| Text Primary | Dark Charcoal | #2D2D2D | Body text |
| Text Secondary | Warm Gray | #6B6B6B | Captions, secondary text |

### Typography

| Element | Font Suggestion | Weight | Size |
|---------|----------------|--------|------|
| Headings | Playfair Display or Lora | Bold | 32–48px |
| Subheadings | Inter or Poppins | Semi-bold | 20–24px |
| Body | Inter or Poppins | Regular | 16px |
| CTA Buttons | Inter or Poppins | Bold | 16–18px |

Serif for headings (spiritual, classic feel) + Sans-serif for body (modern, readable).

### Imagery Style

- Warm, natural lighting
- Candid group photos (not stock-photo-stiff)
- Diverse group of young people
- Action shots: kirtan, cooking, hiking at retreats, group discussions
- Avoid: overly religious imagery that might intimidate newcomers

### Responsive Breakpoints

| Device | Width |
|--------|-------|
| Mobile | < 640px |
| Tablet | 640px – 1024px |
| Desktop | > 1024px |

**Mobile-first:** Design for phone screens first. Most traffic will come from Instagram/WhatsApp links shared on mobile.

---

## 6. Technical Recommendations

### Recommended Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SEO, performance, React ecosystem |
| Styling | Tailwind CSS | Rapid development, responsive utilities |
| Animations | Framer Motion | Smooth scroll animations, counters |
| Forms | React Hook Form | Lightweight, multi-step form support |
| Hosting | Vercel | Zero-config Next.js hosting, free tier |
| Analytics | Google Analytics or Plausible | Track visitor behavior |
| CMS (Phase 2) | Sanity or Notion API | Let non-developers update content |

### Performance Targets

- Lighthouse score: 90+ on all metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Mobile page weight: < 1MB (excluding images)

---

## 7. Phase Plan

### Phase 1 (MVP — Build Now)
- [x] Home page with all sections (hero, stats, programs, testimonials, footer)
- [x] Get Connected multi-step form with recommendation logic
- [x] Fully responsive (mobile-first)
- [x] Deployed and live

### Phase 2 (After Launch)
- [ ] Individual program detail pages (/programs/[slug])
- [ ] Photo/video gallery
- [ ] Weekly schedule / calendar view
- [ ] Blog / articles section
- [ ] CMS integration for easy content updates

### Phase 3 (Growth)
- [ ] Event RSVP system
- [ ] Email newsletter signup
- [ ] Member portal / login
- [ ] Volunteer signup system
- [ ] Multi-language support (Hindi, Bengali, etc.)

---

## 8. Content Checklist (What You Need to Provide)

Before building, gather the following:

### Must Have (Phase 1)
- [ ] High-quality hero image(s) — group photo, kirtan, retreat
- [ ] Actual stats (students reached, programs count, locations, etc.)
- [ ] Program details: names, days, times, locations for each program
- [ ] 4–6 real testimonials with first names
- [ ] Team photos and names (at least 3–5 key people)
- [ ] Social media links (Instagram, YouTube, WhatsApp)
- [ ] Contact email and/or phone number
- [ ] Logo (if one exists; otherwise we can create a simple text logo)

### Nice to Have
- [ ] Short video clip for hero section (30–60 seconds)
- [ ] Multiple photos per program for cards
- [ ] FAQ content (common questions newcomers ask)

---

## 9. Success Metrics

How to measure if the website is working:

| Metric | Target | Tool |
|--------|--------|------|
| Monthly visitors | 500+ within 3 months | Google Analytics |
| "Get Connected" completions | 50+ per month | Form submission tracking |
| Bounce rate | < 50% | Google Analytics |
| Average time on page | > 2 minutes | Google Analytics |
| Mobile traffic share | Track % | Google Analytics |
| WhatsApp group joins | Track via UTM links | WhatsApp Business |

---

*This document serves as the complete specification for the Gita Life NYC website. Review, add your content, and we'll start building.*
