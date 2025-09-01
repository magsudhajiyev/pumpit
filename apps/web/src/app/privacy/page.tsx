import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PumpIt",
  description: "Privacy policy for PumpIt cross-promotion platform",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, add products, or contact us for support.
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Account information (name, email, profile details)</li>
            <li>Product information and promotional content</li>
            <li>Usage data and analytics</li>
            <li>Communication history</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Provide and improve our cross-promotion services</li>
            <li>Match you with relevant promotion opportunities</li>
            <li>Communicate with you about your account and our services</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share information in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>With other users as part of cross-promotion activities</li>
            <li>With service providers who assist in our operations</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transaction</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of certain communications</li>
            <li>Request data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy periodically. We will notify you of any material changes via email or through our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this privacy policy or our data practices, please contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}