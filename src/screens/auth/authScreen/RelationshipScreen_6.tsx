import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

//  Define type for relationship options
type RelationshipOption = {
  key: string;
  label: string;
  icon: any;
};

const RelationshipScreen_6: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const relationshipOptions: RelationshipOption[] = [
    { key: 'single', label: 'Single', icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'relationship', label: 'In a relationship', icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'married', label: 'Married', icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'engaged', label: 'Engaged', icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'complicated', label: 'Complicated', icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'divorced', label: 'Divorced', icon: require('../../../assets/icons/goalIcon1.png') },
  ];

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header with back arrow + progress bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white }]}>
          Your Relationship Status
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
          Select your relationship status?
        </Text>

        {/* Relationship Status Options */}
        <View style={styles.statusSection}>
          {relationshipOptions
            .reduce((rows: RelationshipOption[][], option, index) => {
              if (index % 2 === 0) {
                rows.push([option]);
              } else {
                rows[rows.length - 1].push(option);
              }
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <View key={rowIndex} style={styles.statusRow}>
                {row.map((item: RelationshipOption) => {
                  const isSelected = selectedStatus === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.statusBox,
                        {
                          borderColor: isSelected ? colors.primary : colors.white,
                          borderWidth: isSelected ? 1.5 : 1,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedStatus(item.key)}
                    >
                      <View style={styles.iconWrapper}>
                        <Image
                          source={item.icon}
                          style={{
                            width: 21,
                            height: 21,
                  
                          }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        style={[
                          styles.statusLabel,
                          {
                            color: isSelected ? colors.primary : '#fff',
                            fontFamily: isSelected
                              ? Fonts.aeonikBold
                              : Fonts.aeonikRegular,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {row.length === 1 && (
                  <View style={[styles.statusBox, { opacity: 0 }]} />
                )}
            
              </View>
            ))}
        </View>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
            style={{ width: '100%' }}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.nextBtn,
                { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              <Text style={styles.nextText}>Next</Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default RelationshipScreen_6;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50',
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  statusSection: {
    flex: 1,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusBox: {
    flex: 1,
    height: 101,
    borderRadius: 16,
backgroundColor:'#4A3F50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2A33',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    marginBottom: 40,
  },
  nextBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});
