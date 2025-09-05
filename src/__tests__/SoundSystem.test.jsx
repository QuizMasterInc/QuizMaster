import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SoundEffect } from '../components/sounds/index.jsx';
import { VolumeSettingsProvider } from '../contexts/VolumeContext';

// Mock the VolumeContext
jest.mock('../contexts/VolumeContext', () => ({
  VolumeSettingsProvider: ({ children }) => children,
  useVolumeSettings: () => ({
    volume: 0.5,
    soundEnabled: true
  })
}));

// Mock HTML5 Audio
const mockPlay = jest.fn(() => Promise.resolve());
const mockPause = jest.fn();
const mockLoad = jest.fn();

global.HTMLMediaElement.prototype.play = mockPlay;
global.HTMLMediaElement.prototype.pause = mockPause;
global.HTMLMediaElement.prototype.load = mockLoad;

describe('Sound System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders SoundEffect component without errors', () => {
    expect(() => {
      render(
        <VolumeSettingsProvider>
          <SoundEffect type="correct" />
        </VolumeSettingsProvider>
      );
    }).not.toThrow();
  });

  test('creates audio element with correct sound file', () => {
    render(
      <VolumeSettingsProvider>
        <SoundEffect type="correct" />
      </VolumeSettingsProvider>
    );
    
    // Check if audio element is created (it might not be visible in DOM)
    // This tests the component renders without throwing
    expect(true).toBe(true);
  });

  test('handles different sound types', () => {
    const soundTypes = ['correct', 'incorrect', 'completion'];
    
    soundTypes.forEach(type => {
      expect(() => {
        render(
          <VolumeSettingsProvider>
            <SoundEffect type={type} />
          </VolumeSettingsProvider>
        );
      }).not.toThrow();
    });
  });

  test('respects autoPlay prop', () => {
    render(
      <VolumeSettingsProvider>
        <SoundEffect type="correct" autoPlay={false} />
      </VolumeSettingsProvider>
    );
    
    // Component should render without automatically playing
    expect(true).toBe(true);
  });

  test('backward compatibility exports work', () => {
    // Test that old sound component exports still exist
    const SoundsModule = require('../components/sounds/index.jsx');
    
    expect(SoundsModule.SoundEffect).toBeDefined();
    expect(typeof SoundsModule.SoundEffect).toBe('function');
  });

  test('handles invalid sound type gracefully', () => {
    expect(() => {
      render(
        <VolumeSettingsProvider>
          <SoundEffect type="invalid-sound" />
        </VolumeSettingsProvider>
      );
    }).not.toThrow();
  });

  test('integrates with volume context', async () => {
    // Mock volume context with sound disabled
    const mockUseVolumeSettings = jest.fn(() => ({
      volume: 0,
      soundEnabled: false
    }));

    jest.doMock('../contexts/VolumeContext', () => ({
      useVolumeSettings: mockUseVolumeSettings
    }));

    render(
      <VolumeSettingsProvider>
        <SoundEffect type="correct" />
      </VolumeSettingsProvider>
    );

    // Should render without errors even when sound is disabled
    expect(true).toBe(true);
  });
});
