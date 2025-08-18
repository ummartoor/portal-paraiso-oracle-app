import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'

import AuthNavigator from './AuthNavigator'
import { useAuthStore } from '../store/useAuthStore'
import AppNavigator from './AppNavigator';

const RouteNavigator = () => {

  // const [isloggedIn,setIsloggedIn]=useState<Boolean>(false)

    const { isLoggedIn, checkAuthStatus } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <Text>Loading...</Text>; 

  return (
  isLoggedIn ?  <AppNavigator /> : <AuthNavigator />

  )
}

export default RouteNavigator