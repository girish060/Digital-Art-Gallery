// Shared Authentication and Supabase Initialization
var sb = window.sb || null;
var authStateListeners = window.authStateListeners || [];

async function initSupabase() {
  if (sb) return sb;
  const supabaseUrl = 'https://crmsrahbjdlfjrmuvfoe.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybXNyYWhiamRsZmpybXV2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzEzMTYsImV4cCI6MjA4Nzg0NzMxNn0.Ln0Jv4-0bhDGooDQg35--PAvQrjFBhyWqj_Nr-qmQv8';
  sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  sb.auth.onAuthStateChange((event, session) => {
    console.log("Supabase Auth event:", event);
    const user = session ? {
      name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email,
      email: session.user.email,
      id: session.user.id
    } : null;
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    
    updateGlobalUI(user);
    // Notify listeners
    authStateListeners.forEach(callback => callback(user, session));
  });
  return sb;
}

function onAuthStateChange(callback) {
  authStateListeners.push(callback);
  // If we already have a user in localStorage, provide it immediately for UI responsiveness
  const cachedUser = JSON.parse(localStorage.getItem('currentUser'));
  if (cachedUser) {
    callback(cachedUser, null);
  }
}

async function checkUserSession() {
  try {
    const supabase = await initSupabase();
    if (!supabase) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (session) {
      const user = {
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email,
        email: session.user.email
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } else {
      localStorage.removeItem('currentUser');
      return null;
    }
  } catch (e) {
    console.error("Error checking session:", e);
    localStorage.removeItem('currentUser');
    return null;
  }
}

function updateGlobalUI(user) {
  console.log('updateGlobalUI called with user:', user);
  const userDisplay = document.getElementById('userDisplay');
  const loginLink = document.getElementById('loginLink');
  const userMenu = document.getElementById('userMenu');
  const userDropdown = document.getElementById('userDropdown');
  const userBtn = document.getElementById('userBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const signUpBtn = document.querySelector('a[href="signup.html"]');
  
  // Mobile elements
  const mobileUserDisplay = document.getElementById('mobileUserDisplay');
  const mobileUserBtn = document.getElementById('mobileUserBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  const mobileSignUpBtn = document.getElementById('mobileSignUpBtn');

  console.log('logoutBtn element:', logoutBtn);
  console.log('signUpBtn element:', signUpBtn);

  if (user) {
    console.log('User logged in, showing logout, hiding signup');
    if (userDisplay) userDisplay.textContent = user.name;
    if (loginLink) loginLink.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userDropdown) userDropdown.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (signUpBtn) signUpBtn.classList.add('hidden');
    if (userBtn) userBtn.onclick = null;
    
    // Mobile UI updates
    if (mobileUserDisplay) mobileUserDisplay.textContent = user.name;
    if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
    if (mobileSignUpBtn) mobileSignUpBtn.classList.add('hidden');
    if (mobileUserBtn) mobileUserBtn.onclick = null;
  } else {
    console.log('No user, hiding logout, showing signup');
    if (userDisplay) userDisplay.textContent = 'Sign In';
    if (loginLink) loginLink.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (userDropdown) userDropdown.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (signUpBtn) signUpBtn.classList.remove('hidden');
    if (userBtn) userBtn.onclick = () => window.location.href = 'login.html';
    
    // Mobile UI updates
    if (mobileUserDisplay) mobileUserDisplay.textContent = 'Sign In';
    if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
    if (mobileSignUpBtn) mobileSignUpBtn.classList.remove('hidden');
    if (mobileUserBtn) mobileUserBtn.onclick = () => window.location.href = 'login.html';
  }
}

async function handleLogout() {
  const supabase = await initSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Automatically check session and update UI on load
document.addEventListener('DOMContentLoaded', async () => {
  // Try to use cached user first for immediate UI update
  const cachedUser = JSON.parse(localStorage.getItem('currentUser'));
  updateGlobalUI(cachedUser);

  await initSupabase();
  const user = await checkUserSession();
  updateGlobalUI(user);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  
  // Add mobile logout button event listener
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});

async function signInWithGoogle() {
  const supabase = await initSupabase();
  if (!supabase) {
    alert('Supabase not initialized');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://digitalartgalleryhackathon.netlify.app/login'
      }
    });

    if (error) throw error;

    // OAuth will redirect automatically
  } catch (error) {
    console.error('Google signin error:', error);
    alert('Google signin failed: ' + error.message);
  }
}
