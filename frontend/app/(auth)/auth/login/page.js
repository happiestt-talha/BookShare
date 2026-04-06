import LoginClient from './LoginClient'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your BookShare account to borrow and share books with your community.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LoginClient />
}