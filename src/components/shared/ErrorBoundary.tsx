import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getErrorHandler, ErrorCategory, ErrorSeverity } from '../../services/ErrorHandler';
import { colors, fonts } from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('React Error Boundary caught error:', error, errorInfo);

    // Report to error handler
    getErrorHandler().handleError(
      error,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      {
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      }
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.primaryBold,
    color: colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.primary,
    color: colors.text.neutral,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.green.black,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
  },
  errorDetails: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: '100%',
  },
  errorText: {
    color: '#FF3333', // Red color for errors
    fontSize: 12,
    fontFamily: fonts.primary,
  },
});

export default ErrorBoundary; 