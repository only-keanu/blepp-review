# Facebook Product Deployment and Revenue Plan

Date: 2026-06-03

This plan assumes "deploy in Facebook" means launching BLEPP Review as a paid product through a Facebook Page, Meta Business Suite, Messenger/WhatsApp sales, organic content, and paid Meta ads that send users to the deployed web app. If the goal later becomes a native Facebook app integration, treat that as a separate technical project.

## 1. Current State

### Product
- BLEPP Review has a working React frontend and Spring Boot backend.
- Core learning flows exist: topics, lessons, practice, flashcards, question bank, mock exams, analytics, and AI question generation.
- Auth, refresh tokens, admin access management, trial/paid/expired access states, and backend access checks are mostly in place.
- The backend is moving toward production readiness with health checks, production profile smoke tests, CORS configuration, Flyway migrations, and deployment docs.

### Revenue Readiness
- Backend access rules support manual paid access.
- Admin can grant/revoke access manually.
- Pricing page still says "Free Beta" and "Billing Is Not Live Yet", so the public funnel is not ready to collect money.
- There is no automated payment provider integration yet.
- Manual payment is the practical first launch model.

### Marketing Readiness
- The app can be marketed as a BLEPP study system, but the offer, proof, pricing, onboarding, and customer support process still need to be defined.
- No Meta Pixel, Conversions API, campaign structure, landing page conversion events, or customer tracking process is currently documented in the app.

## 2. Launch Goal

Launch a paid MVP on Facebook that can reliably:

1. Attract BLEPP review candidates.
2. Explain the product in under 10 seconds.
3. Convert interested users into trial or paid users.
4. Accept manual payments.
5. Grant paid access quickly.
6. Support users through Messenger or WhatsApp.
7. Measure cost per lead, cost per paid user, revenue, retention, and support load.

## 3. Product Offer

### Initial Positioning

Use a simple promise:

> BLEPP Review helps psychology board exam takers practice questions, review mistakes, use flashcards, track readiness, and prepare with mock exams in one focused study dashboard.

Avoid claims like guaranteed passing, official board affiliation, or unrealistic score improvements.

### Target Customer

Primary:
- Psychology graduates preparing for the BLEPP.
- Reviewees who want self-paced practice outside review center sessions.
- Repeat takers who need structured mistake review.

Secondary:
- Review groups, student orgs, and psychology program communities.
- Review coaches who may recommend the tool.

### Launch Pricing

Start with manual access instead of subscriptions:

- Free preview: account creation + limited trial access.
- Intro paid pass: 30 days of full study access.
- Optional launch bundle: 90 days of access at a discounted rate.
- AI generation: paid/admin only, but keep it disabled publicly unless `APP_OPENAI_API_KEY` is configured and tested.

Recommended first test:

| Plan | Purpose | Access | Suggested Action |
| --- | --- | --- | --- |
| Free Trial | Lead capture and product proof | 1 day or limited access | Keep backend trial behavior. |
| 30-Day Pass | Main launch offer | Study tools + analytics | Manual payment and admin grant. |
| 90-Day Pass | Higher cash collection | Study tools + analytics | Offer during first 2 launch weeks. |
| AI Add-on | Later upsell | PDF question generation | Do not sell until stable. |

Do not run paid ads to a "Free Beta" pricing page if the goal is revenue. Update pricing and onboarding first.

## 4. Technical Deployment Steps

### Step 1: Stabilize the Current Readiness Work

- Commit the current CI/docs/test hardening changes.
- Run:

```powershell
cd blepp-review-backend/demo
.\gradlew.bat test

cd ../..
npm run lint
npm run build
```

- Treat lint warnings as cleanup unless the team decides CI should be warning-free.
- Keep `docs/deployment-checklist.md` and `docs/auth-access-regression-smoke.md` updated.

### Step 2: Fix Revenue-Facing Product Copy

Update:
- `src/pages/PricingPage.tsx`
- landing page CTA copy
- payment/access page copy
- terms/privacy wording around payments, refunds, and AI processing

