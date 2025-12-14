import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  PanResponder,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_MODAL_HEIGHT = 400;
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.95;
const DEFAULT_MODAL_HEIGHT = 500;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 100;
const DRAG_HANDLE_HEIGHT = 40;
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { StripePackage, VipSubscription } from '../store/useStripeStore';
import GradientBox from './GradientBox';

interface SubscriptionConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPackage: StripePackage | null;
  currentSubscription: VipSubscription | null;
  packages?: StripePackage[] | null; // Add packages list to compare sort_order
  isProcessing?: boolean;
}

const SubscriptionConfirmationModal: React.FC<
  SubscriptionConfirmationModalProps
> = ({
  isVisible,
  onClose,
  onConfirm,
  selectedPackage,
  currentSubscription,
  packages,
  isProcessing = false,
}) => {
  const { colors } = useThemeStore(state => state.theme);
  const [modalHeight, setModalHeight] = useState(DEFAULT_MODAL_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const lastPanY = useRef(0);

  // Reset height when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setModalHeight(DEFAULT_MODAL_HEIGHT);
      lastPanY.current = DEFAULT_MODAL_HEIGHT;
    }
  }, [isVisible]);

  // PanResponder for drag handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical movements with sufficient movement
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        lastPanY.current = modalHeight;
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new height based on drag direction
        // Dragging down (positive dy) decreases height
        // Dragging up (negative dy) increases height
        const newHeight = lastPanY.current - gestureState.dy;
        const clampedHeight = Math.max(
          MIN_MODAL_HEIGHT,
          Math.min(MAX_MODAL_HEIGHT, newHeight),
        );
        setModalHeight(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = lastPanY.current - gestureState.dy;
        const clampedHeight = Math.max(
          MIN_MODAL_HEIGHT,
          Math.min(MAX_MODAL_HEIGHT, newHeight),
        );
        setModalHeight(clampedHeight);
        lastPanY.current = clampedHeight;
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
      // Allow termination so ScrollView can receive touches
      onPanResponderTerminationRequest: () => true,
    }),
  ).current;

  // Early return after all hooks
  if (!isVisible || !selectedPackage) return null;

  const defaultPrice = selectedPackage.prices?.find(p => p.is_default);

  // Debug log to help troubleshoot
  if (__DEV__) {
    console.log('SubscriptionConfirmationModal render:', {
      isVisible,
      hasSelectedPackage: !!selectedPackage,
      hasCurrentSubscription: !!currentSubscription,
      packageName: selectedPackage?.display_name || selectedPackage?.name,
      hasDefaultPrice: !!defaultPrice,
      hasFeatures: !!selectedPackage?.feature_list_for_ui?.length,
    });
  }
  const isPlanChange =
    !!currentSubscription &&
    currentSubscription.packageId !== selectedPackage.id;

  // Use sort_order to determine upgrade/downgrade (lower sort_order = better package)
  // Find current package from packages list to compare sort_order
  const currentPackage = packages?.find(
    p => p.id === currentSubscription?.packageId,
  );
  const currentPackageSortOrder = currentPackage?.sort_order ?? 999;
  const selectedPackageSortOrder = selectedPackage.sort_order ?? 999;
  // Lower sort_order = better package (yearly usually has sort_order 1, monthly 2, etc.)
  const isUpgrade =
    isPlanChange && selectedPackageSortOrder < currentPackageSortOrder;
  const isDowngrade =
    isPlanChange && selectedPackageSortOrder > currentPackageSortOrder;

  // Format currency for subscription amounts (in cents)
  const formatSubscriptionCurrency = (
    amount: number,
    currency: string,
  ): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'N/A';
    }
    if (!currency || typeof currency !== 'string') {
      return 'N/A';
    }
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const formatPackageCurrency = (amount: number, currency: string): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'N/A';
    }
    if (!currency || typeof currency !== 'string') {
      return 'N/A';
    }
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const DetailRow = ({
    label,
    value,
    valueColor,
  }: {
    label: string;
    value: string | number | null | undefined;
    valueColor?: string;
  }) => {
    const displayValue =
      value === null || value === undefined
        ? 'N/A'
        : typeof value === 'string'
        ? value
        : String(value);

    return (
      <View style={styles(colors).detailRow}>
        <Text style={styles(colors).detailLabel}>{label}</Text>
        <Text
          style={[
            styles(colors).detailValue,
            valueColor && { color: valueColor },
          ]}
        >
          {displayValue}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={isDragging ? undefined : onClose}
      swipeDirection={isDragging ? [] : ['down']}
      swipeThreshold={200}
      style={styles(colors).modal}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={true}
      propagateSwipe={true}
    >
      <View
        style={[
          styles(colors).modalContainer,
          {
            height: modalHeight,
            maxHeight: MAX_MODAL_HEIGHT,
          },
        ]}
      >
        {/* Drag Handle */}
        <View
          style={styles(colors).dragHandleContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles(colors).dragHandle} />
        </View>

        {/* Header */}
        <View style={styles(colors).header}>
          <View style={styles(colors).headerIconContainer}>
            <Image
              source={require('../assets/icons/AquariusIcon.png')}
              style={[styles(colors).headerIcon, { tintColor: colors.primary }]}
              resizeMode="contain"
            />
          </View>
          <View style={styles(colors).headerTextContainer}>
            <Text style={styles(colors).headerTitle}>
              {isPlanChange
                ? isUpgrade
                  ? 'Upgrade Subscription'
                  : 'Downgrade Subscription'
                : 'Confirm Subscription'}
            </Text>
            <Text style={styles(colors).headerSubtitle}>
              {isPlanChange
                ? 'Please review the changes'
                : 'Review your selection'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles(colors).closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isProcessing}
          >
            <Text style={styles(colors).closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View
          style={[
            styles(colors).contentWrapper,
            {
              height:
                modalHeight -
                DRAG_HANDLE_HEIGHT -
                HEADER_HEIGHT -
                FOOTER_HEIGHT -
                (Platform.OS === 'ios' ? 34 : 20),
            },
          ]}
        >
          <ScrollView
            style={styles(colors).content}
            contentContainerStyle={styles(colors).contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical={false}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            directionalLockEnabled={true}
          >
            {/* Selected Plan */}
            <View style={styles(colors).section}>
              <Text style={styles(colors).sectionTitle}>
                {isPlanChange ? 'New Plan' : 'Selected Plan'}
              </Text>
              <DetailRow
                label="Package Name"
                value={
                  selectedPackage.display_name || selectedPackage.name || 'N/A'
                }
              />
              <DetailRow
                label="Package Type"
                value={
                  selectedPackage.type
                    ? selectedPackage.type.replace('_', ' ').toUpperCase()
                    : 'N/A'
                }
              />
              <DetailRow
                label="Tier"
                value={
                  selectedPackage.tier !== undefined &&
                  selectedPackage.tier !== null
                    ? `Tier ${selectedPackage.tier}`
                    : 'N/A'
                }
              />
              {defaultPrice ? (
                <>
                  <DetailRow
                    label="Amount"
                    value={formatPackageCurrency(
                      defaultPrice.amount,
                      defaultPrice.currency,
                    )}
                    valueColor={colors.primary}
                  />
                  <DetailRow
                    label="Billing Interval"
                    value={defaultPrice.interval || 'N/A'}
                  />
                </>
              ) : (
                <DetailRow
                  label="Price"
                  value={
                    selectedPackage.prices && selectedPackage.prices.length > 0
                      ? 'Please select a price'
                      : 'Not available'
                  }
                />
              )}
            </View>

            {/* Features Preview */}
            {selectedPackage.feature_list_for_ui &&
            selectedPackage.feature_list_for_ui.length > 0 ? (
              <View style={styles(colors).section}>
                <Text style={styles(colors).sectionTitle}>Features</Text>
                <View style={styles(colors).featuresContainer}>
                  {selectedPackage.feature_list_for_ui
                    .slice(0, 5)
                    .map((feature, index) => (
                      <View key={index} style={styles(colors).featureItem}>
                        <Text style={styles(colors).featureBullet}>•</Text>
                        <Text style={styles(colors).featureText}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  {selectedPackage.feature_list_for_ui.length > 5 && (
                    <Text style={styles(colors).moreFeaturesText}>
                      +{selectedPackage.feature_list_for_ui.length - 5} more
                      features
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles(colors).section}>
                <Text style={styles(colors).sectionTitle}>Features</Text>
                <Text style={[styles(colors).featureText, { opacity: 0.6 }]}>
                  No features listed
                </Text>
              </View>
            )}

            {/* Important Note */}
            {isPlanChange && (
              <View style={styles(colors).noteContainer}>
                <Text style={styles(colors).noteText}>
                  {isUpgrade
                    ? 'Your subscription will be upgraded immediately. The new plan will take effect right away.'
                    : 'Your subscription will be downgraded at the end of your current billing period. You will continue to have access to your current plan features until then.'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles(colors).footer}>
          <View style={styles(colors).buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles(colors).cancelButton}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles(colors).cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={styles(colors).confirmButton}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text
                  style={styles(colors).confirmButtonText}
                  numberOfLines={1}
                >
                  {isPlanChange
                    ? isUpgrade
                      ? 'Upgrade Now'
                      : 'Downgrade'
                    : 'Confirm & Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionConfirmationModal;

const styles = (colors: any) =>
  StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContainer: {
      backgroundColor: colors.bgBox,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: MIN_MODAL_HEIGHT,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
      overflow: 'hidden',
      flexDirection: 'column',
    },
    dragHandleContainer: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(217, 182, 153, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerIcon: {
      width: 28,
      height: 28,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.white,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      opacity: 0.7,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.white,
      fontWeight: 'bold',
    },
    contentWrapper: {
      minHeight: 0,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      flexGrow: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 18,
      color: colors.primary,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    detailLabel: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      opacity: 0.7,
      flex: 1,
    },
    detailValue: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.white,
      flex: 1,
      textAlign: 'right',
    },
    featuresContainer: {
      gap: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 4,
    },
    featureBullet: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.primary,
      marginRight: 8,
    },
    featureText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      opacity: 0.9,
      flex: 1,
    },
    moreFeaturesText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 12,
      color: colors.primary,
      opacity: 0.8,
      marginTop: 4,
      fontStyle: 'italic',
    },
    noteContainer: {
      backgroundColor: 'rgba(217, 182, 153, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary + '40',
      marginTop: 8,
    },
    noteText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 13,
      color: colors.white,
      opacity: 0.9,
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 200,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.white,
      opacity: 0.8,
    },
    confirmButton: {
      flex: 1,
      borderRadius: 200,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    confirmButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
  });
