import FloatingHeader from "@/components/FloatingHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | LetsMakeCV",
  description:
    "Read our comprehensive Terms & Conditions Agreement. Understand the rules and policies governing the use of LetsMakeCV and PreviewCV platforms.",
  keywords: [
    "terms and conditions",
    "terms of service",
    "agreement",
    "user agreement",
    "legal terms",
    "service terms",
  ],
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Introduction Section */}
          <section className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-slate-700">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              TERMS & CONDITIONS AGREEMENT
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Effective Date
                </p>
                <p className="text-lg text-gray-900">1 April 2025</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="text-lg text-gray-900">1 April 2025</p>
              </div>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Legal Entity</p>
                <p>ACCURABYTE TECHNOLOGIES LLC<br /> -Georgia, Tbilisi,</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Applicable Websites
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-700 font-bold">•</span>
                    <span>
                      <strong>LetsMakeCV.com</strong> — Jobseeker Platform
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-700 font-bold">•</span>
                    <span>
                      <strong>PreviewCV.com</strong> — Recruiter Platform
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 1: Acceptance of Agreement */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Acceptance of Agreement
              </h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                By accessing or using the Services provided via LetsMakeCV.com
                or PreviewCV.com (collectively, the "Platforms"), you
                acknowledge that you have read, understood, and agree to be
                legally bound by this Terms & Conditions Agreement
                ("Agreement"). If you do not agree, you must discontinue all use
                immediately.
              </p>
              <p>
                Accurabyte Technologies ("Company," "we," "us," or "our") may
                modify these Terms at any time, and continued use thereafter
                constitutes acceptance of the revised Terms.
              </p>
            </div>
          </section>

          {/* Section 2: Eligibility Requirements */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Eligibility Requirements
              </h3>
            </div>
            <ul className="space-y-3 text-gray-700 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Candidates must be at least eighteen (18) years old and
                  legally eligible to work within their jurisdiction.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Recruiters/Employers must be authorized representatives of a
                  legitimate business or organization engaged in lawful hiring
                  practices.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  The Company may request identity or employment verification at
                  any time and may suspend accounts with unverifiable or
                  fraudulent information.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Description of Services */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Description of Services
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Platforms provide:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>CV/Resume creation tools with ATS-compatible design</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Public and shareable résumé links</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>PDF download functionality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Candidate visibility to verified recruiters via PreviewCV.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Direct communication functions between candidates and
                  recruiters
                </span>
              </li>
            </ul>
            <p className="leading-relaxed italic text-amber-700 bg-amber-50 p-4 rounded">
              The Company does not act as an employment agency or guarantee job
              placement.
            </p>
          </section>

          {/* Section 4: Account Registration & Security */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                4
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Account Registration & Security
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users are responsible for:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Accurate, truthful registration information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Maintaining confidentiality of access credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>All activity conducted under their account</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Unauthorized account access must be reported immediately. The
              Company assumes no responsibility for losses caused by compromised
              credentials.
            </p>
          </section>

          {/* Section 5: User-Generated Content and Ownership */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                5
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                User-Generated Content and Ownership
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Candidates retain ownership of submitted personal data and CV
              content. By uploading data, you grant the Company a worldwide,
              non-exclusive, royalty-free license to:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Host, store, and display the content as intended by the
                  Services
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Provide access to authorized recruiters when visibility
                  settings allow
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Generate a shareable public link to your CV</span>
              </li>
            </ul>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-900 font-semibold mb-2">
                User Warranties:
              </p>
              <p className="text-gray-700 leading-relaxed">
                Users warrant that their submitted content is lawful, accurate,
                and non-infringing, and does not contain defamatory,
                discriminatory, or harmful material. We reserve the right to
                remove any content violating these provisions.
              </p>
            </div>
          </section>

          {/* Section 6: Recruiter Conduct and Data Use */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                6
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Recruiter Conduct and Data Use
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recruiters agree that:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Candidate information will only be used for legitimate hiring
                  purposes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  No resale, redistribution, automated scraping, bulk messaging,
                  harassment, or discriminatory use is permitted
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Compliance with employment, privacy, anti-discrimination, and
                  immigration laws is solely their responsibility
                </span>
              </li>
            </ul>
            <p className="text-red-700 bg-red-50 p-4 rounded-lg font-semibold">
              Violation may result in immediate termination and legal action.
            </p>
          </section>

          {/* Section 7: Prohibited Conduct */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                7
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Prohibited Conduct
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users are expressly prohibited from:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">✕</span>
                <span>
                  Attempting to reverse engineer, copy, or commercially exploit
                  the Platforms
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">✕</span>
                <span>Deploying automated tools or scripts to access data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">✕</span>
                <span>
                  Publishing malicious, illegal, or misleading information
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">✕</span>
                <span>Circumventing access controls or security features</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We reserve enforcement rights including suspension and reporting
              misconduct to authorities.
            </p>
          </section>

          {/* Section 8: Visibility Settings, Indexing & Data Retention */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                8
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Visibility Settings, Indexing & Data Retention
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users selecting a public profile acknowledge:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Public CV links may be indexed by search engines or
                  third-party services
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  The Company may remove or deactivate inactive profiles or
                  shared links after a reasonable period
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Users can modify visibility preferences at any time subject to
              system availability.
            </p>
          </section>

          {/* Section 9: Fees, Payment & Refund Policy */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                9
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Fees, Payment & Refund Policy
              </h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Some features of the Platforms may require payment. All prices and applicable charges will be clearly displayed at checkout prior to purchase. By completing a transaction, the user authorizes payment processing through our designated third-party payment provider.
              </p>
              <p>
                Users may request a refund within 14 calendar days from the date of purchase, provided the request is made in accordance with our payment provider’s applicable refund requirements and processing procedures.
              </p>
              <p>
                If a refund is approved, it will be issued to the original payment method used during purchase. Processing times may vary depending on the payment provider or financial institution.
              </p>
              <p>
                Fees, pricing structures, and paid service offerings may be modified at any time at the Company’s discretion, with updated pricing reflected on the Platforms or at checkout before purchase.
              </p>
            </div>
          </section>

          {/* Section 10: Communication Consent */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                10
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Communication Consent
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using the Platforms, users consent to:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Email and/or SMS notifications regarding account activity,
                  hiring opportunities, and service updates
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Users may opt out of marketing communications at any time while
              continuing to receive essential service notices.
            </p>
          </section>

          {/* Section 11: Third-Party Services */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                11
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Third-Party Services
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Platforms may interface with third-party websites or
              applications. We do not control and are not responsible for:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>External content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Security or privacy practices of third parties</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              All interactions with external services are at the user's own
              risk.
            </p>
          </section>

          {/* Section 12: Service Availability */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                12
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Service Availability
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Platforms are provided "as is" without guarantees of:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Uninterrupted or error-free operation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Complete security or data integrity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Permanent storage of user content</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Scheduled or unscheduled maintenance may occur without notice.
            </p>
          </section>

          {/* Section 13: Disclaimer of Warranties */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                13
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Disclaimer of Warranties
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Company disclaims all warranties, express or implied,
              including:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Fitness for a particular purpose</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Accuracy or completeness of user-provided data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Hiring results, employment accuracy, or candidate suitability
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Users assume full responsibility for their interactions and
              decisions.
            </p>
          </section>

          {/* Section 14: Limitation of Liability */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                14
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Limitation of Liability
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, the Company shall not be
              liable for:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Loss of employment or hiring opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Business interruption, data loss, delays, or unauthorized
                  access
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>
                  Any indirect, special, incidental, exemplary, or consequential
                  damages
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Total liability shall not exceed the amount actually paid by the
              user in the preceding six (6) months.
            </p>
          </section>

          {/* Section 15: Indemnification */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                15
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Indemnification
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users agree to indemnify, defend, and hold harmless the Company
              from all damages and claims arising out of:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Breach of this Agreement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Misuse of the Platforms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>Violation of the rights of third parties</span>
              </li>
            </ul>
          </section>

          {/* Section 16: Termination */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                16
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Termination</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or permanently terminate user accounts:
            </p>
            <ul className="space-y-3 mb-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>For violation of these Terms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>For illegal or fraudulent activity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-700 font-bold mt-1">•</span>
                <span>At our discretion for platform integrity</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, licenses granted under this Agreement shall
              cease immediately and user access to data may be limited or
              revoked.
            </p>
          </section>

          {/* Section 17: Force Majeure */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                17
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Force Majeure
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              The Company is not liable for delays or failures caused by events
              beyond reasonable control including but not limited to
              cyberattacks, pandemics, natural disasters, or governmental
              restrictions.
            </p>
          </section>

          {/* Section 18: Assignment */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                18
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Assignment</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may assign or transfer our rights and obligations under this
              Agreement without restriction, including as part of a merger,
              acquisition, or business restructuring.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Users may not assign their rights without prior written consent.
            </p>
          </section>

          {/* Section 19: Severability */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                19
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Severability</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              If any provision of this Agreement is held invalid, the remaining
              terms shall continue in full force and effect.
            </p>
          </section>

          {/* Section 20: Survival */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                20
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Survival</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Sections relating to intellectual property, indemnification,
              limitation of liability, governing law, and dispute resolution
              shall survive account termination.
            </p>
          </section>

          {/* Section 21: Governing Law, Jurisdiction & Global Service Scope */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                21
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Governing Law, Jurisdiction & Global Service Scope
              </h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This Agreement applies to users worldwide. Regardless of the
                country from which the Services are accessed, this Agreement
                shall be governed by the laws of the State of Georgia, United
                States of America, without regard to conflict-of-law rules.
              </p>
              <p>
                Any dispute shall be resolved exclusively by binding arbitration
                in Georgia, in the English language. Users waive any right to
                participate in class actions or representative claims.
              </p>
            </div>
          </section>

          {/* Section 22: Contact Information */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold">
                22
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Contact Information
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              For legal or support inquiries, please contact:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-gray-900">
                Accurabyte Technologies
              </p>
              <p className="text-gray-600">Email: support@accurabyte.com</p>
              {/* <p className="text-gray-600">Address: [To be updated]</p> */}
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg p-8 border-2 border-slate-300">
            <p className="text-center text-gray-900 leading-relaxed">
              By accessing and using <strong>LetsMakeCV.com</strong> or{" "}
              <strong>PreviewCV.com</strong>, you confirm your full and
              unconditional acceptance of these Terms & Conditions.
            </p>
          </section>

          {/* Last Updated */}
          <section className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">Last Updated: 1 April 2025</p>
          </section>
        </div>
      </div>
    </div>
  );
}