Required decisions:
- Price.
- Payment methods.
- Refund window.
- Support channel.
- Access duration.
- Whether AI is enabled or unavailable.

Acceptance criteria:
- A Facebook visitor can understand the offer, price, payment method, and access timeline without messaging first.
- If payment is manual, the user knows exactly what proof to send and when access will be granted.

### Step 3: Deploy Backend Production

Backend environment must include:

```text
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_BASELINE_ON_MIGRATE=true
SPRING_FLYWAY_BASELINE_VERSION=9
APP_JWT_SECRET
APP_ADMIN_EMAILS
APP_CORS_ALLOWED_ORIGINS
```

AI generation decision:

```text
APP_OPENAI_API_KEY       # blank if disabled
APP_OPENAI_MODEL
APP_GENERATION_UPLOAD_DIR
APP_GENERATION_MAX_PDF_BYTES
APP_GENERATION_CONNECT_TIMEOUT_SECONDS
APP_GENERATION_READ_TIMEOUT_SECONDS
```

Smoke test:
- `/actuator/health` returns healthy.
- Admin login works.
- `/api/me` returns admin and access flags correctly.
- Admin can grant/revoke paid access.
- Expired users receive `403` for study workflows.
- Paid users can use practice and flashcards.

### Step 4: Deploy Frontend Production

Frontend environment:

```text
VITE_API_BASE_URL=https://your-backend-url
VITE_GOOGLE_CLIENT_ID=
VITE_FACEBOOK_APP_ID=
```

Smoke test:
- Register.
- Login.
- Reload dashboard and confirm auth persists.
- Practice flow.
- Flashcard flow.
- Admin access update.
- Payment/access page.
- AI route behavior if disabled.

### Step 5: Add Basic Measurement

Before spending on ads:

- Install Meta Pixel on the frontend.
- Define conversion events:
  - `ViewContent`: landing/pricing page view.
  - `Lead`: registration completed.
  - `InitiateCheckout`: user opens payment instructions.
  - `Purchase`: admin confirms paid access or backend records paid access.
- Add server-side Conversions API later for more reliable attribution.

Meta notes:
- Meta Pixel setup requires creating pixel/base code and setting events on the website.
- Meta recommends using Conversions API with the Pixel for stronger measurement and optimization.
- Business Tools data must follow Meta Business Tools terms and privacy/data restrictions.

### Step 6: Create a Staging-to-Production Release Routine

Every release:

1. Merge to main only after CI passes.
2. Deploy backend first.
3. Verify `/actuator/health`.
4. Deploy frontend with correct backend URL.
5. Run smoke checklist.
6. Post release note internally:
   - What changed.
   - Known risks.
   - Rollback path.
   - Support notes.

## 5. Facebook and Meta Setup

### Step 1: Create the Facebook Page

Create a Facebook Page for the brand.

Page basics:
- Name: `BLEPP Review` or the final product name.
- Category: education/productivity/online learning, whichever best fits Meta's available categories.
- Bio: short value proposition.
- Website: production frontend URL.
- Action button: Send Message, Sign Up, or Learn More.
- Cover image: product screenshot + clear benefit.
- Profile image: readable logo.

Meta says Pages are for businesses, brands, organizations, and public figures to share updates and connect with people.

### Step 2: Create Business Assets

Set up:
- Meta Business Suite.
- Ad account.
- Payment method for ads.
- Facebook Page access roles.
- Instagram account if available.
- WhatsApp Business or Messenger as the support/sales inbox.
- Meta Pixel/dataset.

Keep ownership clean:
- Use a business-controlled account.
- Add at least one backup admin.
- Do not rely on one personal account.

### Step 3: Prepare Page Content Before Ads

Publish at least 10 pieces before spending:

1. Product intro post.
2. "How BLEPP Review works" carousel.
3. Practice question sample.
4. Mistake review demo.
5. Flashcard demo.
6. Mock exam demo.
7. Readiness analytics screenshot.
8. Payment/access instructions.
9. FAQ post.
10. Founder/product story or credibility post.

