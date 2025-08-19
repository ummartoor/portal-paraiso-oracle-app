import React from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../store/useThemeStore';
import GradientBox from '../components/GradientBox';

import HomeIcon from '../assets/icons/homeIcon.png';
import DivineIcon from '../assets/icons/divineIcon.png';
import LibraryIcon from '../assets/icons/libraryIcon.png';
import ProfileIcon from '../assets/icons/ProfileIcon.png';

const getIcon = (routeName: string): ImageSourcePropType => {
  switch (routeName) {
    case 'Home':
      return HomeIcon;
    case 'Divine':
      return DivineIcon;
    case 'Library':
      return LibraryIcon;
    case 'Profile':
      return ProfileIcon;
    default:
      return HomeIcon;
  }
};

export const MyBottomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;

  return (
    <GradientBox
      colors={[colors.black, colors.bgBox]} 
      style={styles.wrapper}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={isFocused ? styles.activeTab : styles.inactiveTab}>
              <Image
                source={getIcon(route.name)}
                style={styles.icon}
                tintColor={isFocused ? colors.primary : colors.white}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isFocused ? colors.primary : colors.white,
                  fontWeight: '500',
                  marginTop: 4,
                }}
              >
                {label as string}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </GradientBox>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 0,
    height: 71,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
