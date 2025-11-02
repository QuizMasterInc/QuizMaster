import DarkLightMode from './DarkLightMode';

export default function Settings() {
  return (
    <div className="min-h-screen bg-primary text-primary px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-gradient-primary text-5xl font-bold tracking-wide">Settings</h1>
          <p className="text-secondary text-xl">Customize your QuizMaster experience</p>
        </div>

        {/* Appearance Section - Now as a centered single card */}
        <div className="flex justify-center">
          <div className="bg-card border border-primary rounded-xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center justify-center">
              <span className="mr-3">🎨</span>
              Appearance
            </h2>
            <DarkLightMode />
            {/* <HighContrastToggle /> */} {/* Commented out - component doesn't exist */}
          </div>
        </div>
        
      </div>
    </div>
  );
}