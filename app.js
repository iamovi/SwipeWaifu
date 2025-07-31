// Reference elements
const swipeContainer = document.getElementById('swipe-container');
const preloader = document.getElementById('preloader');
const swipeText = document.getElementById('swipe-text');
const backgroundImage = document.getElementById('background-image');
const toggleNsfw = document.getElementById('toggle-nsfw');
const loadingText = document.getElementById('loading-text');
const notificationContainer = document.getElementById('notification-container');

// Reference the icon with class "men"
const menIcon = document.querySelector('.bi.bi-x-diamond-fill.men');

// Initialize Hammer.js for swipe gestures
const hammer = new Hammer(swipeContainer);

// Get a reference to the modal
const jokesModal = new bootstrap.Modal(document.getElementById('staticBackdrop'), {
  backdrop: 'static',
  keyboard: false,
});

// Remove the previous double-click listener if exists (optional)
// document.removeEventListener('dblclick', () => {
//   jokesModal.show();
// });

// Add click event listener on the icon to show the modal
menIcon.addEventListener('click', () => {
  jokesModal.show();
});

// Variables for state management
let isLoading = false;
let hasSwiped = false;
let currentCategory = 'sfw'; // Default category

// Event listener for toggle switch
toggleNsfw.addEventListener('change', () => {
  currentCategory = toggleNsfw.checked ? 'nsfw' : 'sfw';
  const notificationMessage = toggleNsfw.checked
    ? 'NSFW mode is now ON'
    : 'NSFW mode is now OFF';
  const notificationType = toggleNsfw.checked ? 'success' : 'warning';
  showNotification(notificationMessage, notificationType);
});

// Function to show notifications
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.innerText = message;

  notificationContainer.appendChild(notification);

  // Automatically hide the notification after 3 seconds
  setTimeout(() => {
    notificationContainer.removeChild(notification);
  }, 3000);
}

// Override console.log to show notifications
const originalConsoleLog = console.log;
console.log = function(message) {
  showNotification(message, 'info2');
  originalConsoleLog.apply(console, arguments);
};

const originalConsoleError = console.error;
console.error = function(message) {
  showNotification(message, 'error');
  originalConsoleError.apply(console, arguments);
};

// Configure Hammer.js to detect swipes in all directions
hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

// Function to fetch a random waifu image with loading percentage
function getRandomWaifuImage() {
  if (isLoading) return;

  if (!hasSwiped) {
    swipeText.style.display = 'none';
    hasSwiped = true;
  }

  preloader.style.display = 'block';
  loadingText.style.display = 'block';
  isLoading = true;

  let percent = 0;
  loadingText.innerText = `Waifu Loading... ${percent}%`;

  // Simulate steady progress up to 95%
  const percentInterval = setInterval(() => {
    if (percent < 95) {
      percent += 1 + Math.floor(Math.random() * 2); // +1 or +2
      if (percent > 95) percent = 95;
      loadingText.innerText = `Waifu Loading... ${percent}%`;
    }
  }, 60);

  // Begin fetching waifu image
  fetch(`https://api.waifu.pics/${currentCategory}/waifu`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data?.url) {
        const image = new Image();
        image.src = data.url;

        image.onload = () => {
          clearInterval(percentInterval);
          loadingText.innerText = `Waifu Loading... 100%`;

          setTimeout(() => {
            backgroundImage.src = data.url;
            preloader.style.display = 'none';
            loadingText.style.display = 'none';
            isLoading = false;
            console.log('Waifu Appears 🌸');
          }, 300); // Delay to show 100%
        };

        image.onerror = () => {
          clearInterval(percentInterval);
          loadingText.innerText = `Failed to load Waifu.`;
          preloader.style.display = 'none';
          isLoading = false;
          setTimeout(() => {
            loadingText.style.display = 'none';
          }, 1500);
        };
      } else {
        throw new Error('No Waifu URL returned from the API.');
      }
    })
    .catch((err) => {
      clearInterval(percentInterval);
      loadingText.innerText = `Error fetching Waifu.`;
      preloader.style.display = 'none';
      isLoading = false;
      console.error(`Error: ${err.message}`);
      setTimeout(() => {
        loadingText.style.display = 'none';
      }, 1500);
    });
}

// Add swipe event listener
hammer.on('swipe', getRandomWaifuImage);
