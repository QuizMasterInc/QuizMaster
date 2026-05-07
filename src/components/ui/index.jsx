import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import '../../config/firebase';

export const appVersion = '2.3.0';
export const appVersionState = {
  value: appVersion,
};

const normalizeVersion = (version) => String(version || '')
  .trim()
  .replace(/^v/i, '');

const compareVersions = (firstVersion, secondVersion) => {
  const firstParts = normalizeVersion(firstVersion).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const secondParts = normalizeVersion(secondVersion).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const partCount = Math.max(firstParts.length, secondParts.length);

  for (let index = 0; index < partCount; index += 1) {
    const firstPart = firstParts[index] || 0;
    const secondPart = secondParts[index] || 0;

    if (firstPart > secondPart) return 1;
    if (firstPart < secondPart) return -1;
  }

  return 0;
};

const getHighestPublishedVersion = (entries) => entries.reduce((highestVersion, entry) => {
  if (!entry.version) return highestVersion;

  const normalizedEntryVersion = normalizeVersion(entry.version);

  if (!highestVersion || compareVersions(normalizedEntryVersion, highestVersion) > 0) {
    return normalizedEntryVersion;
  }

  return highestVersion;
}, normalizeVersion(appVersion));

export const updateAppVersion = (version) => {
  const normalizedVersion = normalizeVersion(version);

  if (normalizedVersion) {
    appVersionState.value = normalizedVersion;
  }

  return appVersionState.value;
};

// Reusable Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 shadow-lg hover:shadow-pink-500/40 focus:ring-pink-500',
    secondary: 'bg-gray-800 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable Back Button Component
export const BackButton = ({
  fallback = '/dashboard',
  children = 'Back',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(fallback);
    }
  };

  return (
    <div>
      <button
        onClick={handleBack}
        className="inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
      >
        {children}
      </button>
    </div>
  );
};

// Reusable Card Component
export const Card = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg';
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Reusable Footer Component
export const Footer = () => {
  const [displayVersion, setDisplayVersion] = useState(appVersion);

  useEffect(() => {
    const unsubscribe = firebase.firestore()
      .collection('changelog')
      .where('published', '==', true)
      .where('status', '==', 'published')
      .onSnapshot((snapshot) => {
        const publishedEntries = snapshot.docs.map((doc) => doc.data());
        const latestPublishedVersion = getHighestPublishedVersion(publishedEntries);

        setDisplayVersion(latestPublishedVersion);
      }, (error) => {
        console.error('Unable to load latest changelog version:', error);
        setDisplayVersion(appVersion);
      });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <footer className="w-full fixed bottom-0 left-0 bg-gradient-to-r from-[#1a0533] via-[#220b47] to-[#100222] text-center py-3 text-sm text-gray-300 border-t border-purple-800 shadow-inner z-50">
        <div className="w-full px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="font-medium tracking-wide text-gray-400 md:ml-24">
              © 2025 <span className="text-purple-400 font-semibold">QuizMaster</span>. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 items-center">
              <Link
                to="/changelog"
                className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs font-medium text-gray-400 transition-all duration-200 hover:border-purple-500 hover:bg-purple-950/40 hover:text-purple-300"
                aria-label={`View changelog for version ${displayVersion}`}
                title="View changelog"
              >
                v{displayVersion}
              </Link>

              <Link
                to="/support"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
              >
                Support
              </Link>

              <Link
                to="/contact"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
              >
                Contact Us
              </Link>

              <Link
                to="/about"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
              >
                About Us
              </Link>

              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms-of-service"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