Pin:
- Main offer.
- Pricing/payment instructions.
- Support channel.

### Step 4: Messenger Sales Setup

Create saved replies:

- "What is BLEPP Review?"
- "How much is it?"
- "How do I pay?"
- "How fast is access granted?"
- "Can I try it first?"
- "Does this guarantee passing?"
- "Is AI generation available?"
- "How do refunds work?"

Messenger sales rule:
- Reply within 15 minutes during active selling windows.
- Use a spreadsheet/CRM to track every lead.
- Do not promise access until payment proof is verified.

## 6. Marketing Plan

### Core Message

Use outcome-oriented but compliant claims:

- "Practice BLEPP-style questions in focused sessions."
- "Review mistakes and weak topics."
- "Track readiness before exam day."
- "Use flashcards for spaced review."
- "Try a structured self-study dashboard."

Avoid:
- "Guaranteed pass."
- "Board-approved."
- "Official BLEPP questions."
- "Are you failing BLEPP?"
- Copy that directly names personal attributes in a way Meta may flag.

### Organic Content Calendar

Post 5 times per week for the first 8 weeks.

| Day | Content Type | Goal |
| --- | --- | --- |
| Monday | Practice question | Engagement |
| Tuesday | Study tip carousel | Saves/shares |
| Wednesday | Product demo clip | Product education |
| Thursday | Mistake review example | Trust |
| Friday | Offer/payment CTA | Sales |
| Saturday | Live Q&A or story poll | Community |
| Sunday | Weekly recap/testimonial | Proof |

### Content Themes

- Daily BLEPP practice question.
- "Why this answer is correct" explanation.
- Common review mistakes.
- Flashcard prompts.
- Mock exam preparation.
- Study schedule examples.
- Psychology topic mini-lessons.
- Product walkthroughs.
- Customer wins/testimonials once available.
- Payment deadline/promotional reminders.

### Community Strategy

Use Facebook Groups carefully:
- Join relevant psychology/BLEPP communities only where self-promotion is allowed.
- Provide free value first: explanations, study schedules, sample questions.
- Ask admins before posting promotional links.
- Create your own BLEPP Review community group for customers and leads.

Weekly community rhythm:
- Monday topic thread.
- Wednesday practice question thread.
- Friday product/support thread.
- Sunday accountability check-in.

## 7. Paid Ads Plan

Do not start paid ads until:
- Production app is deployed.
- Pricing page is revenue-ready.
- Payment instructions work.
- Admin access updates are tested.
- Pixel events are firing.
- Support inbox is staffed.

### Campaign 1: Validation Leads

Objective:
- Leads or traffic to pricing/signup page.

Budget:
- Start small for 7 days.
- Test 3-5 creatives.
- Kill ads with high cost and low registration quality.

Creative angles:
- "Practice BLEPP questions daily."
- "Track weak topics before exam day."
- "Mock exams + flashcards in one dashboard."
- "Self-paced BLEPP review tool."

Success metrics:
- Cost per landing page view.
- Cost per registration.
- Registration-to-payment conversion.
- Messenger inquiry quality.

### Campaign 2: Retargeting

Audience:
- Website visitors.
- Pricing page visitors.
- Registered but unpaid users.
- Facebook/Instagram engagers.

Message:
- Show product proof, FAQ, and offer deadline.

Success metrics:
- Cost per paid user.
- Revenue per ad spend.

### Campaign 3: Launch Offer

Audience:
- Warm leads from Page, Messenger, website, and trial users.

Offer:
- Intro 30-day or 90-day pass.
- Limited launch pricing.
- Clear payment proof process.

Success metrics:
- Paid users.
- Gross revenue.
- CAC.
- Payback period.

### Ad Compliance Checklist

Before publishing:
- No guaranteed results.
- No misleading official affiliation.
- No insulting or fear-based personal attribute copy.
- Landing page matches ad offer.
- Pricing and payment terms are visible.
- Privacy Policy and Terms are linked.
- Claims can be supported by actual product behavior.

