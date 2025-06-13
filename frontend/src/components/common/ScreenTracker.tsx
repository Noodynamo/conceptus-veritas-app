import { useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * Screen Tracker component
 * Automatically tracks screen views when navigation changes
 * Include this at the root level of each screen component
 */
export const ScreenTracker: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { trackScreen } = useAnalytics();
  const routeNameRef = useRef<string | undefined>();

  useEffect(() => {
    // Track when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      const previousRouteName = routeNameRef.current;
      const currentRouteName = route.name;

      // Save the current route name for later comparison
      routeNameRef.current = currentRouteName;

      // Track screen view if route has changed
      if (previousRouteName !== currentRouteName) {
        trackScreen(currentRouteName, {
          previous_screen: previousRouteName,
          params: route.params || {},
        });
      }
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [navigation, route, trackScreen]);

  // This component doesn't render anything
  return null;
};
