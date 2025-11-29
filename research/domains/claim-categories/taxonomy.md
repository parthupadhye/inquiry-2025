# FTC Claim Categories Taxonomy

This document provides a comprehensive taxonomy of advertising claim categories as recognized by the Federal Trade Commission (FTC), designed for use in automated claim classification and verification systems.

---

## Overview

The FTC categorizes advertising claims based on their nature, the evidence required to substantiate them, and the potential for consumer harm. This taxonomy organizes claims into a hierarchical structure suitable for programmatic classification.

---

## Primary Claim Categories

### 1. Product Performance Claims

Claims about how a product works or what it does.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `efficacy` | Product effectiveness claims | High | Competent and reliable evidence |
| `quality` | Product quality/durability claims | Medium | Testing/consumer data |
| `comparison` | Superiority over competitors | High | Head-to-head testing |
| `establishment` | "Clinically proven", "Tests show" | Very High | Must have specific proof claimed |

**High-Risk Keywords:**
- "guaranteed", "proven", "works", "effective", "best", "#1", "outperforms"
- "clinically proven", "scientifically tested", "doctor recommended"
- "100%", "always", "never fails"

---

### 2. Health & Safety Claims

Claims related to health benefits, medical conditions, or safety.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `structure_function` | Affects body structure/function | High | Scientific evidence |
| `disease_treatment` | Treats/cures/mitigates disease | Very High | RCTs required |
| `disease_prevention` | Prevents disease | Very High | RCTs required |
| `symptom_relief` | Relieves symptoms | High | Clinical evidence |
| `safety` | Product safety claims | High | Testing data |
| `nutrient_content` | Nutritional claims | Medium | Lab analysis |

**High-Risk Keywords:**
- "cure", "heal", "treat", "prevent", "remedy", "therapy"
- "reduces risk of", "fights", "combats", "eliminates"
- "doctor approved", "FDA approved" (when false)
- "no side effects", "completely safe", "natural" (implying safety)

**Substantiation Requirements (per FTC Health Products Compliance Guide 2022):**
- Two randomized controlled human clinical trials (RCTs) preferred
- Double-blinded methodology
- Conducted by qualified researchers
- Measures disease endpoints or validated surrogate markers

---

### 3. Environmental & Sustainability Claims

"Green" claims about environmental impact.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `general_environmental` | Broad eco claims | Very High | Avoid - nearly impossible to substantiate |
| `recyclable` | Can be recycled | Medium | Recycling infrastructure verification |
| `biodegradable` | Breaks down naturally | High | Scientific degradation studies |
| `compostable` | Compostable materials | High | Composting certification |
| `carbon_neutral` | Net zero carbon | High | Verified carbon accounting |
| `renewable_materials` | Made from renewables | Medium | Supply chain documentation |
| `renewable_energy` | Made with clean energy | Medium | Energy source verification |
| `non_toxic` | No toxic substances | High | Chemical analysis |
| `free_of` | Free of specific substances | Medium | Testing/certification |

**High-Risk Keywords:**
- "green", "eco-friendly", "environmentally friendly", "sustainable" (unqualified)
- "carbon neutral", "net zero", "climate positive"
- "100% recyclable", "biodegradable" (without qualification)
- "natural", "organic" (outside USDA context)

