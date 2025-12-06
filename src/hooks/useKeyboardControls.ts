import { useState, useEffect, useCallback } from 'react';

interface KeyboardControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
}

export const useKeyboardControls = () => {
  const [controls, setControls] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotateLeft: false,
    rotateRight: false
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w':
        setControls(prev => ({ ...prev, forward: true }));
        break;
      case 's':
        setControls(prev => ({ ...prev, backward: true }));
        break;
      case 'a':
        setControls(prev => ({ ...prev, left: true, rotateLeft: true }));
        break;
      case 'd':
        setControls(prev => ({ ...prev, right: true, rotateRight: true }));
        break;
      case 'arrowleft':
        setControls(prev => ({ ...prev, rotateLeft: true }));
        break;
      case 'arrowright':
        setControls(prev => ({ ...prev, rotateRight: true }));
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w':
        setControls(prev => ({ ...prev, forward: false }));
        break;
      case 's':
        setControls(prev => ({ ...prev, backward: false }));
        break;
      case 'a':
        setControls(prev => ({ ...prev, left: false, rotateLeft: false }));
        break;
      case 'd':
        setControls(prev => ({ ...prev, right: false, rotateRight: false }));
        break;
      case 'arrowleft':
        setControls(prev => ({ ...prev, rotateLeft: false }));
        break;
      case 'arrowright':
        setControls(prev => ({ ...prev, rotateRight: false }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return controls;
};