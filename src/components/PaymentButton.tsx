import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import GradientBox from './GradientBox';
import { usePaymentProcessor } from '../utils/paymentHelper';
import { StripePackage } from '../store/useStripeStore';
import { useStripe } from '@stripe/stripe-react-native';

interface PaymentButtonProps {
  package: StripePackage;
  onSuccess?: (subscription: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  buttonText?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  package: pkg,
  onSuccess,
  onError,
  disabled = false,
  style,
  textStyle,
  buttonText = 'Start Now',
}) => {
  const { colors } = useThemeStore(s => s.theme);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { processPayment, isLoading } = usePaymentProcessor({
    initPaymentSheet,
    presentPaymentSheet,
  });

  const handlePayment = async () => {
    const defaultPrice = pkg.prices.find(p => p.is_default);
    if (!defaultPrice) {
      onError?.('This package is not configured correctly.');
      return;
    }

    const result = await processPayment(
      pkg.id,
      defaultPrice.stripe_price_id,
      onSuccess,
      onError,
    );

    if (result.success) {
      onSuccess?.(result.subscription);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePayment}
      disabled={disabled || isLoading}
    >
      <GradientBox
        colors={[colors.black, colors.bgBox]}
        style={styles.gradientWrapper}
      >
        {isLoading ? (
          <ActivityIndicator color="#D9B699" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
        )}
      </GradientBox>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderColor: '#D9B699',
    borderWidth: 1,
  },
  gradientWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Aeonik-Regular',
  },
});

export default PaymentButton;
