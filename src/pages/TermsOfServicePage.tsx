import React from 'react';
import { PublicLayout } from '../components/layout/PublicLayout';

export function TermsOfServicePage() {
  return (
    <PublicLayout>
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-slate-500 mb-12">Last updated: June 3, 2026</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              These Terms and Conditions govern your use of BLEPP Review. By
              creating an account, signing in with Google or Facebook, or using
              the platform, you agree to these terms and acknowledge our Privacy
              Policy.
            </p>

            <Section title="1. The Service">
              <p>
                BLEPP Review is a SaaS study platform for people preparing for
                the Philippine Psychology Licensure Examination. The platform
                includes practice questions, flashcards, mock exams, mistake
                review, question-bank tools, lessons, progress analytics, and
                readiness tracking.
              </p>
              <p>
                AI question generation is coming soon and is not included in the
                current launch pass unless we separately announce that it is
                available.
              </p>
            </Section>

            <Section title="2. Accounts and Eligibility">
              <p>To use BLEPP Review, you must:</p>
              <ul>
                <li>Be at least 16 years old</li>
                <li>Provide accurate account and profile information</li>
                <li>Keep your password and login credentials confidential</li>
                <li>Use only your own account and not share access with others</li>
                <li>Notify us if you suspect unauthorized account access</li>
              </ul>
              <p>
                You are responsible for activity under your account. We may
                suspend or terminate accounts that violate these terms, threaten
                the service, or misuse paid access.
              </p>
            </Section>

            <Section title="3. Trial and Paid Access">
              <p>
                New accounts may receive trial access to available study tools.
                Trial access ends at the time shown in your account. After your
                trial expires, you need paid access to continue using locked
                study tools.
              </p>
              <p>
                The current launch offer is the 30-Day BLEPP Review Pass for
                PHP 299. Paid access includes available practice, flashcards,
                mock exams, mistake review, question bank, lessons, and
                readiness/progress analytics for 30 days.
              </p>
            </Section>

            <Section title="4. Manual Payment and Activation">
              <p>
                Payment is currently handled manually through GCash. After
                payment, you must send proof through the BLEPP Review Facebook
                page or official support channel so an admin can verify and
                activate your account.
              </p>
              <p>
                Payment proof should include your BLEPP Review account email,
                GCash reference number, sender name or screenshot, and payment
                date/time. Access is activated within 24 hours after proof is
                verified.
              </p>
              <p>
                Access is not guaranteed until payment proof is verified and the
                correct account is identified. We are not responsible for delays
                caused by missing, incorrect, or unverifiable payment details.
              </p>
            </Section>

            <Section title="5. Refunds">
              <p>
                Refund requests may be made within 7 days of payment. Refunds
                are reviewed manually and may be refused or limited in cases of
                abuse, fraud, duplicate claims, charge disputes, account sharing,
                or substantial use inconsistent with a refund request.
              </p>
              <p>
                If you paid twice by mistake, contact us through the official
                support or Facebook page channel with both payment references so
                we can review the duplicate payment.
              </p>
            </Section>

            <Section title="6. Acceptable Use">
              <p>You agree not to:</p>
              <ul>
                <li>Share, resell, rent, or transfer your account access</li>
                <li>Copy, scrape, redistribute, or sell BLEPP Review content</li>
                <li>Upload materials you do not have the right to use</li>
                <li>Use the platform for illegal, harmful, or deceptive activity</li>
                <li>Attempt to bypass access controls or security features</li>
                <li>Use bots, automated scraping, or excessive automated requests</li>
                <li>Interfere with other users or the normal operation of the platform</li>
              </ul>
            </Section>

            <Section title="7. Content and Intellectual Property">
              <p>
                BLEPP Review, including its software, interface, lessons,
                questions, explanations, analytics, and study content, is owned
                by us or our licensors and is protected by intellectual property
                laws.
              </p>
              <p>
                You may use BLEPP Review content for your own personal,
                non-commercial study. You may not reproduce, publish, sell, or
                distribute platform content without permission.
              </p>
              <p>
                If upload or AI-assisted features become available, you retain
                ownership of materials you submit, but you grant us a limited
                license to process them for the requested study workflow.
              </p>
            </Section>

            <Section title="8. No Exam Guarantee">
              <p>
                BLEPP Review is a study aid. We do not guarantee that using the
                platform will improve your score, make you eligible for the
                board exam, or cause you to pass the board exam.
              </p>
              <p>
                Readiness scores, progress analytics, practice results, mock
                exam scores, study plans, and explanations are educational tools
                only. You remain responsible for your review strategy, exam
                preparation, and compliance with PRC requirements.
              </p>
              <p>
                BLEPP Review is not affiliated with or endorsed by the
                Professional Regulation Commission.
              </p>
            </Section>

            <Section title="9. Service Availability and Changes">
              <p>
                We aim to keep the platform available, but we do not guarantee
                uninterrupted, error-free, or always-secure service. Features may
                be changed, limited, paused, or removed as the product evolves.
              </p>
              <p>
                We may update pricing, access rules, trial rules, feature
                availability, or these terms. Material updates will be posted in
                the app or on the relevant public page.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                To the maximum extent allowed by law, BLEPP Review and its team
                will not be liable for indirect, incidental, special,
                consequential, or punitive damages arising from your use of the
                platform.
              </p>
              <p>
                Our total liability for any claim related to the service will
                not exceed the greater of the amount you paid us in the 12
                months before the claim or PHP 1,000.
              </p>
            </Section>

            <Section title="11. Termination">
              <p>
                You may stop using BLEPP Review at any time. We may suspend or
                terminate your account if you violate these terms, misuse the
                service, create risk for other users, or engage in fraud or
                abusive behavior.
              </p>
              <p>
                After termination, your right to use the service ends. We may
                retain records as needed for legal, security, accounting,
                support, dispute, and legitimate business purposes.
              </p>
            </Section>

            <Section title="12. Governing Law and Contact">
              <p>
                These terms are governed by the laws of the Republic of the
                Philippines. Any disputes will be handled in the appropriate
                courts of the Philippines unless applicable law requires
                otherwise.
              </p>
              <p>
                For questions about these terms, payment proof, refunds, or
                account access, contact BLEPP Review through the official
                support or Facebook page channel shown in the app.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="text-slate-600 space-y-4">{children}</div>
    </section>
  );
}
