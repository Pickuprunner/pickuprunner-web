export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

      <Section title="1. Acceptance of Terms">
        <p>
          By using Pickup Runner's website or placing an order, you agree to these Terms of Service.
          If you do not agree, please do not use our services.
        </p>
      </Section>

      <Section title="2. Our Service">
        <p>
          Pickup Runner connects customers with independent local drivers who pick up and deliver
          items from grocery stores, pharmacies, and other retailers. We are a platform — drivers
          are independent contractors, not employees of Pickup Runner.
        </p>
      </Section>

      <Section title="3. Orders and Pricing">
        <ul className="list-disc pl-5 space-y-1">
          <li>A base delivery fee of $10.00 applies to every order</li>
          <li>A mileage rate of $2.00 per mile is added based on delivery distance</li>
          <li>A driver tip starting at $5 (no maximum) goes 100% to your driver</li>
          <li>Prices shown at checkout are final — no hidden fees</li>
          <li>Orders are confirmed once you submit the order form and receive confirmation</li>
        </ul>
      </Section>

      <Section title="4. Alcohol Deliveries">
        <p>
          Pickup Runner may facilitate delivery of alcohol where permitted by law. By requesting
          alcohol delivery, you confirm you are 21 years of age or older. A valid government-issued
          ID will be required upon delivery. We reserve the right to refuse delivery if age cannot
          be verified.
        </p>
      </Section>

      <Section title="5. Driver Terms">
        <p className="mb-3">Drivers who sign up through Pickup Runner agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate personal and vehicle information</li>
          <li>Consent to a background check as part of the application process</li>
          <li>Comply with all applicable local, state, and federal laws while making deliveries</li>
          <li>Maintain a valid driver's license and vehicle insurance</li>
        </ul>
        <p className="mt-3">
          Drivers are independent contractors. Pickup Runner does not guarantee a minimum number
          of deliveries or income.
        </p>
      </Section>

      <Section title="6. Prohibited Uses">
        <p>You may not use our service to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>Order illegal items or substances</li>
          <li>Provide false information on order or driver sign-up forms</li>
          <li>Harass, threaten, or harm drivers or staff</li>
          <li>Attempt to circumvent our pricing or payment system</li>
        </ul>
      </Section>

      <Section title="7. Cancellations and Refunds">
        <p>
          Orders may be cancelled before a driver has accepted the delivery. Once a driver is
          en route, cancellations may be subject to a partial fee. Refund requests for failed
          or incomplete deliveries are handled case-by-case — contact us at{' '}
          <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">
            pickuprunner13@gmail.com
          </a>.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          Pickup Runner is not responsible for: delays caused by traffic or third-party retailers,
          items that are unavailable at the store, damage to items during transport beyond our
          reasonable control, or actions of independent driver contractors.
        </p>
        <p className="mt-3">
          Our total liability to you for any claim shall not exceed the amount you paid for
          the specific order in question.
        </p>
      </Section>

      <Section title="8. Reviews and User Content">
        <p>
          Customers may leave ratings and written feedback for drivers after a completed delivery.
          By submitting a review, you grant Pickup Runner a non-exclusive license to display that
          content on our platform. You agree not to submit reviews that are false, defamatory,
          harassing, or unrelated to your delivery experience. We reserve the right to remove
          content that violates these guidelines.
        </p>
      </Section>

      <Section title="9. Dispute Resolution">
        <p>
          Before filing a formal dispute, you agree to contact us at{' '}
          <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">
            pickuprunner13@gmail.com
          </a>{' '}
          and give us 30 days to resolve the issue informally.
        </p>
        <p className="mt-3">
          If we cannot resolve the dispute informally, both parties agree to resolve it through
          binding individual arbitration rather than in court, except that either party may bring
          claims in small claims court if they qualify. <strong className="text-foreground">You
          waive any right to participate in a class action lawsuit or class-wide arbitration.</strong>
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>
          These Terms are governed by the laws of the state in which Pickup Runner operates.
          Any disputes not subject to arbitration shall be resolved in the appropriate courts
          of that jurisdiction.
        </p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>
          We may update these Terms at any time. Continued use of our service after changes
          are posted constitutes your acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions? Email us at{' '}
          <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">
            pickuprunner13@gmail.com
          </a>.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed text-sm space-y-2">
        {children}
      </div>
    </section>
  )
}
