import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '@schoolapex/core';
import { LoadingSpinner } from '@schoolapex/components';
/**
 * OAuth2 Authentication Callback Page
 *
 * Handles the OAuth2 callback from Canvas and completes the authentication flow.
 * Displays loading state and error handling during the process.
 */
export function AuthCallback() {
    const { handleOAuthCallback, isLoading, error } = useAuth();
    const [status, setStatus] = useState('processing');
    const [errorMessage, setErrorMessage] = useState(null);
    useEffect(() => {
        const processCallback = async () => {
            try {
                // Extract code and state from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const error = urlParams.get('error');
                const errorDescription = urlParams.get('error_description');
                // Handle OAuth2 errors
                if (error) {
                    setStatus('error');
                    setErrorMessage(errorDescription || `OAuth2 error: ${error}`);
                    return;
                }
                // Validate required parameters
                if (!code || !state) {
                    setStatus('error');
                    setErrorMessage('Missing required OAuth2 parameters');
                    return;
                }
                // Process the callback
                await handleOAuthCallback(code, state);
                setStatus('success');
                // Redirect to main application after successful authentication
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
            catch (err) {
                console.error('OAuth2 callback processing failed:', err);
                setStatus('error');
                setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
            }
        };
        processCallback();
    }, [handleOAuthCallback]);
    if (status === 'processing' || isLoading) {
        return (_jsx("div", { className: "auth-callback", children: _jsx("div", { className: "auth-callback__container", children: _jsxs("div", { className: "auth-callback__content", children: [_jsx("div", { className: "auth-callback__logo", children: _jsxs("div", { className: "schoolapex-logo", children: [_jsx("div", { className: "schoolapex-logo__icon" }), _jsx("span", { className: "schoolapex-logo__text", children: "SchoolApex" })] }) }), _jsx("div", { className: "auth-callback__loading", children: _jsx(LoadingSpinner, { size: "lg", description: "Completing authentication..." }) }), _jsxs("div", { className: "auth-callback__message", children: [_jsx("h2", { children: "Authenticating with Canvas" }), _jsx("p", { children: "Please wait while we complete your authentication..." })] }), _jsxs("div", { className: "auth-callback__steps", children: [_jsxs("div", { className: "auth-step auth-step--complete", children: [_jsx("div", { className: "auth-step__icon", children: "\u2713" }), _jsx("span", { children: "Canvas authorization received" })] }), _jsxs("div", { className: "auth-step auth-step--active", children: [_jsx("div", { className: "auth-step__icon", children: "\u27F3" }), _jsx("span", { children: "Exchanging authorization code" })] }), _jsxs("div", { className: "auth-step", children: [_jsx("div", { className: "auth-step__icon", children: "\u25CB" }), _jsx("span", { children: "Retrieving user profile" })] }), _jsxs("div", { className: "auth-step", children: [_jsx("div", { className: "auth-step__icon", children: "\u25CB" }), _jsx("span", { children: "Redirecting to SchoolApex" })] })] })] }) }) }));
    }
    if (status === 'success') {
        return (_jsx("div", { className: "auth-callback", children: _jsx("div", { className: "auth-callback__container", children: _jsxs("div", { className: "auth-callback__content", children: [_jsx("div", { className: "auth-callback__logo", children: _jsxs("div", { className: "schoolapex-logo", children: [_jsx("div", { className: "schoolapex-logo__icon" }), _jsx("span", { className: "schoolapex-logo__text", children: "SchoolApex" })] }) }), _jsxs("div", { className: "auth-callback__success", children: [_jsx("div", { className: "auth-success__icon", children: "\u2713" }), _jsx("h2", { children: "Authentication Successful!" }), _jsx("p", { children: "Welcome to SchoolApex. You will be redirected shortly..." })] }), _jsxs("div", { className: "auth-callback__steps", children: [_jsxs("div", { className: "auth-step auth-step--complete", children: [_jsx("div", { className: "auth-step__icon", children: "\u2713" }), _jsx("span", { children: "Canvas authorization received" })] }), _jsxs("div", { className: "auth-step auth-step--complete", children: [_jsx("div", { className: "auth-step__icon", children: "\u2713" }), _jsx("span", { children: "Authorization code exchanged" })] }), _jsxs("div", { className: "auth-step auth-step--complete", children: [_jsx("div", { className: "auth-step__icon", children: "\u2713" }), _jsx("span", { children: "User profile retrieved" })] }), _jsxs("div", { className: "auth-step auth-step--active", children: [_jsx("div", { className: "auth-step__icon", children: "\u27F3" }), _jsx("span", { children: "Redirecting to SchoolApex" })] })] })] }) }) }));
    }
    if (status === 'error') {
        return (_jsx("div", { className: "auth-callback", children: _jsx("div", { className: "auth-callback__container", children: _jsxs("div", { className: "auth-callback__content", children: [_jsx("div", { className: "auth-callback__logo", children: _jsxs("div", { className: "schoolapex-logo", children: [_jsx("div", { className: "schoolapex-logo__icon" }), _jsx("span", { className: "schoolapex-logo__text", children: "SchoolApex" })] }) }), _jsxs("div", { className: "auth-callback__error", children: [_jsx("div", { className: "auth-error__icon", children: "\u2717" }), _jsx("h2", { children: "Authentication Failed" }), _jsx("p", { children: errorMessage || error || 'An unexpected error occurred during authentication.' })] }), _jsxs("div", { className: "auth-callback__actions", children: [_jsx("button", { className: "auth-callback__button auth-callback__button--primary", onClick: () => window.location.href = '/', children: "Return to SchoolApex" }), _jsx("button", { className: "auth-callback__button auth-callback__button--secondary", onClick: () => window.location.reload(), children: "Try Again" })] }), _jsxs("div", { className: "auth-callback__help", children: [_jsx("h3", { children: "Need Help?" }), _jsxs("ul", { children: [_jsx("li", { children: "Make sure you have access to the Canvas instance" }), _jsx("li", { children: "Check that your Canvas administrator has enabled OAuth2 applications" }), _jsx("li", { children: "Verify that SchoolApex is properly configured in Canvas" }), _jsx("li", { children: "Contact your system administrator if the problem persists" })] })] })] }) }) }));
    }
    return null;
}
// CSS styles for the auth callback page
const authCallbackStyles = `
.auth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #161616 0%, #262626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'IBM Plex Sans', sans-serif;
}

.auth-callback__container {
  max-width: 500px;
  width: 100%;
}

.auth-callback__content {
  background: #262626;
  border: 1px solid #393939;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.schoolapex-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.schoolapex-logo__icon {
  width: 40px;
  height: 40px;
  background: #0f62fe;
  border-radius: 8px;
}

.schoolapex-logo__text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f4f4f4;
}

.auth-callback__loading {
  margin: 2rem 0;
}

.auth-callback__message h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f4f4f4;
  margin: 0 0 0.5rem 0;
}

.auth-callback__message p {
  color: #c6c6c6;
  margin: 0 0 2rem 0;
}

.auth-callback__steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.auth-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.auth-step--complete {
  background: rgba(36, 161, 72, 0.1);
  color: #24a148;
}

.auth-step--active {
  background: rgba(15, 98, 254, 0.1);
  color: #0f62fe;
}

.auth-step__icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.auth-step--complete .auth-step__icon {
  background: #24a148;
  color: #ffffff;
}

.auth-step--active .auth-step__icon {
  background: #0f62fe;
  color: #ffffff;
  animation: spin 1s linear infinite;
}

.auth-callback__success {
  margin: 2rem 0;
}

.auth-success__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #24a148;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 1rem auto;
}

.auth-callback__error {
  margin: 2rem 0;
}

.auth-error__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #da1e28;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 1rem auto;
}

.auth-callback__actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  justify-content: center;
}

.auth-callback__button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-callback__button--primary {
  background: #0f62fe;
  color: #ffffff;
}

.auth-callback__button--primary:hover {
  background: #0353e9;
}

.auth-callback__button--secondary {
  background: transparent;
  color: #0f62fe;
  border: 1px solid #0f62fe;
}

.auth-callback__button--secondary:hover {
  background: rgba(15, 98, 254, 0.1);
}

.auth-callback__help {
  margin-top: 2rem;
  text-align: left;
}

.auth-callback__help h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f4f4f4;
  margin: 0 0 1rem 0;
}

.auth-callback__help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.auth-callback__help li {
  color: #c6c6c6;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.auth-callback__help li::before {
  content: '•';
  color: #0f62fe;
  position: absolute;
  left: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .auth-callback {
    padding: 1rem;
  }
  
  .auth-callback__content {
    padding: 2rem 1rem;
  }
  
  .auth-callback__actions {
    flex-direction: column;
  }
}
`;
// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = authCallbackStyles;
    document.head.appendChild(styleElement);
}
//# sourceMappingURL=AuthCallback.js.map