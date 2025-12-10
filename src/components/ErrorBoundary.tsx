import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { errorLogger, parseError, ErrorSeverity } from '../utils/errorHandler';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  private resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error-${Date.now()}-${Math.random()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    const appError = parseError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
    appError.severity = ErrorSeverity.CRITICAL;
    errorLogger.log(appError);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Auto-reset after 30 seconds (optional - can be disabled)
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = setTimeout(() => {
      this.handleReset();
    }, 30000);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;

    // Reset error boundary when resetKeys change
    if (resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index],
      );
      if (hasResetKeyChanged && this.state.hasError) {
        this.handleReset();
      }
    }

    // Reset on any prop change if enabled
    if (resetOnPropsChange && this.state.hasError) {
      const propsChanged = Object.keys(this.props).some(
        key =>
          key !== 'children' &&
          this.props[key as keyof Props] !== prevProps[key as keyof Props],
      );
      if (propsChanged) {
        this.handleReset();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
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
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.white }]}>
            {t('errors.error_boundary_title')}
          </Text>
          <Text style={[styles.message, { color: colors.white }]}>
            {t('errors.error_boundary_message')}
          </Text>

          {__DEV__ && error && (
            <View
              style={[styles.errorDetails, { backgroundColor: colors.bgBox }]}
            >
              <Text style={[styles.errorTitle, { color: colors.primary }]}>
                Error Details (Dev Only):
              </Text>
              <Text style={[styles.errorText, { color: colors.white }]}>
                {error.toString()}
              </Text>
              {error.stack && (
                <ScrollView style={styles.stackTrace}>
                  <Text style={[styles.stackText, { color: colors.white }]}>
                    {error.stack}
                  </Text>
                </ScrollView>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onReset}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>
                {t('errors.error_boundary_try_again')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  errorDetails: {
    width: '100%',
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 14,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    marginBottom: 8,
  },
  stackTrace: {
    maxHeight: 200,
    marginTop: 8,
  },
  stackText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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
