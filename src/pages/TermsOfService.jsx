import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-20 px-6 font-main bg-primary text-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 font-main text-gradient-primary">
          Terms of Service
        </h1>
        <p className="text-xl text-center mb-16 text-secondary">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent space-y-8">
          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">1. Acceptance of Terms</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              Welcome to QuizMaster. These Terms of Service ("Terms") govern your use of our quiz application and services (collectively, the "Service"). By accessing or using QuizMaster, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">2. Description of Service</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster is an educational platform that allows users to:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Take pre-built quizzes on various topics</li>
              <li>Create and share custom quizzes</li>
              <li>Track quiz performance and progress</li>
              <li>Access educational flashcards and study materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">3. User Accounts</h2>

            <h3 className="text-2xl font-medium mb-3 text-accent">3.1 Account Creation</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              To use certain features of QuizMaster, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-2xl font-medium mb-3 text-accent">3.2 Google Authentication</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster uses Google authentication for account creation and sign-in. By signing in with Google, you authorize us to access your Google profile information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">4. User Content and Conduct</h2>

            <h3 className="text-2xl font-medium mb-3 text-accent">4.1 User-Generated Content</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              You may create and share custom quizzes and flashcards. You retain ownership of your content, but by posting it on QuizMaster, you grant us a license to use, display, and distribute it within our Service.
            </p>

            <h3 className="text-2xl font-medium mb-3 text-accent">4.2 Acceptable Use</h3>
            <p className="text-lg leading-7 text-secondary mb-4">
              You agree not to use QuizMaster to:
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-secondary mb-4 space-y-2">
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Violate intellectual property rights</li>
              <li>Harass or intimidate other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Distribute malware or engage in fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">5. Intellectual Property</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster and its original content, features, and functionality are owned by QuizMaster Inc. and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">6. Privacy</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using QuizMaster, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">7. Service Availability</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              While we strive to provide reliable service, QuizMaster is provided "as is" and "as available." We do not guarantee uninterrupted access and may modify or discontinue features at any time. We are not liable for any damages resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">8. Termination</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We reserve the right to terminate or suspend your account at our discretion, with or without cause. Upon termination, your right to use the Service ceases immediately. We may delete your account data after a reasonable period following termination.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">9. Disclaimers</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              QuizMaster is provided without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. Educational content is provided for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">10. Limitation of Liability</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              To the maximum extent permitted by law, QuizMaster Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">11. Indemnification</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              You agree to indemnify and hold QuizMaster Inc. harmless from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">12. Governing Law</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              These Terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Illinois.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">13. Changes to Terms</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              We may modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of QuizMaster after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gradient-primary">14. Contact Information</h2>
            <p className="text-lg leading-7 text-secondary mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-[var(--neutral-200)] rounded-lg p-4 border border-primary">
              <p className="text-lg text-black">
                <strong>Email:</strong> legal@quizmaster.com<br />
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