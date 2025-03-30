import * as React from "react";

export class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError?: (error: Error) => void;
    fallback?: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  public componentDidCatch(error: Error): void {
    this.props.onError?.(error);
    this.setState({ hasError: true });
  }

  public static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Error!</div>;
    }
    return this.props.children;
  }
}
