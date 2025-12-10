export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-20 px-6 font-main bg-primary text-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 font-main text-gradient-primary">
          Privacy Policy
        </h1>
        <p className="text-xl text-center mb-16 text-secondary">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent space-y-8">
          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">1. Introduction</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              Welcome to QuizMaster ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our QuizMaster application.
            </p>
            <p className="text-lg leading-7 text-secondary">
              By using QuizMaster, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">2. Information We Collect</h2>

            <h3 className="text-2xl font-medium mb-3 text-accent">2.1 Personal Information</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              When you create an account or sign in with Google, we may collect:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Name and profile picture from your Google account</li>
              <li>Email address associated with your Google account</li>
              <li>Account creation and login timestamps</li>
              <li>Quiz performance data and statistics</li>
            </ul>

            <h3 className="text-2xl font-medium mb-3 text-accent">2.2 Usage Information</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              We automatically collect certain information about your use of our application:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Quiz attempts and scores</li>
              <li>Time spent on quizzes</li>
              <li>Features used within the application</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">3. How We Use Your Information</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>To provide and maintain our quiz application</li>
              <li>To personalize your experience and track your progress</li>
              <li>To communicate with you about your account and our services</li>
              <li>To improve our application and develop new features</li>
              <li>To ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">4. Information Sharing and Disclosure</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">5. Data Security</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Secure data encryption</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal information</li>
              <li>Secure authentication systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">6. Your Rights</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your account and associated data</li>
              <li>Withdrawal of consent for data processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">7. Cookies and Tracking</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We may use cookies and similar tracking technologies to enhance your experience with QuizMaster. These technologies help us:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve application performance</li>
              <li>Maintain session security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">8. Third-Party Services</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster integrates with Google for authentication. When you sign in with Google, Google's privacy policy applies to the authentication process. We encourage you to review Google's privacy policy to understand how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">9. Children's Privacy</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">10. Changes to This Privacy Policy</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">11. Contact Us</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-[var(--neutral-200)] rounded-lg p-4 border border-primary">
              <p className="text-lg text-black">
                <strong>Email:</strong> Contact any of the current developers for QuizMaster <a className="text-blue-400" href="/contact">here</a><br />
                <strong>Address:</strong> QuizMaster Inc.<br />
                1 University Parkway, Romeoville, IL 60446
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}