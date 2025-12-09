import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Here you could also log to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { colors } = useThemeStore(state => state.theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>
          Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.white }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorText, { color: colors.primary }]}>
              {error.toString()}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onReset}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    padding: 12,
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    fontStyle: 'italic',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    textAlign: 'center',
  },
});

// Export as a functional component wrapper for easier use with hooks
export const ErrorBoundary: React.FC<Props> = props => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
