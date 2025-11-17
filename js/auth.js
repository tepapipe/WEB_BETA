/* ============================================
   BestBuddies Pet Grooming - Authentication
   ============================================ */

// Signup function
function signup(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role = document.querySelector('input[name="role"]:checked')?.value || 'customer';

  // Validation
  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Check if user already exists
  const users = getUsers();
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    alert('Email already registered. Please login instead.');
    return;
  }

  // Create new user
  const newUser = {
    id: 'user-' + Date.now(),
    name: name,
    email: email,
    password: password,
    role: role,
    createdAt: Date.now()
  };

  // Add user to storage
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Auto-login
  setCurrentUser(newUser);

  // Redirect based on role
  if (role === 'admin') {
    redirect('admin-dashboard.html');
  } else {
    redirect('customer-dashboard.html');
  }
}

// Login function
function login(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  // Find user
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Invalid email or password');
    return;
  }

  // Set current user
  setCurrentUser(user);

  // Redirect based on role
  if (user.role === 'admin') {
    redirect('admin-dashboard.html');
  } else {
    redirect('customer-dashboard.html');
  }
}

// Logout function
function logout() {
  clearCurrentUser();
  redirect('index.html');
}

// Require login - redirect if not logged in
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    redirect('login.html');
    return false;
  }
  return true;
}

// Require admin - redirect if not admin
function requireAdmin() {
  const user = getCurrentUser();
  if (!user) {
    redirect('login.html');
    return false;
  }
  if (user.role !== 'admin') {
    redirect('customer-dashboard.html');
    return false;
  }
  return true;
}

// Initialize login form
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', signup);
  }
});

