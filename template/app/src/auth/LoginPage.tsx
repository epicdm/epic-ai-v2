import { SignIn } from '@clerk/clerk-react'
import { AuthPageLayout } from './AuthPageLayout'

export function Login() {
  return (
    <AuthPageLayout>
      <SignIn
        routing="hash"
        afterSignInUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#111118',
            colorInputBackground: '#1a1a28',
            colorInputText: '#ffffff',
            colorText: '#ffffff',
            colorTextSecondary: '#a1a1aa',
            borderRadius: '10px',
            fontFamily: 'system-ui, sans-serif',
          },
          elements: {
            card: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0 },
            rootBox: { width: '100%' },
            formButtonPrimary: { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', border: 'none' },
            headerTitle: { color: '#ffffff' },
            headerSubtitle: { color: '#71717a' },
            socialButtonsBlockButton: { backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)' },
            formFieldLabel: { color: '#a1a1aa' },
            formFieldInput: { backgroundColor: '#1a1a28', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' },
            footerActionText: { color: '#71717a' },
            footerActionLink: { color: '#818cf8' },
            dividerText: { color: '#52525b' },
            dividerLine: { backgroundColor: 'rgba(255,255,255,0.08)' },
            identityPreviewText: { color: '#ffffff' },
            formResendCodeLink: { color: '#818cf8' },
          }
        }}
      />
    </AuthPageLayout>
  )
}

export { Login as LoginPage }
export default Login
