import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Platform,
  PanResponder,
  Dimensions,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { Purchase } from '../store/useStripeStore';
import GradientBox from './GradientBox';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_MODAL_HEIGHT = 400;
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.95;
const DEFAULT_MODAL_HEIGHT = 500;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 100;
const DRAG_HANDLE_HEIGHT = 40;

interface PurchaseDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  isVisible,
  onClose,
  purchase,
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

  // PanResponder for drag area (header + drag handle)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        lastPanY.current = modalHeight;
      },
      onPanResponderMove: (_, g) => {
        const newH = lastPanY.current - g.dy;
        const clamped = Math.max(
          MIN_MODAL_HEIGHT,
          Math.min(MAX_MODAL_HEIGHT, newH),
        );
        setModalHeight(clamped);
      },
      onPanResponderRelease: (_, g) => {
        const newH = lastPanY.current - g.dy;
        const clamped = Math.max(
          MIN_MODAL_HEIGHT,
          Math.min(MAX_MODAL_HEIGHT, newH),
        );
        setModalHeight(clamped);
        lastPanY.current = clamped;
      },
    }),
  ).current;

  // Early return after all hooks
  if (!isVisible) return null;

  // Debug: Log purchase data to help troubleshoot
  if (__DEV__ && isVisible) {
    console.log('PurchaseDetailModal - Purchase data:', {
      hasPurchase: !!purchase,
      purchaseId: purchase?.id,
      packageName: purchase?.package?.name,
      amount: purchase?.amount,
      currency: purchase?.currency,
      paymentStatus: purchase?.payment_status,
      fullPurchase: purchase ? JSON.stringify(purchase, null, 2) : null,
    });
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'N/A';
    }
    if (!currency || typeof currency !== 'string') {
      return 'N/A';
    }
    return `${(amount / 100).toFixed(2)} ${String(currency).toUpperCase()}`;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'completed') return '#4CAF50';
    if (lowerStatus === 'pending') return '#FFC107';
    return '#F44336';
  };

  const handleReceiptPress = () => {
    if (purchase?.receipt_url) {
      Linking.openURL(purchase.receipt_url).catch(err =>
        console.error('Failed to open receipt:', err),
      );
    }
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
    // Ensure value is always a string and handle all edge cases
    let displayValue = 'N/A';
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        displayValue = value;
      } else if (typeof value === 'number') {
        displayValue = String(value);
      } else if (typeof value === 'object') {
        // Handle objects/arrays by stringifying them
        try {
          displayValue = JSON.stringify(value);
        } catch {
          displayValue = 'N/A';
        }
      } else {
        displayValue = String(value);
      }
    }

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
      swipeDirection={['down']}
      swipeThreshold={100}
      style={styles(colors).modal}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={true}
      propagateSwipe={true}
    >
      <Animated.View
        style={[
          styles(colors).modalContainer,
          {
            height: modalHeight,
            maxHeight: MAX_MODAL_HEIGHT,
          },
        ]}
      >
        {/* Drag Area (header + handle) */}
        <View {...panResponder.panHandlers}>
          <View style={styles(colors).dragHandleContainer}>
            <View style={styles(colors).dragHandle} />
          </View>

          {/* Header */}
          <View style={styles(colors).header}>
            <View style={styles(colors).headerIconContainer}>
              <Image
                source={require('../assets/icons/AquariusIcon.png')}
                style={[
                  styles(colors).headerIcon,
                  { tintColor: colors.primary },
                ]}
                resizeMode="contain"
              />
            </View>
            <View style={styles(colors).headerTextContainer}>
              <Text style={styles(colors).headerTitle}>
                {purchase?.package?.name
                  ? String(purchase.package.name)
                  : 'Purchase'}
              </Text>
              <Text style={styles(colors).headerSubtitle}>
                Purchase Details
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles(colors).closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles(colors).closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <View style={{ flex: 1 }}>
          <ScrollView
            bounces={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles(colors).contentContainer}
            onScrollBeginDrag={e => {
              if (e.nativeEvent.contentOffset.y <= 0) {
                // let the modal handle the gesture when at top
              }
            }}
          >
            {!purchase ? (
              <View style={styles(colors).emptyState}>
                <Text style={styles(colors).emptyStateText}>
                  No purchase data available
                </Text>
              </View>
            ) : (
              <>
                {/* Status Badge */}
                {purchase?.payment_status !== undefined &&
                  purchase?.payment_status !== null &&
                  typeof purchase.payment_status === 'string' && (
                    <View
                      style={[
                        styles(colors).statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(purchase.payment_status) + '30',
                          borderColor: getStatusColor(purchase.payment_status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles(colors).statusText,
                          { color: getStatusColor(purchase.payment_status) },
                        ]}
                      >
                        {String(purchase.payment_status).toUpperCase()}
                      </Text>
                    </View>
                  )}

                {/* Transaction Details */}
                <View style={styles(colors).section}>
                  <Text style={styles(colors).sectionTitle}>
                    Transaction Details
                  </Text>

                  <DetailRow
                    label="Transaction ID"
                    value={purchase?.id || 'N/A'}
                  />
                  <DetailRow
                    label="Transaction Type"
                    value={
                      purchase?.transaction_type &&
                      typeof purchase.transaction_type === 'string'
                        ? purchase.transaction_type
                            .replace('_', ' ')
                            .toUpperCase()
                        : 'N/A'
                    }
                  />
                  <DetailRow
                    label="Amount"
                    value={
                      purchase?.amount && purchase?.currency
                        ? formatCurrency(purchase.amount, purchase.currency)
                        : 'N/A'
                    }
                    valueColor={colors.primary}
                  />
                  <DetailRow
                    label="Payment Method"
                    value={
                      purchase?.payment_method &&
                      typeof purchase.payment_method === 'string'
                        ? purchase.payment_method.toUpperCase()
                        : 'N/A'
                    }
                  />
                  <DetailRow
                    label="Purchase Date"
                    value={
                      purchase?.purchase_date
                        ? formatDate(purchase.purchase_date)
                        : 'N/A'
                    }
                  />
                </View>

                {/* Package Details */}
                <View style={styles(colors).section}>
                  <Text style={styles(colors).sectionTitle}>
                    Package Details
                  </Text>

                  <DetailRow
                    label="Package Name"
                    value={
                      purchase?.package?.name
                        ? String(purchase.package.name)
                        : 'N/A'
                    }
                  />
                  <DetailRow
                    label="Package Type"
                    value={
                      purchase?.package?.type &&
                      typeof purchase.package.type === 'string'
                        ? purchase.package.type.replace('_', ' ').toUpperCase()
                        : 'N/A'
                    }
                  />
                  <DetailRow
                    label="Tier"
                    value={
                      purchase?.package?.tier !== undefined &&
                      purchase?.package?.tier !== null
                        ? `Tier ${String(purchase.package.tier)}`
                        : 'N/A'
                    }
                  />
                  {purchase?.credits_granted &&
                    purchase.credits_granted > 0 && (
                      <DetailRow
                        label="Credits Granted"
                        value={String(purchase.credits_granted)}
                      />
                    )}
                </View>

                {/* Metadata Details */}
                {purchase.metadata &&
                  typeof purchase.metadata === 'object' &&
                  purchase.metadata !== null && (
                    <View style={styles(colors).section}>
                      <Text style={styles(colors).sectionTitle}>
                        Additional Information
                      </Text>

                      {purchase.metadata.platform !== undefined &&
                        purchase.metadata.platform !== null &&
                        (typeof purchase.metadata.platform === 'string' ||
                          typeof purchase.metadata.platform === 'number') && (
                          <DetailRow
                            label="Platform"
                            value={
                              typeof purchase.metadata.platform === 'string'
                                ? purchase.metadata.platform.toUpperCase()
                                : String(purchase.metadata.platform)
                            }
                          />
                        )}

                      {purchase.metadata.cancel_type !== undefined &&
                        purchase.metadata.cancel_type !== null &&
                        (typeof purchase.metadata.cancel_type === 'string' ||
                          typeof purchase.metadata.cancel_type ===
                            'number') && (
                          <DetailRow
                            label="Cancellation Type"
                            value={
                              typeof purchase.metadata.cancel_type === 'string'
                                ? purchase.metadata.cancel_type
                                    .replace('_', ' ')
                                    .toUpperCase()
                                : String(purchase.metadata.cancel_type)
                            }
                          />
                        )}

                      {purchase.metadata.canceled_at !== undefined &&
                        purchase.metadata.canceled_at !== null &&
                        typeof purchase.metadata.canceled_at === 'string' && (
                          <DetailRow
                            label="Canceled At"
                            value={formatDate(purchase.metadata.canceled_at)}
                          />
                        )}

                      {purchase.metadata.period_end !== undefined &&
                        purchase.metadata.period_end !== null &&
                        typeof purchase.metadata.period_end === 'string' && (
                          <DetailRow
                            label="Period End"
                            value={formatDate(purchase.metadata.period_end)}
                          />
                        )}

                      {purchase.metadata.reason !== undefined &&
                        purchase.metadata.reason !== null &&
                        (typeof purchase.metadata.reason === 'string' ||
                          typeof purchase.metadata.reason === 'number') && (
                          <DetailRow
                            label="Reason"
                            value={
                              typeof purchase.metadata.reason === 'string'
                                ? purchase.metadata.reason
                                    .replace('_', ' ')
                                    .toUpperCase()
                                : String(purchase.metadata.reason)
                            }
                          />
                        )}
                    </View>
                  )}

                {/* Receipt Link */}
                {purchase?.receipt_url !== undefined &&
                  purchase?.receipt_url !== null &&
                  purchase?.receipt_url !== '' && (
                    <TouchableOpacity
                      onPress={handleReceiptPress}
                      style={styles(colors).receiptButton}
                      activeOpacity={0.8}
                    >
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={styles(colors).receiptButtonGradient}
                      >
                        <Text
                          style={styles(colors).receiptButtonText}
                          numberOfLines={1}
                        >
                          View Receipt
                        </Text>
                      </GradientBox>
                    </TouchableOpacity>
                  )}
              </>
            )}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles(colors).footer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles(colors).closeFooterButton}
            activeOpacity={0.8}
          >
            <Text
              style={styles(colors).closeFooterButtonText}
              numberOfLines={1}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default PurchaseDetailModal;

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
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
      overflow: 'hidden',
      flexDirection: 'column',
    },
    dragHandleContainer: {
      alignItems: 'center',
      paddingTop: 8,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      marginBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
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
      paddingTop: 12,
      paddingBottom: 40,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 24,
    },
    statusText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 12,
      letterSpacing: 0.5,
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
    receiptButton: {
      marginTop: 8,
      marginBottom: 20,
      borderRadius: 200,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.primary,
      minHeight: 48,
    },
    receiptButtonGradient: {
      width: '100%',
      height: '100%',
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    receiptButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.white || '#FFFFFF',
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
      backgroundColor: 'transparent',
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeFooterButton: {
      borderRadius: 200,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      minHeight: 48,
    },
    closeFooterButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      opacity: 0.7,
    },
  });
