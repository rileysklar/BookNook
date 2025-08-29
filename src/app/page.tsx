import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to Clerk authentication route
  redirect('/sign-in');
}