Meta notes:
- Ads go through review, and ads that send people to buy products may be subject to relevant commerce/ad policies.
- Detailed targeting can narrow audiences but may reduce scale.
- Use Meta Ad Library to inspect competitor or adjacent education ads for creative patterns.

## 8. Sales Operations

### Manual Payment Flow

1. User registers.
2. User opens payment/access page.
3. User pays through selected method.
4. User sends proof in Messenger/WhatsApp/email.
5. Admin verifies payment.
6. Admin grants paid access in `/dashboard/admin/users`.
7. Admin replies with confirmation and onboarding link.
8. User completes first session.

### Lead Tracking Sheet

Columns:
- Lead ID.
- Name.
- Facebook profile URL.
- Email.
- Payment status.
- Payment reference.
- Plan.
- Paid until.
- Access granted by.
- Access granted at.
- First login after payment.
- Notes.
- Refund status.

### Sales Scripts

Short reply:

```text
BLEPP Review is a self-paced study dashboard with practice questions, flashcards, mock exams, mistake review, and readiness tracking. You can create an account here: [link]. The launch pass is [price] for [duration]. After payment, send proof here and we will activate your account.
```

Payment confirmation:

```text
Payment received. Your BLEPP Review access is now active until [date]. Start here: [dashboard link]. Recommended first step: take one practice session, then review mistakes and flashcards.
```

No guarantee answer:

```text
BLEPP Review is a study support tool. It does not guarantee exam results, but it helps you practice consistently, review mistakes, and monitor readiness.
```

AI disabled answer:

```text
AI question generation is not included in the current paid launch unless announced. The core paid access includes practice, flashcards, mock exams, mistake review, lessons, and analytics.
```

## 9. Customer Support

### Support Channels

Start with:
- Facebook Messenger.
- Email.
- Optional WhatsApp Business.

SLA:
- Payment/access issues: same day, ideally under 2 hours.
- Bug reports: acknowledge within 24 hours.
- Content corrections: acknowledge within 24 hours, fix based on severity.

### Support Categories

- Login/access.
- Payment verification.
- Trial expired.
- Practice/flashcard issue.
- Question/content correction.
- AI generation issue.
- Refund request.

### Refund Policy

Define before launch:
- Refund window.
- What counts as non-refundable.
- Duplicate payment handling.
- Failed access activation handling.
- Abuse/fraud handling.

Do not advertise until the refund terms are visible.

## 10. Maintenance Plan

### Daily

- Check backend health.
- Check support inbox.
- Verify payment/access requests.
- Review ad spend and obvious campaign issues.
- Review error reports from users.

### Weekly

- Run production smoke checklist.
- Export/backup customer access list.
- Review top support issues.
- Review funnel metrics.
- Update FAQ and saved replies.
- Add or correct study content.
- Check ad comments and hide/report spam.

### Monthly

- Review revenue, CAC, retention, and churn.
- Review database backups and restore process.
- Update dependencies if security-related.
- Review pricing.
- Review ad creative fatigue.
- Decide whether to keep, raise, or sunset launch pricing.

### Technical Monitoring To Add

- Error tracking for frontend.
- Backend request/error logs.
- Database backups with restore test.
- Admin audit log for access grants.
- Basic dashboard for active users, paid users, expired users, and generation failures.

## 11. Metrics

### Product Metrics

- New registrations.
- Activated users: completed first practice session.
- Trial-to-paid conversion.
- Paid users.
- Daily active users.
- Practice sessions per user.
- Flashcards reviewed per user.
- Mock exams completed.
- Expired users.
- Refunds.

### Marketing Metrics

- Reach.
- Engagement rate.
- Cost per landing page view.
- Cost per registration.
- Cost per Messenger inquiry.
- Cost per paid user.
- Return on ad spend.
- Organic post saves/shares.

### Sales Metrics

- Messenger inquiry to payment conversion.
- Average response time.
- Payment verification time.
- Revenue per plan.
- Refund rate.
- Support tickets per paid user.

