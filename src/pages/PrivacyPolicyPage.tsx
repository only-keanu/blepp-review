import React from 'react';
import { PublicLayout } from '../components/layout/PublicLayout';

export function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-500 mb-12">Last updated: January 15, 2024</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              At BLEPP Review, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>

            <Section title="1. Information We Collect">
              <p>
                We collect information that you provide directly to us,
                including:
              </p>
              <ul>
                <li>
                  <strong>Account Information:</strong> Name, email address, and
                  password when you create an account.
                </li>
                <li>
                  <strong>Profile Information:</strong> Target exam date, study
                  preferences, and other optional details.
                </li>
                <li>
                  <strong>Study Data:</strong> Your answers to questions,
                  flashcard responses, and study progress.
                </li>
                <li>
                  <strong>Uploaded Content:</strong> PDF files you upload for AI
                  question generation (processed but not permanently stored).
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing details
                  processed securely through our payment providers.
                </li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>
                  Personalize your study experience with spaced repetition
                  algorithms
                </li>
                <li>
                  Generate AI-powered questions from your uploaded materials
                </li>
                <li>Track your progress and provide readiness analytics</li>
                <li>
                  Send you important updates about your account and our services
                </li>
                <li>
                  Respond to your comments, questions, and support requests
                </li>
              </ul>
            </Section>

            <Section title="3. Data Storage and Security">
              <p>
                We implement appropriate technical and organizational security
                measures to protect your personal information. Your data is
                stored on secure servers and encrypted both in transit and at
                rest.
              </p>
              <p>
                <strong>PDF Processing:</strong> When you upload PDFs for
                question generation, we process the content to extract text for
                AI analysis. The original PDF files are automatically deleted
                within 24 hours of processing. We do not store or share your
                uploaded materials.
              </p>
            </Section>

            <Section title="4. Information Sharing">
              <p>
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> With trusted third parties
                  who assist us in operating our platform (e.g., payment
                  processors, hosting providers).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights and safety.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets.
                </li>
              </ul>
            </Section>

            <Section title="5. Your Rights">
              <p>
                Under the Data Privacy Act of 2012 (RA 10173), you have the
                right to:
              </p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us at
                privacy@bleppreview.com.
              </p>
            </Section>

            <Section title="6. Cookies and Tracking">
              <p>
                We use cookies and similar tracking technologies to enhance your
                experience on our platform. These include:
              </p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> Required for the platform
                  to function properly.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how
                  users interact with our platform.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences.
                </li>
              </ul>
              <p>
                You can control cookie settings through your browser
                preferences.
              </p>
            </Section>

            <Section title="7. Children's Privacy">
              <p>
                Our services are not intended for users under 16 years of age.
                We do not knowingly collect personal information from children
                under 16. If we learn we have collected such information, we
                will delete it promptly.
              </p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </Section>

            <Section title="9. Contact Us">
              <p>
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <ul>
                <li>Email: privacy@bleppreview.com</li>
                <li>Address: 123 Psychology Lane, Quezon City, Philippines</li>
              </ul>
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
