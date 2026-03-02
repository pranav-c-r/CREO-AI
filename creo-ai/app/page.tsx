import { redirect } from 'next/navigation';

/**
 * Root page — redirects to dashboard.
 * Users who aren't logged in will be redirected to /login from the dashboard page.
 */
export default function Home() {
  redirect('/dashboard');
}
