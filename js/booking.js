/* ============================================
   BestBuddies Pet Grooming - Booking Flow
   ============================================ */

let bookingData = {
  petType: null,
  packageId: null,
  date: null,
  time: null,
  petName: '',
  phone: ''
};

let currentStep = 1;
const totalSteps = 4;

// Initialize booking page
function initBooking() {
  // Check if user is logged in
  if (!requireLogin()) {
    return;
  }

  const user = getCurrentUser();
  
  // Pre-fill customer name
  const customerNameInput = document.getElementById('customerName');
  if (customerNameInput) {
    customerNameInput.value = user.name;
  }

  // Initialize step 1
  showStep(1);
  
  // Setup date picker
  setupDatePicker();
  
  // Setup time slots (must be before setupBookingListeners)
  setupTimeSlots();
  
  // Setup event listeners
  setupBookingListeners();
  
  // Load packages (after listeners are set up)
  loadPackages();
}

// Setup event listeners
function setupBookingListeners() {
  // Pet type selection
  const petCards = document.querySelectorAll('.pet-type-card');
  petCards.forEach(card => {
    card.addEventListener('click', function() {
      const petType = this.dataset.petType;
      selectPetType(petType);
    });
  });

  // Package selection
  const packageCards = document.querySelectorAll('.package-card');
  packageCards.forEach(card => {
    card.addEventListener('click', function() {
      const packageId = this.dataset.packageId;
      selectPackage(packageId);
    });
  });

  // Date selection
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    dateInput.addEventListener('change', function() {
      bookingData.date = this.value;
      updateTimeSlots();
      updateSummary();
      enableNextButton();
    });
  }

  // Time slot selection is handled in setupTimeSlots()

  // Form inputs
  const petNameInput = document.getElementById('petName');
  if (petNameInput) {
    petNameInput.addEventListener('input', function() {
      bookingData.petName = this.value.trim();
      updateSummary();
      enableNextButton();
    });
  }

  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      bookingData.phone = this.value.trim();
      updateSummary();
      enableNextButton();
    });
  }

  // Navigation buttons
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextStep);
  }

  const prevBtn = document.getElementById('prevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', prevStep);
  }

  const submitBtn = document.getElementById('submitBooking');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitBooking);
  }
}

// Show specific step
function showStep(step) {
  currentStep = step;

  // Update step indicators
  document.querySelectorAll('.step').forEach((stepEl, index) => {
    const stepNum = index + 1;
    stepEl.classList.remove('active', 'completed');
    
    if (stepNum < step) {
      stepEl.classList.add('completed');
    } else if (stepNum === step) {
      stepEl.classList.add('active');
    }
  });

  // Show/hide step content
  document.querySelectorAll('.step-content').forEach((content, index) => {
    if (index + 1 === step) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Show/hide navigation buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBooking');

  if (prevBtn) {
    prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
  }

  if (nextBtn) {
    nextBtn.style.display = step < totalSteps ? 'inline-block' : 'none';
  }

  if (submitBtn) {
    submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
  }

  updateSummary();
}

// Next step
function nextStep() {
  // Validate current step
  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

// Previous step
function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// Validate step
function validateStep(step) {
  switch(step) {
    case 1:
      if (!bookingData.petType) {
        alert('Please select a pet type');
        return false;
      }
      break;
    case 2:
      if (!bookingData.packageId) {
        alert('Please select a package');
        return false;
      }
      break;
    case 3:
      if (!bookingData.date) {
        alert('Please select a date');
        return false;
      }
      if (!bookingData.time) {
        alert('Please select a time slot');
        return false;
      }
      break;
    case 4:
      if (!bookingData.petName.trim()) {
        alert('Please enter your pet\'s name');
        return false;
      }
      if (!bookingData.phone.trim()) {
        alert('Please enter your phone number');
        return false;
      }
      break;
  }
  return true;
}

// Select pet type
function selectPetType(petType) {
  bookingData.petType = petType;
  
  // Update UI
  document.querySelectorAll('.pet-type-card').forEach(card => {
    if (card.dataset.petType === petType) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Clear package selection if type changed
  bookingData.packageId = null;
  loadPackages();
  updateSummary();
  enableNextButton();
}

// Load packages based on selected pet type
function loadPackages() {
  if (!bookingData.petType) return;

  const packages = getPackages();
  const filteredPackages = packages.filter(pkg => pkg.type === bookingData.petType);
  
  const packagesContainer = document.getElementById('packagesContainer');
  if (!packagesContainer) return;

  packagesContainer.innerHTML = filteredPackages.map(pkg => {
    const isSelected = bookingData.packageId === pkg.id;
    return `
      <div class="card card-selectable package-card ${isSelected ? 'selected' : ''}" 
           data-package-id="${pkg.id}">
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(pkg.name)}</h3>
          <p style="font-size: 1.5rem; font-weight: 700; color: var(--purple); margin: 1rem 0;">
            $${pkg.price}
          </p>
          <p style="color: var(--gray-600);">
            Duration: ${pkg.duration} minutes
          </p>
        </div>
      </div>
    `;
  }).join('');

  // Re-attach event listeners
  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', function() {
      const packageId = this.dataset.packageId;
      selectPackage(packageId);
    });
  });
}

// Select package
function selectPackage(packageId) {
  bookingData.packageId = packageId;
  
  // Update UI
  document.querySelectorAll('.package-card').forEach(card => {
    if (card.dataset.packageId === packageId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  updateSummary();
  enableNextButton();
}

// Setup date picker
function setupDatePicker() {
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    dateInput.min = getMinDate();
    dateInput.value = '';
  }
}

// Setup time slots
function setupTimeSlots() {
  const timeSlots = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
  const container = document.getElementById('timeSlotsContainer');
  
  if (!container) return;

  container.innerHTML = timeSlots.map(time => {
    return `
      <button type="button" class="time-slot" data-time="${time}">
        ${time}
      </button>
    `;
  }).join('');

  // Re-attach event listeners
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
      if (!this.disabled) {
        const time = this.dataset.time;
        selectTime(time);
      }
    });
  });

  updateTimeSlots();
}