## 12. 30-Day Execution Plan

### Week 1: Product and Revenue Readiness

- Commit current readiness changes.
- Update pricing page from Free Beta to launch offer.
- Finalize manual payment process.
- Finalize refund/support policy.
- Confirm AI generation is enabled or explicitly unavailable.
- Deploy staging.
- Run smoke tests.
- Create Meta Page and Business assets.
- Prepare Pixel event plan.

Exit criteria:
- A user can register, pay manually, receive admin-granted access, and complete a study session.

### Week 2: Content and Organic Launch

- Publish the Facebook Page.
- Add 10 starter posts.
- Pin offer and FAQ.
- Set up saved replies.
- Invite initial audience.
- Post daily practice/question content.
- Recruit 10-20 beta/early paid users manually.

Exit criteria:
- First real users complete sessions.
- Support issues are logged.
- Product copy is adjusted based on real questions.

### Week 3: Paid Ad Test

- Install and verify Meta Pixel.
- Launch small validation campaign.
- Test 3-5 creatives.
- Retarget Page engagers and site visitors.
- Track every lead in CRM.
- Review ad comments daily.

Exit criteria:
- Know cost per registration and early cost per paid user.
- Identify top-performing message and creative.

### Week 4: Sales Push

- Launch limited-time intro pass.
- Retarget warm audiences.
- Post testimonials or anonymized product usage proof.
- Improve onboarding email/message.
- Fix top 3 support/product issues.
- Decide whether to scale ad budget.

Exit criteria:
- Revenue is coming in.
- Access grants are reliable.
- CAC is known enough to decide whether to scale or iterate.

## 13. 60-90 Day Plan

### Days 31-60

- Add frontend auth/access automated tests.
- Add admin audit logs.
- Add payment provider integration or semi-automated payment proof upload.
- Improve onboarding sequence.
- Build email list and weekly study digest.
- Add referral incentive.
- Expand content calendar.
- Start lookalike/retargeting once enough events exist.

### Days 61-90

- Decide subscription vs fixed-duration passes.
- Add automated billing if revenue justifies it.
- Add content quality review workflow.
- Add customer testimonials/case studies.
- Add reporting dashboard for revenue and product usage.
- Decide whether AI generation becomes a paid differentiator.

## 14. Launch Blockers

Do not spend meaningful ad budget until these are resolved:

- Pricing page still says Free Beta.
- Payment instructions are unclear.
- Admin access grant flow has not been tested in production.
- Facebook Page has no content or proof.
- No support owner is assigned.
- No tracking for registration/payment conversion.
- AI generation is marketed but not configured/tested.
- Terms/refund policy are missing or vague.

## 15. Recommended Immediate Next Actions

1. Commit the current readiness changes.
2. Update pricing and payment copy.
3. Create the Facebook Page and Business Suite assets.
4. Deploy staging and run the smoke checklist.
5. Decide first paid offer and exact price.
6. Create 10 starter Facebook posts.
7. Launch to a small organic audience before paid ads.
8. Install Pixel and define conversion events.
9. Run a 7-day small-budget ad validation.
10. Scale only after trial-to-paid conversion is measurable.

## 16. Official Meta References

- Create a Facebook Page: https://www.facebook.com/help/104002523024878
- Manage a Facebook Page and Page Insights: https://www.facebook.com/business/pages/manage
- Create Page posts with Facebook or Meta Business Suite: https://www.facebook.com/help/www/181155025579876
- Set up and install the Meta Pixel: https://www.facebook.com/help/messenger-app/952192354843755
- About Conversions API: https://www.facebook.com/business/help/AboutConversionsAPI
- Meta Business Tools: https://www.facebook.com/help/331509497253087/
- Meta ad targeting: https://www.facebook.com/business/ads/ad-targeting
- Meta ads review policy guidelines: https://www.facebook.com/business/ads/review-policy-guidelines
- Meta Ad Library: https://www.facebook.com/help/259468828226154/
