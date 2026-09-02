export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

      <Section title="1. Who We Are">
        <p>
          Pickup Runner ("we," "us," or "our") is a hyper-local pickup and delivery service
          operating in your area. This Privacy Policy explains how we collect, use, and protect
          your personal information when you use our website or services.
        </p>
      </Section>
      <Section title="2. Information We Collect">
        <p className="mb-3">We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, phone number, and email address when placing an order or signing up as a driver</li>
          <li>Pickup and delivery addresses for order fulfillment</li>
          <li>Vehicle information for driver applicants</li>
          <li>Payment information (processed securely — we do not store card numbers)</li>
        </ul>
        <p className="mt-3">
          We may also collect limited usage data automatically (e.g., page visits, browser type)
          to improve our service.
        </p>
      </Section>
      <Section title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>To process and fulfill your delivery orders</li>
          <li>To contact you about your order status</li>
          <li>To process driver applications and background checks</li>
          <li>To send service updates or important notices (not marketing spam)</li>
          <li>To improve our website and services</li>
        </ul>
      </Section>
      <Section title="4. Sharing Your Information">
        <p>
          We do not sell your personal information. We may share it only with:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li><strong className="text-foreground">Drivers</strong> — your name and delivery address to complete your order</li>
          <li><strong className="text-foreground">Background check providers</strong> — for driver applicants only</li>
          <li><strong className="text-foreground">Payment processors</strong> — to handle transactions securely</li>
          <li><strong className="text-foreground">Law enforcement</strong> — if required by law</li>
        </ul>
      </Section>
      <Section title="5. Data Retention">
        <p>
          We retain your information for as long as necessary to provide our services and comply
          with legal obligations. You may request deletion of your data at any time by contacting us.
        </p>
      </Section>
      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of non-essential communications</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, email us at <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">pickuprunner13@gmail.com</a>.
        </p>
      </Section>
      <Section title="7. Location Data">
        <p>
          The Pickup Runner driver app collects precise GPS location data to enable core delivery
          functionality, including:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>Routing drivers to pickup and delivery addresses</li>
          <li>Displaying real-time delivery progress to customers</li>
          <li>Calculating accurate mileage for driver pay</li>
        </ul>
        <p className="mt-3">
          <strong className="text-foreground">Foreground location</strong> is collected while the
          app is in use. <strong className="text-foreground">Background location</strong> may be
          collected while a delivery is active so customers can track their order in real time.
          Location collection stops when no active delivery is in progress.
        </p>
        <p className="mt-3">
          Location data is retained for the duration of the delivery and up to 30 days for
          dispute resolution purposes, then permanently deleted. We do not sell location data
          or use it for advertising.
        </p>
        <p className="mt-3">
          You may disable location permissions in your device settings, but doing so will prevent
          the driver app from functioning.
        </p>
      </Section>
      <Section title="8. Push Notifications">
        <p>
          We may send push notifications to inform you of order status updates, delivery
          confirmations, and important service alerts. You can opt out of notifications at any
          time through your device settings. Opting out will not affect your ability to use
          the service, but you may miss time-sensitive order updates.
        </p>
      </Section>
      <Section title="9. Account Deletion">
        <p>
          You have the right to permanently delete your Pickup Runner account and all associated
          personal data at any time.
        </p>
        <p className="mt-3">
          <strong className="text-foreground">To request account deletion:</strong> Email{' '}
          <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">
            pickuprunner13@gmail.com
          </a>{' '}
          with the subject line <strong className="text-foreground">"Delete My Account"</strong> and
          include the email address associated with your account.
        </p>
        <p className="mt-3">
          We will process your request within 30 days. Upon deletion:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>Your account and profile information will be permanently removed</li>
          <li>Order history will be anonymized or deleted</li>
          <li>Location data will be deleted</li>
          <li>We may retain minimal records required by law (e.g., tax/payment records) for up to 7 years</li>
        </ul>
      </Section>
      <Section title="10. Cookies">
        <p>
          Our website may use basic cookies for functionality (e.g., remembering your session).
          We do not use advertising or third-party tracking cookies.
        </p>
      </Section>
      <Section title="11. Security">
        <p>
          We take reasonable technical and organizational measures to protect your information.
          However, no internet transmission is 100% secure — please contact us immediately if
          you suspect any unauthorized access to your data.
        </p>
      </Section>
      <Section title="12. Children's Privacy">
        <p>
          Our services are not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us data, please contact us
          so we can delete it.
        </p>
      </Section>
      <Section title="13. Changes to This Policy">
        <p>
          We may update this policy from time to time. We'll post the revised version here with
          an updated date. Continued use of our service after changes constitutes acceptance.
        </p>
      </Section>
      <Section title="14. Contact Us">
        <p>
          Questions about this policy? Reach us at:
        </p>
        <ul className="list-none mt-3 space-y-1">
          <li>Email: <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">pickuprunner13@gmail.com</a></li>
          <li>Website: <a href="https://www.pickuprunner.net" className="text-primary hover:underline">www.pickuprunner.net</a></li>
        </ul>
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