// Update time slots based on selected date
function updateTimeSlots() {
  if (!bookingData.date) {
    // If no date selected, disable all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
      slot.disabled = true;
      slot.classList.remove('selected');
    });
    return;
  }

  const bookings = getBookings();
  const bookedSlots = bookings
    .filter(b => b.date === bookingData.date && b.status !== 'cancelled')
    .map(b => b.time);

  const isPast = isPastDate(bookingData.date);
  const isToday = bookingData.date === getMinDate();

  document.querySelectorAll('.time-slot').forEach(slot => {
    const time = slot.dataset.time;
    const isBooked = bookedSlots.includes(time);
    
    // If past date, disable all
    // If today, disable past times
    let shouldDisable = false;
    if (isPast) {
      shouldDisable = true;
    } else if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const slotHour = parseInt(time.replace('am', '').replace('pm', ''));
      const isPM = time.includes('pm');
      const hour24 = isPM && slotHour !== 12 ? slotHour + 12 : (!isPM && slotHour === 12 ? 0 : slotHour);
      shouldDisable = hour24 <= currentHour;
    }

    slot.disabled = isBooked || shouldDisable;
    
    if (slot.dataset.time === bookingData.time && !slot.disabled) {
      slot.classList.add('selected');
    } else {
      slot.classList.remove('selected');
    }
  });

  // Clear selected time if it's now disabled
  if (bookingData.time) {
    const selectedSlot = document.querySelector(`.time-slot[data-time="${bookingData.time}"]`);
    if (selectedSlot && selectedSlot.disabled) {
      bookingData.time = null;
      updateSummary();
      enableNextButton();
    }
  }
}

// Select time
function selectTime(time) {
  bookingData.time = time;
  
  // Update UI
  document.querySelectorAll('.time-slot').forEach(slot => {
    if (slot.dataset.time === time) {
      slot.classList.add('selected');
    } else {
      slot.classList.remove('selected');
    }
  });

  updateSummary();
  enableNextButton();
}

// Update summary
function updateSummary() {
  const summaryContainer = document.getElementById('bookingSummary');
  if (!summaryContainer) return;

  const packages = getPackages();
  const selectedPackage = packages.find(p => p.id === bookingData.packageId);

  let summaryHTML = '<div class="summary-card"><h3 style="margin-bottom: 1rem;">Booking Summary</h3>';

  if (bookingData.petType) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Pet Type:</span>
        <span class="summary-value">${escapeHtml(bookingData.petType.charAt(0).toUpperCase() + bookingData.petType.slice(1))}</span>
      </div>
    `;
  }

  if (selectedPackage) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Package:</span>
        <span class="summary-value">${escapeHtml(selectedPackage.name)}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Price:</span>
        <span class="summary-value">$${selectedPackage.price}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Duration:</span>
        <span class="summary-value">${selectedPackage.duration} min</span>
      </div>
    `;
  }

  if (bookingData.date) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Date:</span>
        <span class="summary-value">${formatDate(bookingData.date)}</span>
      </div>
    `;
  }

  if (bookingData.time) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Time:</span>
        <span class="summary-value">${formatTime(bookingData.time)}</span>
      </div>
    `;
  }

  if (bookingData.petName) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Pet Name:</span>
        <span class="summary-value">${escapeHtml(bookingData.petName)}</span>
      </div>
    `;
  }

  if (selectedPackage) {
    summaryHTML += `
      <div class="summary-item">
        <span class="summary-label">Total:</span>
        <span class="summary-value">$${selectedPackage.price}</span>
      </div>
    `;
  }

  summaryHTML += '</div>';
  summaryContainer.innerHTML = summaryHTML;
}

// Enable next button if step is valid
function enableNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  if (!nextBtn) return;

  let isValid = false;
  switch(currentStep) {
    case 1:
      isValid = !!bookingData.petType;
      break;
    case 2:
      isValid = !!bookingData.packageId;
      break;
    case 3:
      isValid = !!bookingData.date && !!bookingData.time;
      break;
    case 4:
      isValid = !!bookingData.petName.trim() && !!bookingData.phone.trim();
      break;
  }

  nextBtn.disabled = !isValid;
}

// Submit booking
function submitBooking(event) {
  event.preventDefault();

  if (!validateStep(4)) {
    return;
  }

  const user = getCurrentUser();
  const packages = getPackages();
  const selectedPackage = packages.find(p => p.id === bookingData.packageId);
  const customerNameInput = document.getElementById('customerName');
  const customerName = customerNameInput ? customerNameInput.value.trim() : user.name;

  // Create booking object
  const booking = {
    id: generateId(),
    userId: user.id,
    petName: bookingData.petName.trim(),
    petType: bookingData.petType,
    packageName: selectedPackage.name,
    packageId: bookingData.packageId,
    date: bookingData.date,
    time: bookingData.time,
    phone: bookingData.phone.trim(),
    customerName: customerName,
    status: 'pending',
    createdAt: Date.now()
  };

  // Save booking
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // Store booking in session for success page
  sessionStorage.setItem('lastBooking', JSON.stringify(booking));

  // Redirect to success page
  redirect('booking-success.html');
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('bookingPage')) {
    initBooking();
  }
});

