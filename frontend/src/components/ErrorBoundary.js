import { Component } from "react";

/**
 * Catches render errors anywhere below it so a single broken page never blanks the whole site.
 * Pass `resetKey` (e.g. the current pathname) so navigating away clears the error.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Page error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="pt-32 pb-24 px-6 min-h-[70vh] bg-[#FAFAF7] flex items-center justify-center" data-testid="error-boundary">
        <div className="max-w-lg text-center">
          <p className="accent-label justify-center mb-6"><span className="thin-rule" />Something went wrong</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] mb-5 tracking-tight">
            Sorry &mdash; this page didn&rsquo;t load.
          </h1>
          <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-10">
            Please try refreshing. If it keeps happening, get in touch and we&rsquo;ll help straight away.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Plain anchors: a full reload is the safest recovery from a render error */}
            <a href="/" className="btn-dark rounded-none py-4 px-8 inline-flex items-center justify-center font-body text-sm" data-testid="error-boundary-home">Back to home</a>
            <button type="button" onClick={() => window.location.reload()} className="border border-[#1A1A1A] rounded-none py-4 px-8 font-body text-sm text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors">
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
