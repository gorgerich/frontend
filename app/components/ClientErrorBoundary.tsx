"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ClientErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[td-error-boundary] client error", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-white text-gray-900">
          <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-xl font-semibold">Что-то пошло не так</h1>
            <p className="mt-2 text-sm text-gray-600">Обновите страницу и попробуйте снова.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
