import React, { createContext, useContext, useState, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  setIsTabBarVisible: (visible: boolean) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  isTabBarVisible: true,
  setIsTabBarVisible: () => {},
  handleScroll: () => {},
});

export const TabBarVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Only hide if scrolled past top threshold
    if (currentY > 60) {
      if (diff > 12 && isTabBarVisible) {
        setIsTabBarVisible(false); // Scrolling down -> hide navbar smoothly
      } else if (diff < -12 && !isTabBarVisible) {
        setIsTabBarVisible(true); // Scrolling up -> reveal navbar smoothly
      }
    } else if (currentY <= 20 && !isTabBarVisible) {
      setIsTabBarVisible(true);
    }

    lastScrollY.current = currentY;
  };

  return (
    <TabBarVisibilityContext.Provider value={{ isTabBarVisible, setIsTabBarVisible, handleScroll }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);
