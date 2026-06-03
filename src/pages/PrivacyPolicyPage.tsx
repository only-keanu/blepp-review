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
          <p className="text-slate-500 mb-12">Last updated: June 3, 2026</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              This Privacy Policy explains how BLEPP Review collects, uses, and
              protects information when you create an account, use our study
              tools, request support, or send manual payment proof.
            </p>

            <Section title="1. Information We Collect">
              <p>We collect information needed to operate and support the service:</p>
              <ul>
                <li>
                  <strong>Account information:</strong> Full name, email
                  address, password credentials, login provider, and account
                  status.
                </li>
                <li>
                  <strong>Profile and study settings:</strong> Target exam date,
                  daily study hours, selected topics, preferences, and optional
                  profile details.
                </li>
                <li>
                  <strong>Study activity:</strong> Practice answers, flashcard
                  reviews, mistake history, mock exam results, lesson progress,
                  question-bank activity, readiness scores, and related
                  analytics.
                </li>
                <li>
                  <strong>Manual payment proof:</strong> Account email, GCash
                  reference number, sender name or screenshot, payment date and
                  time, access notes, and related Facebook page or support
                  messages used to verify access.
                </li>
                <li>
                  <strong>Technical and security data:</strong> Device, browser,
                  session, log, cookie, and authentication data used to keep the
                  platform working and secure.
                </li>
                <li>
                  <strong>Uploaded content:</strong> Files or text you submit
                  for AI-assisted features if those features are available.
                </li>
              </ul>
            </Section>

            <Section title="2. How We Use Information">
              <p>We use your information to:</p>
              <ul>
                <li>Create, authenticate, and manage your account</li>
                <li>Provide practice, flashcards, mock exams, lessons, and analytics</li>
                <li>Personalize review queues, progress views, and readiness metrics</li>
                <li>Verify manual GCash payments and activate paid access</li>
                <li>Respond to support, refund, account, and access requests</li>
                <li>Detect abuse, fraud, security issues, and service errors</li>
                <li>Send important account, payment, policy, and service notices</li>
                <li>Process uploaded materials only for requested AI-assisted study workflows if available</li>
              </ul>
            </Section>

            <Section title="3. Manual Payments and Support">
              <p>
                BLEPP Review currently verifies paid access manually. Payment
                proof sent through GCash, Facebook, or support channels is used
                to match your payment to your account, activate access, handle
                refunds or disputes, prevent fraud, and maintain transaction
                records.
              </p>
              <p>
                Do not send unnecessary sensitive information. If you send a
                screenshot, you should avoid exposing unrelated balances,
                transactions, government IDs, passwords, or one-time passwords.
              </p>
            </Section>

            <Section title="4. AI and Uploaded Materials">
              <p>
                AI question generation is coming soon and is not included in the
                current launch pass. If AI upload features become available, we
                will process uploaded materials only to provide the requested
                study workflow, such as extracting text and generating review
                questions.
              </p>
              <p>
                You should only upload materials that you own or are allowed to
                use. Do not upload confidential, illegal, or third-party
                copyrighted materials unless you have the right to process them
                through the service.
              </p>
            </Section>

            <Section title="5. Sharing and Service Providers">
              <p>
                We do not sell your personal information. We may share limited
                information with service providers that help us operate the
                platform, such as hosting, authentication, analytics, error
                monitoring, Facebook/Messenger support, and GCash-related
                payment verification workflows.
              </p>
              <p>
                We may also disclose information when required by law, to
                enforce our terms, to protect users or the service, or in
                connection with a business transfer such as a merger or asset
                sale.
              </p>
            </Section>

            <Section title="6. Data Security and Retention">
              <p>
                We use reasonable technical and organizational safeguards to
                protect account and study data. No online service can guarantee
                perfect security, so you are responsible for keeping your login
                credentials private and reporting suspected unauthorized access.
              </p>
              <p>
                We retain account, study, access, payment proof, and support
                records for as long as needed to provide the service, comply
                with legal obligations, resolve disputes, prevent abuse, and
                maintain accurate access records.
              </p>
            </Section>

            <Section title="7. Cookies and Analytics">
              <p>
                We use essential cookies or local storage for authentication and
                platform functionality. We may also use analytics or diagnostic
                tools to understand usage, improve product quality, and detect
                errors.
              </p>
              <p>
                You can control some cookies through your browser settings, but
                disabling essential storage may prevent parts of the app from
                working correctly.
              </p>
            </Section>

            <Section title="8. Your Rights">
              <p>
                Under the Data Privacy Act of 2012 (RA 10173), you may request
                access, correction, deletion, restriction, objection, or
                portability of your personal data, subject to legal and
                operational limits.
              </p>
              <p>
                To make a privacy request, contact BLEPP Review through the
                official support or Facebook page channel shown in the app.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                BLEPP Review is not intended for users under 16 years old. We do
                not knowingly collect personal information from children under
                16. If we learn that we collected such information, we will take
                reasonable steps to delete it.
              </p>
            </Section>

            <Section title="10. Changes and Contact">
              <p>
                We may update this Privacy Policy from time to time. Material
                updates will be posted on this page with a new last updated
                date.
              </p>
              <p>
                For privacy questions, account requests, or payment-proof
                concerns, contact BLEPP Review through the official support or
                Facebook page channel shown in the app.
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
