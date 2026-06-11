import { redirect } from 'next/navigation';

export default function OperationsDashboardRedirect() {
  // The main overview page at /dashboard serves as the operations control center.
  // This redirect ensures users clicking the 'Operations -> Dashboard' sidebar link 
  // are seamlessly routed to the correct location without hitting a 404.
  redirect('/dashboard');
}
