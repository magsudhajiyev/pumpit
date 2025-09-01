import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - PumpIt",
  description: "Terms and conditions for using PumpIt cross-promotion platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using PumpIt ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            PumpIt is a cross-promotion platform designed to help indie makers and developers promote their products to relevant audiences through strategic partnerships and collaborations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Provide accurate and truthful information about your products</li>
            <li>Respect other users and maintain professional conduct</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not engage in spam or misleading promotional activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data</h2>
          <p className="mb-4">
            We respect your privacy and are committed to protecting your personal data. Please review our Privacy Policy for detailed information about how we collect, use, and protect your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p className="mb-4">
            Users retain ownership of their content and products. By using our service, you grant us a limited license to display and promote your content as necessary to provide the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            PumpIt shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or through the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}