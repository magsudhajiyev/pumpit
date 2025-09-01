import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - PumpIt",
  description: "Refund policy for PumpIt cross-promotion platform",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">30-Day Money-Back Guarantee</h2>
          <p className="mb-4">
            At PumpIt, we're committed to your satisfaction. We offer a comprehensive 30-day money-back guarantee for all paid subscriptions (Pro and Enterprise plans). If you're not completely satisfied with our service, we'll refund your payment, no questions asked.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Eligible Refunds</h2>
          <p className="mb-4">You are eligible for a full refund if:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>You request a refund within 30 days of your initial payment</li>
            <li>You are unsatisfied with the service for any reason</li>
            <li>Technical issues prevent you from using the platform effectively</li>
            <li>The service does not meet the features described on our website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibent mb-4">Refund Process</h2>
          <p className="mb-4">To request a refund:</p>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Contact our support team via email or through your dashboard</li>
            <li>Provide your account details and reason for the refund request</li>
            <li>We'll process your request within 24-48 hours</li>
            <li>Refunds will be credited back to your original payment method within 5-10 business days</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Free Plan</h2>
          <p className="mb-4">
            Our free plan is always available at no cost. There are no charges or fees associated with the free tier, so no refunds are applicable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Partial Refunds</h2>
          <p className="mb-4">
            For annual subscriptions, if you request a refund after using the service for part of the billing period, we may offer a prorated refund based on unused time, depending on the circumstances and usage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Non-Refundable Items</h2>
          <p className="mb-4">The following are generally non-refundable:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Requests made more than 30 days after the initial payment</li>
            <li>Accounts suspended for violation of our Terms of Service</li>
            <li>Custom development work or one-time setup fees (if applicable)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Cancellation</h2>
          <p className="mb-4">
            You can cancel your subscription at any time from your account settings. Upon cancellation:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Your subscription will remain active until the end of the current billing period</li>
            <li>You'll retain access to all paid features until the subscription expires</li>
            <li>Your account will automatically switch to the free plan</li>
            <li>No future charges will occur unless you reactivate your subscription</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            For refund requests or questions about this policy, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Email: support@pumpit.to</li>
            <li>Through your account dashboard support section</li>
            <li>Response time: Within 24 hours during business days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Policy Changes</h2>
          <p className="mb-4">
            We reserve the right to modify this refund policy at any time. Changes will be posted on this page with an updated revision date. Continued use of our service after changes constitutes acceptance of the new policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fair Usage</h2>
          <p className="mb-4">
            While we stand behind our 30-day guarantee, we expect fair usage. Repeated refund requests or patterns suggesting misuse of the policy may result in account review and potential service restrictions.
          </p>
        </section>
      </div>
    </div>
  );
}