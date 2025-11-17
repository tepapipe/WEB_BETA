/* ============================================
   BestBuddies Pet Grooming - Admin Dashboard
   ============================================ */

let currentView = 'overview';

// Initialize admin dashboard
function initAdminDashboard() {
  // Check if user is admin
  if (!requireAdmin()) {
    return;
  }

  // Setup sidebar navigation
  setupSidebarNavigation();

  // Load overview by default
  loadOverview();
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-menu a');
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const view = this.dataset.view;
      if (view) {
        switchView(view);
      }
    });
  });
}

// Switch view
function switchView(view) {
  currentView = view;

  // Hide all views
  document.getElementById('overviewView').style.display = 'none';
  document.getElementById('pendingView').style.display = 'none';
  document.getElementById('confirmedView').style.display = 'none';
  document.getElementById('calendarView').style.display = 'none';
  document.getElementById('customersView').style.display = 'none';

  // Update active menu item
  document.querySelectorAll('.sidebar-menu a').forEach(item => {
    if (item.dataset.view === view) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Show and load appropriate view
  switch(view) {
    case 'overview':
      document.getElementById('overviewView').style.display = 'block';
      loadOverview();
      break;
    case 'pending':
      document.getElementById('pendingView').style.display = 'block';
      loadPendingBookings();
      break;
    case 'confirmed':
      document.getElementById('confirmedView').style.display = 'block';
      loadConfirmedBookings();
      break;
    case 'calendar':
      document.getElementById('calendarView').style.display = 'block';
      loadCalendarView();
      break;
    case 'customers':
      document.getElementById('customersView').style.display = 'block';
      loadCustomerManagement();
      break;
  }
}

// Load overview
function loadOverview() {
  const bookings = getBookings();
  const users = getUsers();
  const customers = users.filter(u => u.role === 'customer');

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalCustomers = customers.length;

  // Update stats
  document.getElementById('totalBookings').textContent = totalBookings;
  document.getElementById('pendingCount').textContent = pendingBookings;
  document.getElementById('confirmedCount').textContent = confirmedBookings;
  document.getElementById('totalCustomers').textContent = totalCustomers;

  // Load recent bookings
  const recentBookings = bookings
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  renderRecentBookings(recentBookings);
}

// Render recent bookings
function renderRecentBookings(bookings) {
  const container = document.getElementById('recentBookings');
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">📅</div>
        <p style="color: var(--gray-600);">No bookings yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(booking => {
    const statusClass = booking.status === 'confirmed' 
      ? 'badge-confirmed' 
      : booking.status === 'cancelled' 
      ? 'badge-cancelled' 
      : 'badge-pending';
    
    const petEmoji = booking.petType === 'dog' ? '🐕' : '🐈';
    
    return `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 1.5rem; align-items: center;">
          <div style="font-size: 2.5rem;">${petEmoji}</div>
          <div>
            <h4 style="margin-bottom: 0.5rem; color: var(--gray-900);">${escapeHtml(booking.petName)}</h4>
            <p style="color: var(--gray-600); margin-bottom: 0.25rem; font-size: 0.875rem;">
              <strong>Customer:</strong> ${escapeHtml(booking.customerName)}
            </p>
            <p style="color: var(--gray-600); margin-bottom: 0.25rem; font-size: 0.875rem;">
              <strong>Package:</strong> ${escapeHtml(booking.packageName)}
            </p>
            <p style="color: var(--gray-500); font-size: 0.875rem;">
              📅 ${formatDate(booking.date)} at ${formatTime(booking.time)}
            </p>
          </div>
          <div>
            <span class="badge ${statusClass}">${escapeHtml(booking.status)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Load pending bookings
function loadPendingBookings() {
  const bookings = getBookings();
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  renderPendingBookingsTable(pendingBookings);

  // Setup search
  const searchInput = document.getElementById('pendingSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const filtered = pendingBookings.filter(booking => 
        booking.customerName.toLowerCase().includes(query) ||
        booking.petName.toLowerCase().includes(query) ||
        booking.packageName.toLowerCase().includes(query)
      );
      renderPendingBookingsTable(filtered);
    });
  }
}

// Render pending bookings table
function renderPendingBookingsTable(bookings) {
  const container = document.getElementById('pendingBookingsTable');
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = '<p class="empty-state">No pending bookings</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pet</th>
            <th>Package</th>
            <th>Date</th>
            <th>Time</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>${escapeHtml(booking.customerName)}</td>
              <td>${escapeHtml(booking.petName)} (${escapeHtml(booking.petType)})</td>
              <td>${escapeHtml(booking.packageName)}</td>
              <td>${formatDate(booking.date)}</td>
              <td>${formatTime(booking.time)}</td>
              <td>${escapeHtml(booking.phone)}</td>
              <td>
                <button class="btn btn-success btn-sm" onclick="confirmBooking('${booking.id}')">
                  Confirm
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.id}')">
                  Cancel
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Load confirmed bookings
function loadConfirmedBookings() {
  const bookings = getBookings();
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  renderConfirmedBookingsTable(confirmedBookings);
}

// Render confirmed bookings table
function renderConfirmedBookingsTable(bookings) {
  const container = document.getElementById('confirmedBookingsTable');
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = '<p class="empty-state">No confirmed bookings</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pet</th>
            <th>Package</th>
            <th>Date</th>
            <th>Time</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>${escapeHtml(booking.customerName)}</td>
              <td>${escapeHtml(booking.petName)} (${escapeHtml(booking.petType)})</td>
              <td>${escapeHtml(booking.packageName)}</td>
              <td>${formatDate(booking.date)}</td>
              <td>${formatTime(booking.time)}</td>
              <td>${escapeHtml(booking.phone)}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.id}')">
                  Cancel
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Load calendar view
function loadCalendarView() {
  const dateInput = document.getElementById('calendarDate');
  if (dateInput) {
    dateInput.min = getMinDate();
    dateInput.value = new Date().toISOString().split('T')[0];
    
    dateInput.addEventListener('change', function() {
      loadCalendarAppointments(this.value);
    });

    // Load today's appointments
    loadCalendarAppointments(dateInput.value);
  }
}

// Load appointments for selected date
function loadCalendarAppointments(date) {
  const bookings = getBookings();
  const dayBookings = bookings.filter(b => b.date === date && b.status !== 'cancelled');

  const container = document.getElementById('calendarAppointments');
  if (!container) return;

  if (dayBookings.length === 0) {
    container.innerHTML = '<p class="empty-state">No appointments for this date</p>';
    return;
  }

  // Sort by time
  dayBookings.sort((a, b) => {
    const timeA = a.time.replace('am', '').replace('pm', '');
    const timeB = b.time.replace('am', '').replace('pm', '');
    return timeA.localeCompare(timeB);
  });

  container.innerHTML = `
    <div class="grid">
      ${dayBookings.map(booking => {
        const statusClass = booking.status === 'confirmed' 
          ? 'badge-confirmed' 
          : 'badge-pending';
        
        return `
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">${escapeHtml(booking.petName)}</h3>
              <p><strong>Customer:</strong> ${escapeHtml(booking.customerName)}</p>
              <p><strong>Package:</strong> ${escapeHtml(booking.packageName)}</p>
              <p><strong>Time:</strong> ${formatTime(booking.time)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
              <p><span class="badge ${statusClass}">${escapeHtml(booking.status)}</span></p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Load customer management
function loadCustomerManagement() {
  const users = getUsers();
  const customers = users.filter(u => u.role === 'customer');
  const bookings = getBookings();

  // Add booking count to each customer
  const customersWithBookings = customers.map(customer => {
    const customerBookings = bookings.filter(b => b.userId === customer.id);
    return {
      ...customer,
      bookingCount: customerBookings.length
    };
  });

  renderCustomerTable(customersWithBookings);
}

// Render customer table
function renderCustomerTable(customers) {
  const container = document.getElementById('customersTable');
  if (!container) return;

  if (customers.length === 0) {
    container.innerHTML = '<p class="empty-state">No customers yet</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined Date</th>
            <th>Total Bookings</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map(customer => `
            <tr>
              <td>${escapeHtml(customer.name)}</td>
              <td>${escapeHtml(customer.email)}</td>
              <td>${formatDate(new Date(customer.createdAt).toISOString().split('T')[0])}</td>
              <td>${customer.bookingCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Confirm booking
function confirmBooking(bookingId) {
  if (!confirm('Are you sure you want to confirm this booking?')) {
    return;
  }

  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (booking) {
    booking.status = 'confirmed';
    saveBookings(bookings);
    
    // Reload current view
    switchView(currentView);
    alert('Booking confirmed successfully!');
  }
}

// Cancel booking
function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (booking) {
    booking.status = 'cancelled';
    saveBookings(bookings);
    
    // Reload current view
    switchView(currentView);
    alert('Booking cancelled successfully!');
  }
}

// Make functions globally available
window.confirmBooking = confirmBooking;
window.cancelBooking = cancelBooking;

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('adminDashboard')) {
    initAdminDashboard();
  }
});

