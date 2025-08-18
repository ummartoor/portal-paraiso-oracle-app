


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
    <View style={[styles.wrapper, {
      backgroundColor: '#FFF',
      borderWidth:1,
      borderColor: 'rgba(164, 73, 239, 0.15)',
      shadowColor: '#000',
    }]}>
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
                tintColor={isFocused ? colors.primary : colors.black}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isFocused ? colors.primary : colors.black,
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    height: 71,
    // borderRadius: 46,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
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
