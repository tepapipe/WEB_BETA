/* ============================================
   BestBuddies Pet Grooming - Main Utilities
   ============================================ */

// Initialize default data on first load
function initializeData() {
  // Initialize users array
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }

  // Initialize bookings array
  if (!localStorage.getItem('bookings')) {
    localStorage.setItem('bookings', JSON.stringify([]));
  }

  // Initialize packages array with default packages
  if (!localStorage.getItem('packages')) {
    const defaultPackages = [
      // Dog packages
      { id: 'dog-basic', name: 'Basic Grooming', type: 'dog', price: 45, duration: 60 },
      { id: 'dog-full', name: 'Full Grooming', type: 'dog', price: 75, duration: 90 },
      { id: 'dog-bath', name: 'Bath & Brush', type: 'dog', price: 35, duration: 45 },
      // Cat packages
      { id: 'cat-basic', name: 'Basic Grooming', type: 'cat', price: 50, duration: 60 },
      { id: 'cat-full', name: 'Full Grooming', type: 'cat', price: 80, duration: 90 },
      { id: 'cat-bath', name: 'Bath Only', type: 'cat', price: 40, duration: 45 }
    ];
    localStorage.setItem('packages', JSON.stringify(defaultPackages));
  }

  // Create default admin if not exists
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const adminExists = users.some(user => user.email === 'admin@gmail.com');
  
  if (!adminExists) {
    const defaultAdmin = {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin12345',
      role: 'admin',
      createdAt: Date.now()
    };
    users.push(defaultAdmin);
    localStorage.setItem('users', JSON.stringify(users));
  }
}

// Get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user in localStorage
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user
function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// Get all users
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

// Get all bookings
function getBookings() {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Save bookings
function saveBookings(bookings) {
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Get packages
function getPackages() {
  return JSON.parse(localStorage.getItem('packages') || '[]');
}

// Simple routing helper
function redirect(path) {
  window.location.href = path;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Format time for display
function formatTime(timeString) {
  return timeString;
}

// Generate unique ID
function generateId() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${dateStr}_${timeStr}`;
}

// Check if date is in the past
function isPastDate(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

// Get minimum date (today)
function getMinDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
});

