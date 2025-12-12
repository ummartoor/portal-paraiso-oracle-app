import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { Purchase } from '../store/useStripeStore';
import GradientBox from './GradientBox';

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

  // Debug logging
  if (__DEV__) {
    console.log('PurchaseDetailModal render:', {
      isVisible,
      hasPurchase: !!purchase,
      purchase: purchase ? JSON.stringify(purchase, null, 2) : null,
    });
  }

  if (!isVisible) return null;

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
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
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
    // Ensure value is always a string
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
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles(colors).overlay}>
        <TouchableOpacity
          style={styles(colors).backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles(colors).modalContainer}>
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
                {purchase?.package?.name || 'Purchase'}
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

          {/* Content */}
          <ScrollView
            style={styles(colors).content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles(colors).contentContainer}
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
                {purchase?.payment_status && (
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
                      {purchase.payment_status.toUpperCase()}
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
                      purchase?.transaction_type
                        ? purchase.transaction_type.replace('_', ' ').toUpperCase()
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
                      purchase?.payment_method
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
                    value={purchase?.package?.name || 'N/A'}
                  />
                  <DetailRow
                    label="Package Type"
                    value={
                      purchase?.package?.type
                        ? purchase.package.type.replace('_', ' ').toUpperCase()
                        : 'N/A'
                    }
                  />
                  <DetailRow
                    label="Tier"
                    value={
                      purchase?.package?.tier !== undefined &&
                      purchase?.package?.tier !== null
                        ? `Tier ${purchase.package.tier}`
                        : 'N/A'
                    }
                  />
                  {purchase?.credits_granted &&
                    purchase.credits_granted > 0 && (
                      <DetailRow
                        label="Credits Granted"
                        value={purchase.credits_granted.toString()}
                      />
                    )}
                </View>

                {/* Metadata Details */}
                {purchase.metadata && (
                  <View style={styles(colors).section}>
                    <Text style={styles(colors).sectionTitle}>
                      Additional Information
                    </Text>

                    {purchase.metadata?.platform && (
                      <DetailRow
                        label="Platform"
                        value={
                          typeof purchase.metadata.platform === 'string'
                            ? purchase.metadata.platform.toUpperCase()
                            : String(purchase.metadata.platform)
                        }
                      />
                    )}

                    {purchase.metadata.cancel_type && (
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

                    {purchase.metadata.canceled_at && (
                      <DetailRow
                        label="Canceled At"
                        value={
                          typeof purchase.metadata.canceled_at === 'string'
                            ? formatDate(purchase.metadata.canceled_at)
                            : 'N/A'
                        }
                      />
                    )}

                    {purchase.metadata.period_end && (
                      <DetailRow
                        label="Period End"
                        value={
                          typeof purchase.metadata.period_end === 'string'
                            ? formatDate(purchase.metadata.period_end)
                            : 'N/A'
                        }
                      />
                    )}

                    {purchase.metadata.reason && (
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
                {purchase?.receipt_url && (
                  <TouchableOpacity
                    onPress={handleReceiptPress}
                    style={styles(colors).receiptButton}
                    activeOpacity={0.8}
                  >
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={styles(colors).receiptButtonGradient}
                    >
                      <Text style={styles(colors).receiptButtonText}>
                        View Receipt
                      </Text>
                    </GradientBox>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles(colors).footer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles(colors).closeFooterButton}
              activeOpacity={0.8}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles(colors).closeFooterButtonGradient}
              >
                <Text style={styles(colors).closeFooterButtonText}>Close</Text>
              </GradientBox>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PurchaseDetailModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      backgroundColor: colors.bgBox,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
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
    },
    receiptButtonGradient: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.white,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeFooterButton: {
      borderRadius: 200,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.primary,
      marginBottom: 10,
    },
    closeFooterButtonGradient: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeFooterButtonText: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 14,
      color: colors.white,
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
