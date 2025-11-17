/* ============================================
   BestBuddies Pet Grooming - Customer Dashboard
   ============================================ */

// Load customer dashboard
function loadCustomerDashboard() {
  // Check if user is logged in
  if (!requireLogin()) {
    return;
  }

  const user = getCurrentUser();
  
  // Update welcome message
  const welcomeElement = document.getElementById('welcomeName');
  if (welcomeElement) {
    welcomeElement.textContent = user.name;
  }

  // Load quick stats
  loadQuickStats();

  // Load user bookings
  loadUserBookings();
}

// Load quick stats
function loadQuickStats() {
  const bookings = getUserBookings();
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const upcomingBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const bookingDate = new Date(b.date + ' ' + b.time);
    return bookingDate >= new Date();
  }).length;

  const statsContainer = document.getElementById('quickStats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-card" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
        <div class="stat-value" style="font-size: 2rem;">${totalBookings}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
        <div class="stat-value" style="font-size: 2rem; color: #f59e0b;">${pendingBookings}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
        <div class="stat-value" style="font-size: 2rem; color: #10b981;">${confirmedBookings}</div>
        <div class="stat-label">Confirmed</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1));">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔜</div>
        <div class="stat-value" style="font-size: 2rem; color: var(--purple);">${upcomingBookings}</div>
        <div class="stat-label">Upcoming</div>
      </div>
    `;
  }
}

// Get bookings for current user
function getUserBookings() {
  const user = getCurrentUser();
  if (!user) return [];

  const allBookings = getBookings();
  return allBookings
    .filter(booking => booking.userId === user.id)
    .sort((a, b) => {
      // Sort by date and time, newest first
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA;
    });
}

// Load and render user bookings
function loadUserBookings() {
  const bookings = getUserBookings();
  const container = document.getElementById('bookingsContainer');
  
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 5rem; margin-bottom: 1rem; opacity: 0.5;">🐾</div>
        <h3 style="margin-bottom: 1rem; color: var(--gray-700);">No Bookings Yet</h3>
        <p style="color: var(--gray-600); margin-bottom: 2rem;">
          Start booking your pet's grooming appointment today!
        </p>
        <a href="booking.html" class="btn btn-primary btn-lg">Book Your First Appointment</a>
      </div>
    `;
    return;
  }

  // Render bookings as cards
  container.innerHTML = bookings.map(booking => {
    const statusClass = booking.status === 'confirmed' 
      ? 'badge-confirmed' 
      : booking.status === 'cancelled' 
      ? 'badge-cancelled' 
      : 'badge-pending';

    const petEmoji = booking.petType === 'dog' ? '🐕' : '🐈';
    const isUpcoming = booking.status !== 'cancelled' && new Date(booking.date + ' ' + booking.time) >= new Date();
    const isPast = new Date(booking.date + ' ' + booking.time) < new Date();

    return `
      <div class="card" style="margin-bottom: 1.5rem; transition: all 0.3s ease;">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 1.5rem; align-items: center;">
          <div style="font-size: 3rem; text-align: center;">
            ${petEmoji}
          </div>
          <div style="flex: 1;">
            <h3 style="margin-bottom: 0.5rem; color: var(--gray-900);">
              ${escapeHtml(booking.petName)}
            </h3>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">
              <strong>Package:</strong> ${escapeHtml(booking.packageName)}
            </p>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">
              <strong>Date:</strong> ${formatDate(booking.date)} at ${formatTime(booking.time)}
            </p>
            <p style="color: var(--gray-500); font-size: 0.875rem;">
              ${isUpcoming ? '🔜 Upcoming' : isPast ? '✅ Completed' : ''}
            </p>
          </div>
          <div style="text-align: right;">
            <span class="badge ${statusClass}" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
              ${escapeHtml(booking.status)}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('customerDashboard')) {
    loadCustomerDashboard();
  }
});
