// This page is intentionally empty - middleware handles the redirect
export default function HomePage() {
  console.log('❌ HOME PAGE RENDERED - THIS SHOULD NOT HAPPEN!')
  console.error('🚨 CRITICAL ERROR: Home page should never render!')
  
  // Force an error if this ever renders
  throw new Error('Home page should never render - middleware should redirect!')
  
  return null;
}
