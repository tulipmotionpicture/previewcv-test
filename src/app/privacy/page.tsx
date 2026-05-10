import FloatingHeader from "@/components/FloatingHeader";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Privacy Policy & GDPR | LetsMakeCV",
  description:
    "Read our comprehensive Privacy Policy, GDPR compliance information, and cookie policy. Learn how we protect your personal data.",
  keywords: [
    "privacy policy",
    "GDPR",
    "cookie policy",
    "data protection",
    "personal data",
    "CCPA",
    "PIPEDA",
  ],
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
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
          {/* ===== MAIN PRIVACY POLICY ===== */}

          {/* Main Privacy Policy Introduction */}
          <section className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-blue-600">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              PRIVACY POLICY
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
              <p>
                This Privacy Policy governs the collection, use, disclosure, and
                safeguarding of personal data by Accurabyte Technologies (a
                company being incorporated in the State of Georgia, United
                States) and applies to all users accessing or utilizing the
                websites LetsMakeCV.com and PreviewCV.com (collectively, the
                "Platforms").
              </p>

              <p>
                Accurabyte Technologies ("Company," "we," "our," or "us") is
                committed to maintaining the highest standards of privacy
                protection and regulatory compliance, including applicable data
                protection laws such as the GDPR, UK GDPR, CCPA/CPRA, and
                PIPEDA.
              </p>

              <p className="font-semibold text-blue-700 bg-blue-50 p-4 rounded-lg">
                By accessing or continuing to use our Platforms, you acknowledge
                that you have read, understood, and accepted the practices
                described herein.
              </p>
            </div>
          </section>

          {/* Privacy Policy Section 1: Scope */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-600 font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Scope</h3>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              This Policy applies to:
            </p>
            <ul className="space-y-3 mb-6 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  Jobseekers creating and maintaining CV profiles on
                  LetsMakeCV.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  Recruiters, employers, and authorized representatives
                  registered on PreviewCV.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  All users globally accessing or interacting with the Platforms
                  or Services
                </span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed italic">
              This Policy does not apply to third-party content or websites
              linked from our Platforms.
            </p>
          </section>

          {/* Privacy Policy Section 2: Personal Data We Collect */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              2. Personal Data We Collect
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We may collect and process the following categories of
              information:
            </p>

            <h4 className="text-lg font-semibold mb-3">
              A. Information Provided Directly by You
            </h4>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                <strong>Identity details:</strong> name, email, phone number
              </li>
              <li>
                <strong>CV content:</strong> employment history, education,
                skills, qualifications
              </li>
              <li>
                <strong>Profile photographs or portfolio attachments</strong>{" "}
                (optional)
              </li>
              <li>
                <strong>Recruiter organizational information</strong> and
                verification details
              </li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">
              B. Automatically Collected Data
            </h4>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                IP address, device details, browser type, and operating system
              </li>
              <li>Geolocation indicators (approximate)</li>
              <li>Log data: access dates, times, session duration</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">
              C. Communications & Interaction Data
            </h4>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Correspondence between Jobseekers and Recruiters</li>
              <li>Support records and verification responses</li>
            </ul>

            <h4 className="text-lg font-semibold mb-3">
              D. Payment Information
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              Transaction records and billing confirmation (Processed securely
              by third-party payment providers — we do not retain full card
              details)
            </p>

            <h4 className="text-lg font-semibold mb-3">
              E. Restricted and Prohibited Data
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users must not upload:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Government-issued identification numbers</li>
              <li>Biometric, medical, or highly sensitive personal data</li>
              <li>
                Political, religious, or union-related data unless legally
                required for job eligibility
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Such data may be removed without notice.
            </p>
          </section>

          {/* Privacy Policy Section 3: Legal Basis for Processing */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              3. Legal Basis for Processing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Where required by applicable law, we rely on:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Basis
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Application
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Consent
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Public CV visibility, marketing communications
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Contractual necessity
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Account creation and platform operations
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Legitimate interests
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Platform integrity, fraud prevention, employer-candidate
                      interactions
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Legal obligations
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Regulatory compliance and dispute handling
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 leading-relaxed">
              You may withdraw consent at any time without affecting prior
              lawful processing.
            </p>
          </section>

          {/* Privacy Policy Section 4: Purpose of Processing */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              4. Purpose of Processing Personal Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use information to:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Provide and enhance the Services</li>
              <li>Generate and maintain shareable résumé links</li>
              <li>Facilitate employer access to candidate profiles</li>
              <li>Enable legitimate recruitment outreach</li>
              <li>Authenticate accounts and prevent fraudulent activity</li>
              <li>Conduct analytics to improve performance and security</li>
              <li>Comply with applicable legal and regulatory requirements</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not engage in automated decision-making that produces legal
              or similarly significant effects without human involvement.
            </p>
          </section>

          {/* Privacy Policy Section 5: Sharing and Disclosure */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              5. Sharing and Disclosure of Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share Personal Data only with:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Verified Recruiters (subject to visibility settings)</li>
              <li>
                Authorised service providers (hosting, analytics, payment
                processing, cybersecurity)
              </li>
              <li>Regulatory authorities when legally compelled</li>
              <li>
                Successor entities in business restructuring, merger, or
                acquisition
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We never sell Personal Data to unauthorized third parties or data
              brokers.
            </p>
          </section>

          {/* Privacy Policy Section 6: International Transfers */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              6. International Transfers
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Personal Data may be processed in jurisdictions outside your
              residence, including the United States. All such transfers are
              conducted under appropriate legal safeguards such as Standard
              Contractual Clauses, data residency controls, and
              industry-standard protections.
            </p>
          </section>

          {/* Privacy Policy Section 7: Data Retention */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">7. Data Retention</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain Personal Data only for as long as necessary to fulfil
              the purposes set out in this Policy, or longer if required by law.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Inactive or dormant accounts and CV links may be deactivated or
              removed after a reasonable period, subject to lawful retention
              obligations.
            </p>
          </section>

          {/* Privacy Policy Section 8: User Rights & Requests */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              8. User Rights & Requests
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Access, correct, or delete Personal Data</li>
              <li>Restrict or object to processing</li>
              <li>
                Transfer Personal Data to another controller ("data
                portability")
              </li>
              <li>Withdraw consent at any time</li>
              <li>Opt-out of marketing activities</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              EU/UK users may escalate concerns to their Data Protection
              Authority. We may require identity verification before processing
              such requests.
            </p>
          </section>

          {/* Privacy Policy Section 9: Cookies & Tracking */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              9. Cookies & Tracking Technologies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We utilize cookies for:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Essential authentication and functionality</li>
              <li>Performance analytics</li>
              <li>
                Advertising and personalization (only with lawful consent)
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Details and jurisdiction-specific controls are provided in our
              GDPR & Cookie Policy section below.
            </p>
          </section>

          {/* Privacy Policy Section 10: Data Security */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">10. Data Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We maintain a comprehensive security program designed to protect
              Personal Data through:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Encryption (in transit and at rest)</li>
              <li>Advanced access controls and authentication</li>
              <li>Routine audits, risk assessments, and threat monitoring</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              No method of electronic storage is infallible; therefore, absolute
              security cannot be guaranteed.
            </p>
          </section>

          {/* Privacy Policy Section 11: Fraud Detection */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              11. Fraud Detection & Enforcement
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">We may:</p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                Monitor activities to detect fraud, abuse, or policy breaches
              </li>
              <li>
                Take immediate action against misconduct, including suspension,
                data preservation, and referral to authorities
              </li>
            </ul>
          </section>

          {/* Privacy Policy Section 12: Data Breach Notification */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              12. Data Breach Notification
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              In the unlikely event of a data breach affecting Personal Data:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                Affected Users and applicable authorities will be notified
                within statutory timeframes
              </li>
              <li>Prompt remediation measures will be implemented</li>
            </ul>
          </section>

          {/* Privacy Policy Section 13: Business Continuity */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              13. Business Continuity & Corporate Events
            </h3>
            <p className="text-gray-700 leading-relaxed">
              In the event of a merger, acquisition, or restructuring, Personal
              Data may be transferred to the new controlling entity. All
              protections under this Policy will continue to apply until
              formally amended.
            </p>
          </section>

          {/* Privacy Policy Section 14: Amendments */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              14. Amendments to This Policy
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update this Policy at any time. Material
              updates will be communicated via our Platforms or by email when
              appropriate. Continued use of the Services constitutes acceptance
              of any modifications.
            </p>
          </section>

          {/* Privacy Policy Section 15: Contact Information */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">15. Contact Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy inquiries or to exercise your rights:
            </p>
            <p>complaints@accurabyte.com</p>
            {/* <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-semibold">Accurabyte Technologies</p>
              <p className="text-gray-600">Email: [To be updated]</p>
              <p className="text-gray-600">Address: [To be updated]</p>
            </div> */}
            <p className="text-gray-700 leading-relaxed">
              We will respond to verified requests within legally required
              timelines.
            </p>
          </section>

          {/* Privacy Policy Section 16: Acknowledgment and Consent */}
          <section className="mb-16 pb-12 border-b border-gray-300">
            <h3 className="text-xl font-bold mb-4">
              16. Acknowledgment and Consent
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using LetsMakeCV.com or PreviewCV.com, you:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                Acknowledge that you have read and understood this Privacy
                Policy
              </li>
              <li>
                Agree to the processing of Personal Data in accordance with this
                Policy
              </li>
              <li>Consent to international data transfers where applicable</li>
            </ul>
          </section>

          {/* ===== GDPR & COOKIE POLICY ===== */}

          <section className="my-16 pt-12">
            <h2 className="text-2xl font-bold mb-6">GDPR & COOKIE POLICY</h2>
            <p className="text-gray-600 mb-8">
              <strong>Effective Date:</strong> To be updated
            </p>
            <p className="text-gray-600 mb-8">
              <strong>Last Updated:</strong> To be updated
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              This GDPR & Cookie Policy ("Policy") governs the collection and
              processing of Personal Data relating to natural persons located in
              the European Union (EU) and the United Kingdom (UK) who access or
              use the online services provided by Accurabyte Technologies (the
              "Company," "we," "us," or "our") through its digital platforms:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                <strong>LetsMakeCV.com</strong> — Jobseeker Platform
              </li>
              <li>
                <strong>PreviewCV.com</strong> — Recruiter Platform
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-6">
              (collectively, the "Platforms").
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              This Policy is supplemental to the Company's Terms & Conditions
              and Privacy Policy, and is intended to ensure strict compliance
              with:
            </p>

            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                The General Data Protection Regulation (EU) 2016/679 (GDPR)
              </li>
              <li>The UK GDPR</li>
              <li>The ePrivacy Directive</li>
              <li>Applicable national data protection laws</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-6">
              By accessing the Platforms from the EU/UK, you acknowledge that
              you have read, understood, and accepted the terms of this Policy.
            </p>
          </section>

          {/* GDPR Section 1: Data Controller */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">1. Data Controller</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Company is the Data Controller with respect to Personal Data
              processed through the Platforms:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-semibold">Accurabyte Technologies</p>
              <p className="text-gray-600">Email: complaints@accurabyte.com</p>
              {/* <p className="text-gray-600">Address: [To be updated]</p> */}
            </div>
            <p className="text-gray-700 leading-relaxed">
              Where required under GDPR or UK GDPR, the Company shall appoint
              and publish the details of an EU Representative and/or UK
              Representative.
            </p>
          </section>

          {/* GDPR Section 2: Lawful Basis for Processing */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              2. Lawful Basis for Processing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Processing of Personal Data is conducted exclusively on one or
              more lawful bases as defined by GDPR Article 6:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Consent</li>
              <li>Contract performance</li>
              <li>Legal obligation</li>
              <li>Vital interests</li>
              <li>Public task</li>
              <li>Legitimate interests</li>
            </ul>
            <p className="text-gray-700 leading-relaxed text-sm italic">
              Withdrawal of consent does not affect the lawfulness of processing
              based on consent prior to its withdrawal.
            </p>
          </section>

          {/* GDPR Section 3: Data Subject Rights */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">3. Data Subject Rights</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              EU/UK users retain the following rights, subject to statutory
              limitations:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                <strong>Right of Access</strong> — confirmation and access to
                Personal Data
              </li>
              <li>
                <strong>Right to Rectification</strong> — correction of
                inaccurate or incomplete data
              </li>
              <li>
                <strong>Right to Erasure</strong> — deletion in accordance with
                Article 17
              </li>
              <li>
                <strong>Right to Restrict Processing</strong>
              </li>
              <li>
                <strong>Right to Data Portability</strong>
              </li>
              <li>
                <strong>Right to Object</strong> — including objections to
                profiling or legitimate interest processing
              </li>
              <li>
                <strong>Right to Withdraw Consent</strong> at any time
              </li>
              <li>
                <strong>Right to Lodge a Complaint</strong> with a competent
                supervisory authority
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              The Company will respond to verified rights requests within one
              (1) month, subject to lawful extensions.
            </p>
          </section>

          {/* GDPR Section 4: Public Profile Visibility */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              4. Public Profile Visibility & Search Indexing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              At the voluntary election of a Jobseeker, CVs may be made publicly
              accessible.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              By enabling public visibility, the user expressly consents to:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Availability to verified recruiters</li>
              <li>Limited discoverability through search engine indexing</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Users retain full control and may modify visibility settings at
              any time.
            </p>
          </section>

          {/* GDPR Section 5: Allocation of Compliance Responsibilities */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              5. Allocation of Compliance Responsibilities
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recruiters accessing Jobseeker Personal Data through PreviewCV.com
              act as independent Data Controllers for their subsequent use of
              such data, including:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Lawful processing</li>
              <li>Data minimization and retention practices</li>
              <li>Responding to candidate privacy requests</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recruiter misuse may result in:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Immediate suspension</li>
              <li>Reporting to regulatory authorities</li>
              <li>Enforcement through legal proceedings</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              This clause ensures liability isolation for the Company.
            </p>
          </section>

          {/* GDPR Section 6: Data Minimization */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              6. Data Minimization & Prohibited Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users must disclose only Personal Data relevant to recruitment
              purposes. Submitting the following is strictly prohibited:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Biometric data, health information, union membership</li>
              <li>Government-issued identification numbers</li>
              <li>
                Data revealing racial/ethnic origin, political opinions, or
                religious beliefs (unless legally required for employment
                eligibility and voluntarily submitted)
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              The Company reserves the right to remove such data without notice.
            </p>
          </section>

          {/* GDPR Section 7: Accountability */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              7. Accountability & Vendor Management
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Company shall:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Maintain Records of Processing Activities (RoPA)</li>
              <li>
                Conduct Data Protection Impact Assessments (DPIAs) where
                required
              </li>
              <li>
                Execute Data Processing Agreements (DPAs) with all compliant
                service providers
              </li>
              <li>Perform ongoing security and compliance audits</li>
            </ul>
          </section>

          {/* GDPR Section 8: International Data Transfers */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              8. International Data Transfers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Personal Data may be transferred to jurisdictions outside the
              EU/UK, including the United States. All cross-border transfers
              utilize appropriate legal safeguards:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Transfer Impact Assessments</li>
              <li>Encryption and access limitation controls</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Details may be provided upon request where legally permitted.
            </p>
          </section>

          {/* GDPR Section 9: Cookie & Tracking Technology */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              9. Cookie & Tracking Technology Usage
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Platforms deploy cookies as categorized below:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ul className="list-disc list-inside text-gray-700">
                <li>
                  <strong>Essential Cookies:</strong> Required for platform
                  functionality
                </li>
                <li>
                  <strong>Performance Cookies:</strong> Analytics and
                  optimization
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Placed only with explicit
                  consent
                </li>
                <li>
                  <strong>Social Media Cookies:</strong> Placed only with
                  explicit consent
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              No non-essential cookies are placed without explicit prior consent
              through the Cookie Consent Banner. Users may adjust preferences at
              any time via Cookie Settings.
            </p>
          </section>

          {/* GDPR Section 10: Do Not Track Signals */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">10. Do Not Track Signals</h3>
            <p className="text-gray-700 leading-relaxed">
              Due to varying interpretations and lack of binding standards, the
              Company does not currently respond to browser-based Do Not Track
              ("DNT") signals.
            </p>
          </section>

          {/* GDPR Section 11: Automated Decision-Making */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              11. Automated Decision-Making
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The Company does not perform automated decision-making producing
              legal or similarly significant effects on users without meaningful
              human involvement.
            </p>
          </section>

          {/* GDPR Section 12: Retention & Deactivation */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              12. Retention & Deactivation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Personal Data is retained only for the duration necessary to
              fulfill contractual and legal obligations. Dormant accounts and
              public CV links may be deactivated following reasonable advance
              notice, subject to lawful record retention exceptions.
            </p>
          </section>

          {/* GDPR Section 13: Data Security */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">13. Data Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We maintain a comprehensive security framework including:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Encryption of data in transit and at rest</li>
              <li>Strict access role controls</li>
              <li>Intrusion detection and real-time threat monitoring</li>
              <li>Regular vulnerability assessments and remediation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Despite these measures, no system can be guaranteed impregnable.
            </p>
          </section>

          {/* GDPR Section 14: Data Breach Notification */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">
              14. Data Breach Notification
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              In the event of a Personal Data breach presenting risk to your
              rights:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>
                Notification to affected individuals will occur without undue
                delay
              </li>
              <li>
                Supervisory authorities will be notified within the deadlines
                prescribed by law
              </li>
            </ul>
          </section>

          {/* GDPR Section 15: Complaints Procedure */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">15. Complaints Procedure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Initial complaints should be directed to:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-semibold">Data Protection Contact</p>
              <p className="text-gray-600">Email: complaints@accurabyte.com</p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Unresolved concerns may be escalated to your local Data Protection
              Authority. (List available from the{" "}
              <a
                href="https://ec.europa.eu/info/law/law-topic/data-protection/reform/rights-citizens_en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                European Commission website
              </a>
              )
            </p>
          </section>

          {/* GDPR Section 16: Amendments */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">16. Amendments</h3>
            <p className="text-gray-700 leading-relaxed">
              This Policy may be amended to reflect legal, operational, or
              technical developments. Updated versions will display a new "Last
              Updated" date. Continued use of the Platforms constitutes
              acceptance of any revised Policy.
            </p>
          </section>

          {/* GDPR Section 17: Acknowledgment */}
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">17. Acknowledgment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing the Platforms from within the EU/UK and by providing
              consent to non-essential cookies where applicable, you:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Acknowledge this Policy</li>
              <li>Affirm that you understand your rights</li>
              <li>
                Consent to the processing and international transfer of your
                Personal Data in accordance with GDPR/UK GDPR
              </li>
            </ul>
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
