import RegisterClient from './RegisterClient'

export const metadata = {
  title: 'Create Account',
  description: 'Join BookShare for free. Share your books and borrow from readers near you.',
  alternates: { canonical: 'https://bookshare.tech/auth/register' },
}

export default function RegisterPage() {
  return <RegisterClient />
}