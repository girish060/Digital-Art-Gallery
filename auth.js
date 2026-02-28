// Shared Authentication and Supabase Initialization
let sb = null;
let authStateListeners = [];

async function initSupabase() {
  if (sb) return sb;
  try {
    // Hardcoded for production (anon key is public)
    const supabaseUrl = 'https://crmsrahbjdlfjrmuvfoe.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybXNyYWhiamRsZmpybXV2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzEzMTYsImV4cCI6MjA4Nzg0NzMxNn0.Ln0Jv4-0bhDGooDQg35--PAvQrjFBhyWqj_Nr-qmQv8';
    sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
      
      // Listen for auth changes
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
    } else {
      const msg = "Supabase configuration is incomplete or uses placeholders. Please check your .env file.";
      console.error(msg);
      showNotification(msg, "error");
    }
  } catch (e) {
    console.error("Critical error initializing Supabase client:", e.message);
    if (e.message.includes('fetch')) {
      const troubleshooting = `
NETWORK ERROR: Could not reach the Supabase backend.
⚠️  Check the "ORANGE DOT" in your dashboard (Project Status).
1. The project might be PAUSED (Click 'Restore' in the dashboard).
2. The project might be INITIALIZING (Wait for the dot to turn green).
3. Your internet or firewall is blocking kphieayrtqejbhzgmrbk.supabase.co.`;
      showNotification(troubleshooting, "error");
    } else {
      showNotification(`Backend error: ${e.message}`, "error");
    }
  }
  return null;
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
  const userDisplay = document.getElementById('userDisplay');
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const userMenu = document.getElementById('userMenu');

  if (user) {
    if (userDisplay) userDisplay.textContent = user.name;
    if (loginLink) loginLink.classList.add('hidden');
    if (signupLink) signupLink.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
  } else {
    if (userDisplay) userDisplay.textContent = 'Sign In';
    if (loginLink) loginLink.classList.remove('hidden');
    if (signupLink) signupLink.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
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
});