**Reference:** [FTC Green Guides (16 CFR Part 260)](https://www.ftc.gov/business-guidance/resources/environmental-claims-summary-green-guides)

---

### 4. Origin & Manufacturing Claims

Claims about where/how products are made.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `made_in_usa` | U.S. origin claims | High | "All or virtually all" made in USA |
| `country_of_origin` | Other origin claims | Medium | Manufacturing documentation |
| `handmade` | Hand-crafted claims | Medium | Production process verification |
| `small_batch` | Limited production claims | Low | Production records |
| `local` | Locally made claims | Medium | Geographic verification |

**High-Risk Keywords:**
- "Made in USA", "American made", "Made in America"
- "Assembled in USA" (different standard)
- "Designed in USA" (potentially misleading)
- "Handmade", "handcrafted", "artisan"

**"Made in USA" Requirements:**
- All or virtually all made in the U.S.
- All significant processing in the U.S.
- Final assembly in the U.S.
- Civil penalties up to $53,088 per violation

---

### 5. Pricing & Value Claims

Claims about price, savings, or value.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `price_comparison` | Compared to competitors | High | Current market price data |
| `sale_savings` | Discount from regular price | High | Genuine prior pricing |
| `free_offers` | Free product/service | Medium | No hidden costs |
| `value_proposition` | Worth/value claims | Medium | Objective basis |
| `bait_and_switch` | Unavailable advertised items | Very High | Prohibited |

**High-Risk Keywords:**
- "Save up to X%", "Compare at", "Retail value"
- "Free", "No cost", "Complimentary"
- "Best value", "Lowest price", "Price match"
- "Sale", "Clearance", "Limited time"

---

### 6. Endorsements & Testimonials

Claims involving third-party opinions or experiences.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `expert_endorsement` | Professional endorsement | High | Genuine expertise + disclosure |
| `celebrity_endorsement` | Celebrity promotion | High | Genuine use + disclosure |
| `consumer_testimonial` | Customer experiences | High | Typical results + disclosure |
| `influencer_content` | Social media promotion | High | Material connection disclosure |
| `certifications` | Seals/certifications | Medium | Valid certification + disclosure |
| `awards` | Award claims | Medium | Genuine award verification |
| `reviews` | Star ratings/reviews | High | Authentic reviews only |

**High-Risk Keywords:**
- "As seen on", "Featured in", "Recommended by"
- "Award-winning", "Certified", "Approved"
- "★★★★★", "5-star rated"
- "Testimonials" with atypical results

**Disclosure Requirements:**
- Material connections must be disclosed
- "Results not typical" is NOT sufficient
- Must disclose typical expected results
- Clear and conspicuous placement

**Reference:** [FTC Endorsement Guides (2023 Revision)](https://www.ftc.gov/business-guidance/resources/guides-concerning-use-endorsements-testimonials-advertising)

---

### 7. Native Advertising & Sponsored Content

Commercial content disguised as editorial.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `native_ads` | Ads matching editorial format | High | Clear "Ad" disclosure |
| `sponsored_content` | Paid editorial content | High | "Sponsored" disclosure |
| `advertorials` | Ad-editorial hybrid | High | Clear commercial nature |
| `influencer_posts` | Paid social posts | High | #ad or equivalent |
| `affiliate_content` | Commission-based content | Medium | Affiliate relationship disclosure |

**High-Risk Patterns:**
- Content that looks like news articles
- Social posts without clear sponsorship disclosure
- "Promoted" (ambiguous - not recommended)
- Product placements without disclosure

**Required Disclosures:**
- "Ad", "Advertisement", "Paid Advertisement"
- "Sponsored Advertising Content"
- Clear and prominent placement
- Same time/place as the content

---

### 8. Technology & AI Claims

Claims about technological capabilities.

| Subcategory | Description | Risk Level | Substantiation |
|-------------|-------------|------------|----------------|
| `ai_capabilities` | AI/ML functionality | High | Demonstrable capabilities |
| `automation_claims` | Automated processes | Medium | Technical verification |
| `data_security` | Security/privacy claims | High | Security assessments |
| `performance_metrics` | Speed/efficiency claims | Medium | Benchmark testing |

**High-Risk Keywords:**
- "AI-powered", "Machine learning", "Intelligent"
- "Automated", "Autonomous"
- "Secure", "Encrypted", "Private"
- "Real-time", "Instant"

**FTC Focus (Operation AI Comply 2024):**
- No "AI exemption" from advertising laws
- Must have substantiation for AI capability claims
- Deceptive AI claims subject to enforcement

---

## Claim Classification Schema

```typescript
interface ClaimClassification {
  // Primary category
  category: ClaimCategory;

  // Specific subcategory
  subcategory: string;

  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';

  // Required substantiation type
  substantiationType: SubstantiationType;

  // Detected keywords/patterns
  detectedPatterns: string[];

  // Requires disclosure?
  requiresDisclosure: boolean;

  // Confidence score (0-1)
  confidence: number;
}

type ClaimCategory =
  | 'product_performance'
  | 'health_safety'
  | 'environmental'
  | 'origin_manufacturing'
  | 'pricing_value'
  | 'endorsement_testimonial'
  | 'native_advertising'
  | 'technology_ai';

type SubstantiationType =
  | 'competent_reliable_evidence'
  | 'scientific_evidence'
  | 'clinical_trials_rct'
  | 'testing_data'
  | 'documentation'
  | 'verification'
  | 'disclosure_only';
```

---

## Risk Assessment Matrix

| Category | Base Risk | Factors Increasing Risk |
|----------|-----------|------------------------|
| Health Claims | High | Disease claims, vulnerable populations |
| Environmental | Medium-High | Unqualified claims, greenwashing |
| Made in USA | High | Unqualified claims, foreign components |
| Testimonials | Medium | Atypical results, undisclosed connections |
| Pricing | Medium | Fictitious comparisons, bait-and-switch |
| Performance | Medium | Superlatives, establishment claims |
| AI/Tech | High | Capability overstatement, automation claims |

---

## Pattern Detection Keywords

### Absolute/Superlative Indicators (High Risk)
```
always, never, 100%, guaranteed, proven, best, #1, only,
first, unique, exclusive, revolutionary, breakthrough
```

### Comparison Indicators (Require Substantiation)
```
better than, superior, outperforms, more effective,
compared to, versus, beats, leads
```

### Health Claim Indicators (Very High Risk)
```
cure, heal, treat, prevent, remedy, therapy, relief,
fights, combats, eliminates, reduces risk, protects
```

### Environmental Indicators (High Risk if Unqualified)
```
green, eco, sustainable, environmentally friendly,
carbon neutral, biodegradable, recyclable, natural
```

### Endorsement Indicators (Require Disclosure Check)
```
recommended by, approved by, endorsed by, as seen on,
certified, award-winning, doctor, expert, professional
```

---

## References

- [FTC Policy Statement Regarding Advertising Substantiation](https://www.ftc.gov/legal-library/browse/ftc-policy-statement-regarding-advertising-substantiation)
- [FTC Health Claims Guidance](https://www.ftc.gov/business-guidance/advertising-marketing/health-claims)
- [FTC Green Guides](https://www.ftc.gov/business-guidance/resources/environmental-claims-summary-green-guides)
- [FTC Made in USA Standard](https://www.ftc.gov/business-guidance/resources/complying-made-usa-standard)
- [FTC Endorsement Guides](https://www.ftc.gov/business-guidance/resources/guides-concerning-use-endorsements-testimonials-advertising)
- [FTC Native Advertising Guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)
