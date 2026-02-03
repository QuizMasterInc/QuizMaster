import { useEffect, useState } from 'react';
import HeroSection from './HeroSection';
import RecentActivity from './RecentActivity';

const Home = () => {
  const [someState, setSomeState] = useState(null);

  useEffect(() => {
    // Some effect logic
  }, []);

  return (
    <main>
      <HeroSection />
      <RecentActivity limit={6} />
      {/* Other content */}
    </main>
  );
};

export default Home;
