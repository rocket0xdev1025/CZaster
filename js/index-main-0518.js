// vr-navigation.js - Enhanced with dynamic gallery and lazy loading for Captain Ethereum

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const navToggle = document.querySelector(".vr-nav-toggle");
  const navToggleBtn = document.querySelector(".nav-toggle-btn");
  const navToggleBtn2 = document.querySelector(".nav-toggle-btn2");
  const navigation = document.querySelector(".vr-navigation");
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".vr-section");
  const galleryModal = document.querySelector(".gallery-modal");
  const modalImage = document.getElementById("modal-image");
  const modalVideo = document.getElementById("modal-video");
  const modalCaption = document.querySelector(".modal-caption");
  const closeModal = document.querySelector(".close-modal");
  const copyBtn = document.querySelector(".copy-btn");
  const actionButtons = document.querySelectorAll(".action-button");
  const galleryContainer = document.querySelector(".gallery-grid");
  const loadingElement = document.querySelector(".gallery-loading");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const prevSectionBtn = document.querySelector(".prev-section");
  const nextSectionBtn = document.querySelector(".next-section");

  // Configuration for gallery
  const mediaFolderPath = "assets/gallery/";
  const supportedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "mp4",
    "webm",
  ];
  const imagesPerBatch = 12; // Number of images to load per batch

  // Global states
  let activeSection = "hero";
  let isTransitioning = false;
  let galleryFiles = []; // Array to store all gallery files
  let loadedBatches = 0; // Track number of batches loaded
  let isLoadingBatch = false; // Flag to prevent multiple batch loads simultaneously
  let visibleGalleryItems = []; // Track visible items for navigation
  let currentItemIndex = 0; // Current item index for modal navigation

  // Add these variables at the top with other global variables
  let lastScrollTime = 0;
  let scrollDebounceTime = 500; // Minimum time between scroll-triggered navigation
  // let touchStartY = 0;
  // let touchEndY = 0;
  // let touchThreshold = 50; // Minimum distance for swipe detection
  // let swipeIndicator = null; // Reference to the swipe indicator element

  // Define the navigation sequence at a higher scope
  const navigationSequence = [
    { id: "hero", type: "section" },
    // { id: 'about', type: 'section' },
    // { id: 'origin', type: 'section' },
    // { id: 'vitalik', type: 'section' },
    // { id: 'why-captain', type: 'section' },
    { id: "timeline", type: "section" },
    { id: "gallery", type: "section" },
    {
      id: "regenerates/regenerates.html",
      type: "external",
      title: "Regenerates",
    },
    { id: "etherverse/etherverse.html", type: "external", title: "Etherverse" },
    {
      id: "assets/lore/CaptainEthereum-Lore-converted.html",
      type: "external",
      title: "The Holy PDF",
    },
    { id: "prophecy", type: "section" },
    { id: "nfts/nft-gallery.html", type: "external", title: "NFT Gallery" },
    {
      id: "https://captaineth.replit.app/",
      type: "external",
      title: "Play Game",
    },
  ];

  // Add this function near the top of the file, after the global variables
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  // Initialize the page
  function initialize() {
    // Add touch device detection
    document.documentElement.classList.add(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
        ? "touch-device"
        : "no-touch-device"
    );

    // Set up navigation panel toggle
    navToggle.addEventListener("click", toggleNavigation);

    // Set up navigation button toggle
    if (navToggleBtn) {
      navToggleBtn.addEventListener("click", toggleNavigation);
    }

    if (navToggleBtn2) {
      navToggleBtn2.addEventListener("click", toggleNavigation);
    }

    // Setup section navigation buttons
    setupSectionNavigation();

    // Set up navigation item clicks
    navItems.forEach((item) => {
      item.addEventListener("click", handleNavClick);
    });

    // Setup copy token address functionality
    setupCopyAddress();

    // Setup iframe handling
    setupIframeHandling();

    // Setup persistent buttons
    setupPersistentButtons();

    // Handle initial navigation from query parameters
    handleInitialNavigation();

    // Initial active section highlight
    updateActiveNavItem();

    // Setup dynamic gallery when visiting gallery section
    setupDynamicGallery();

    // Setup gallery filter buttons
    setupGalleryFilters();

    // Setup gallery modal and navigation
    setupGalleryModal();

    // Setup intersection observer for lazy loading
    setupLazyLoading();

    // Ensure animation is running when page loads
    if (window.resumeEthereumAnimation) {
      window.resumeEthereumAnimation();
    }

    // Add mobile-specific handling
    setupMobileHandling();
  }

  // Setup persistent buttons functionality
  function setupPersistentButtons() {
    // Add hover effect enhancement
    actionButtons.forEach((button) => {
      // Visual feedback on hover
      button.addEventListener("mouseenter", function () {
        this.classList.add("hovered");
      });

      button.addEventListener("mouseleave", function () {
        this.classList.remove("hovered");
      });
    });

    // Make buttons appear with a small animation on page load
    setTimeout(() => {
      document.querySelectorAll(".action-button").forEach((button, index) => {
        setTimeout(() => {
          button.style.opacity = "0";
          button.style.transform = "translateY(-20px)";
          button.style.display = "flex";

          setTimeout(() => {
            button.style.transition =
              "all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
            button.style.opacity = "1";
            button.style.transform = "translateY(0)";
          }, 50);
        }, index * 100);
      });
    }, 1000); // Start after the page has loaded

    // Add touch support for buttons
    actionButtons.forEach((button) => {
      button.addEventListener("touchstart", function (e) {
        e.preventDefault(); // Prevent double-tap zoom
        this.classList.add("active");
      });

      button.addEventListener("touchend", function (e) {
        e.preventDefault();
        this.classList.remove("active");
        // Trigger the click event
        this.click();
      });
    });
  }

  // Add close iframe handler after initialize()
  function setupIframeHandling() {
    const closeIframeBtn = document.querySelector(".close-iframe");
    if (closeIframeBtn) {
      closeIframeBtn.addEventListener("click", () => {
        const iframe = document.getElementById("content-frame");
        iframe.src = "";
        // Resume animation when closing iframe
        if (window.resumeEthereumAnimation) {
          window.resumeEthereumAnimation();
        }
        // Navigate back to home or last section
        navigateToSection("hero");
      });
    }
  }

  // Toggle the navigation panel
  function toggleNavigation() {
    navigation.classList.toggle("active");
    navToggle.classList.toggle("active");

    // Also toggle active state on the navigation button if it exists
    if (navToggleBtn) {
      navToggleBtn.classList.toggle("active");
    }

    // Add fly-in animation to nav items
    if (navigation.classList.contains("active")) {
      navItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("visible");
        }, 100 * index);
      });
    } else {
      navItems.forEach((item) => {
        item.classList.remove("visible");
      });
    }
  }

  // Handle navigation item click
  function handleNavClick(e) {
    e.preventDefault();

    const href = this.getAttribute("href");

    // Check if it's an external page (starts with http:// or https://)
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const iframe = document.getElementById("content-frame");
      iframe.src = href;
      // Pause animation when viewing iframe content
      if (window.pauseEthereumAnimation) {
        window.pauseEthereumAnimation();
      }
      navigateToSection("iframe-content");

      // Close navigation if open
      if (navigation.classList.contains("active")) {
        toggleNavigation();
      }
    } else {
      // Get the section ID from data attribute or href
      const targetSection = this.dataset.section || href.substring(1);

      // Only proceed if not already transitioning
      if (targetSection && !isTransitioning) {
        // Resume animation when navigating to a regular section
        if (window.resumeEthereumAnimation) {
          window.resumeEthereumAnimation();
        }
        navigateToSection(targetSection);

        // If navigating to gallery, ensure content is loaded
        if (targetSection === "gallery" && galleryFiles.length === 0) {
          loadGalleryContents();
        }
      }
    }
  }

  // Navigate to the specified section
  function navigateToSection(sectionId) {
    // Set transition flag
    isTransitioning = true;

    // Close navigation if open
    if (navigation.classList.contains("active")) {
      toggleNavigation();
    }

    // Update active section
    activeSection = sectionId;

    // Animate transition using GSAP
    gsap.to(".vr-sections", {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        // Hide all sections
        sections.forEach((section) => {
          section.classList.remove("active");
        });

        // Show target section
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          targetElement.classList.add("active");

          // Update URL hash without scrolling
          history.pushState(null, null, `#${sectionId}`);

          // Update active navigation item
          updateActiveNavItem();

          // If entering gallery section, make sure content is loaded
          if (sectionId === "gallery") {
            if (galleryFiles.length === 0) {
              loadGalleryContents();
            }
          }

          // Fade back in
          gsap.to(".vr-sections", {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              isTransitioning = false;
            },
          });
        } else {
          isTransitioning = false;
        }
      },
    });

    // Update navigation button states for the new section
    if (typeof updateNavigationButtonStates === "function") {
      updateNavigationButtonStates();
    }
  }

  // Update the active navigation item based on current section
  function updateActiveNavItem() {
    navItems.forEach((item) => {
      const itemSection =
        item.dataset.section || item.getAttribute("href").substring(1);

      if (itemSection === activeSection) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Setup dynamic gallery functionality
  function setupDynamicGallery() {
    // Check for gallery section
    const gallerySection = document.getElementById("gallery");
    if (!gallerySection) return;

    // Add scroll event listener to detect when user reaches bottom of gallery
    gallerySection.addEventListener("scroll", function () {
      if (activeSection !== "gallery") return;

      const scrollHeight = gallerySection.scrollHeight;
      const scrollTop = gallerySection.scrollTop;
      const clientHeight = gallerySection.clientHeight;

      // If scrolled near the bottom, load more items
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadNextBatch();
      }
    });
  }

  // Function to fetch the contents of the media folder
  async function loadGalleryContents() {
    try {
      // Show loading indicator
      if (loadingElement) loadingElement.style.display = "flex";

      // In a real implementation, you would use an API endpoint that returns folder contents
      // For demonstration, we'll simulate a response from a server
      const response = await fetch("get-gallery-contents.php");

      if (!response.ok) {
        throw new Error("Failed to load gallery contents");
      }

      const data = await response.json();
      galleryFiles = data.files || [];

      // Load the first batch of images
      loadNextBatch();

      return galleryFiles;
    } catch (error) {
      console.error("Error loading gallery:", error);

      // Display error message in gallery
      if (galleryContainer) {
        galleryContainer.innerHTML = `
                    <div class="gallery-error">
                        <p>Failed to load gallery contents. Please try again later.</p>
                    </div>
                `;
      }

      return [];
    } finally {
      // Hide loading indicator after initial load
      if (loadingElement) loadingElement.style.display = "none";
    }
  }

  // Function to load the next batch of images
  function loadNextBatch() {
    if (
      isLoadingBatch ||
      loadedBatches * imagesPerBatch >= galleryFiles.length
    ) {
      return; // No more images to load or already loading
    }

    isLoadingBatch = true;

    // Calculate start and end indices for this batch
    const startIdx = loadedBatches * imagesPerBatch;
    const endIdx = Math.min(startIdx + imagesPerBatch, galleryFiles.length);

    // Get the files for this batch
    const batchFiles = galleryFiles.slice(startIdx, endIdx);

    // Render the batch
    renderGalleryItems(batchFiles);

    // Update the batch counter
    loadedBatches++;

    // Reset loading flag
    isLoadingBatch = false;
  }

  // Function to render gallery items
  function renderGalleryItems(files) {
    // If no files or container not found
    if (!files.length || !galleryContainer) return;

    // Create gallery items for each file
    files.forEach((file) => {
      const filePath = file.path || mediaFolderPath + file.name;
      const fileType =
        file.type ||
        (file.name.split(".").pop().toLowerCase() === "mp4"
          ? "video"
          : "image");
      const isVideo = fileType === "video";

      const galleryItem = document.createElement("div");
      galleryItem.className = "gallery-item";
      galleryItem.dataset.type = isVideo ? "video" : "image";
      galleryItem.dataset.src = filePath;

      // Create thumbnail
      if (isVideo) {
        // For videos, create a video thumbnail with a play button overlay
        const videoThumbnail = document.createElement("div");
        videoThumbnail.className = "video-thumbnail";

        const videoElement = document.createElement("video");
        videoElement.setAttribute("preload", "metadata");
        videoElement.setAttribute("data-src", filePath); // For lazy loading
        videoElement.classList.add("lazy");

        const playButton = document.createElement("div");
        playButton.className = "play-button";
        playButton.innerHTML = `
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ffffff" stroke-width="2" fill="#ffffff">
                        <polygon points="5,3 19,12 5,21"></polygon>
                    </svg>
                `;

        videoThumbnail.appendChild(videoElement);
        videoThumbnail.appendChild(playButton);
        galleryItem.appendChild(videoThumbnail);
      } else {
        // For images, create a lazy-loaded img element
        const img = document.createElement("img");
        img.classList.add("lazy");
        img.dataset.src = filePath; // For lazy loading
        img.alt = file.name.split(".")[0].replace(/[-_]/g, " ");

        // Create a placeholder element
        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder";
        placeholder.innerHTML = `
                    <div class="placeholder-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#8aa2ec" stroke-width="1" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                `;

        galleryItem.appendChild(placeholder);
        galleryItem.appendChild(img);
      }

      // Add click event to open modal
      galleryItem.addEventListener("click", () => openModal(galleryItem));

      galleryContainer.appendChild(galleryItem);
    });

    // Initialize lazy loading for the new batch
    observeLazyElements();

    // Initialize any required gallery effects or interactions
    initializeGalleryEffects();
  }

  // Setup intersection observer for lazy loading
  function setupLazyLoading() {
    if (!("IntersectionObserver" in window)) {
      // Fallback for browsers that don't support IntersectionObserver
      loadAllMedia();
      return;
    }
  }

  // Observe lazy elements for loading when they enter viewport
  function observeLazyElements() {
    const lazyImages = document.querySelectorAll(".lazy:not(.loaded)");

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyElement = entry.target;

            if (lazyElement.tagName === "IMG") {
              // Load image
              lazyElement.src = lazyElement.dataset.src;
              lazyElement.onload = () => {
                lazyElement.classList.add("loaded");
                const placeholder = lazyElement.previousElementSibling;
                if (
                  placeholder &&
                  placeholder.classList.contains("image-placeholder")
                ) {
                  placeholder.style.opacity = "0";
                  setTimeout(() => {
                    placeholder.style.display = "none";
                  }, 300);
                }
              };
            } else if (lazyElement.tagName === "VIDEO") {
              // Load video
              lazyElement.src = lazyElement.dataset.src;
              lazyElement.classList.add("loaded");
            }

            // Stop observing the element after loading
            lazyObserver.unobserve(lazyElement);
          }
        });
      },
      {
        rootMargin: "200px", // Load images before they're visible
        threshold: 0.01,
      }
    );

    // Observe all lazy elements
    lazyImages.forEach((element) => {
      lazyObserver.observe(element);
    });
  }

  // Fallback function to load all media if IntersectionObserver is not supported
  function loadAllMedia() {
    const lazyImages = document.querySelectorAll(".lazy:not(.loaded)");

    lazyImages.forEach((element) => {
      if (element.tagName === "IMG") {
        element.src = element.dataset.src;
        element.classList.add("loaded");
      } else if (element.tagName === "VIDEO") {
        element.src = element.dataset.src;
        element.classList.add("loaded");
      }
    });
  }

  // Setup gallery filters
  function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (!filterButtons.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Get filter value
        const filterValue = this.dataset.filter;

        // Filter gallery items and update visible items array
        updateVisibleItems(filterValue);
      });
    });

    // Set the 'all' filter as active by default
    const allFilter = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilter) allFilter.classList.add("active");
  }

  // Update which items are visible based on filter
  function updateVisibleItems(filterValue) {
    const galleryItems = document.querySelectorAll(".gallery-item");
    visibleGalleryItems = [];

    galleryItems.forEach((item) => {
      if (filterValue === "all" || item.dataset.type === filterValue) {
        item.style.display = "block";
        // Use GSAP for animation if available
        if (window.gsap) {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });
        }
        // Add to visible items array for modal navigation
        visibleGalleryItems.push(item);
      } else {
        if (window.gsap) {
          // Animate out
          gsap.to(item, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              item.style.display = "none";
            },
          });
        } else {
          item.style.display = "none";
        }
      }
    });

    // Update modal navigation buttons
    updateModalNavigation();
  }

  // Setup gallery modal and navigation
  function setupGalleryModal() {
    if (!galleryModal) return;

    // Close modal button
    if (closeModal) {
      closeModal.addEventListener("click", closeGalleryModal);
    }

    // Close modal when clicking outside content
    galleryModal.addEventListener("click", function (event) {
      if (event.target === galleryModal) {
        closeGalleryModal();
      }
    });

    // Modal navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => navigateGallery("prev"));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => navigateGallery("next"));
    }

    // Keyboard navigation
    document.addEventListener("keydown", function (event) {
      if (!galleryModal.classList.contains("active")) return;

      if (event.key === "ArrowLeft") {
        navigateGallery("prev");
      } else if (event.key === "ArrowRight") {
        navigateGallery("next");
      }
    });

    // Add touch support for gallery navigation
    let touchStartX = 0;
    let touchEndX = 0;

    galleryModal.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      false
    );

    galleryModal.addEventListener(
      "touchend",
      function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleGallerySwipe();
      },
      false
    );

    function handleGallerySwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next image
          navigateGallery("next");
        } else {
          // Swipe right - previous image
          navigateGallery("prev");
        }
      }
    }
  }

  // Open the modal with selected item
  function openModal(galleryItem) {
    const src = galleryItem.dataset.src;
    const type = galleryItem.dataset.type;
    const isVideo = type === "video";

    // Find the index of the clicked item in visible items
    currentItemIndex = visibleGalleryItems.indexOf(galleryItem);

    // Show the appropriate modal content based on media type
    if (isVideo) {
      if (modalImage) modalImage.style.display = "none";
      if (modalVideo) {
        modalVideo.style.display = "block";
        modalVideo.src = src;
        modalVideo.play();
      }
    } else {
      if (modalVideo) modalVideo.style.display = "none";
      if (modalImage) {
        modalImage.style.display = "block";
        modalImage.src = src;
      }
    }

    // Update caption if available
    if (modalCaption) {
      const img = galleryItem.querySelector("img");
      modalCaption.textContent = img
        ? img.alt
        : src.split("/").pop().split(".")[0].replace(/[-_]/g, " ");
    }

    // Show modal with animation
    galleryModal.classList.add("active");
    document.body.classList.add("modal-open");

    // Update navigation buttons
    updateModalNavigation();
  }

  // Close the gallery modal
  function closeGalleryModal() {
    // Stop video if playing
    if (modalVideo && modalVideo.style.display === "block") {
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }

    // Hide modal with animation
    galleryModal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  // Update modal navigation buttons
  function updateModalNavigation() {
    // Hide navigation if less than 2 items
    if (visibleGalleryItems.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    } else {
      if (prevBtn) prevBtn.style.display = "flex";
      if (nextBtn) nextBtn.style.display = "flex";
    }
  }

  // Navigate through gallery items in modal
  function navigateGallery(direction) {
    if (visibleGalleryItems.length <= 1) return;

    // Calculate new index
    let newIndex;
    if (direction === "prev") {
      newIndex =
        (currentItemIndex - 1 + visibleGalleryItems.length) %
        visibleGalleryItems.length;
    } else {
      newIndex = (currentItemIndex + 1) % visibleGalleryItems.length;
    }

    // Update current index
    currentItemIndex = newIndex;

    // Get the new item
    const newItem = visibleGalleryItems[newIndex];

    // Open modal with the new item
    openModal(newItem);
  }

  // Initialize gallery effects (animations, etc.)
  function initializeGalleryEffects() {
    // Add animations or effects to gallery items using GSAP
    if (window.gsap) {
      gsap.from(".gallery-item:not(.animated)", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        onComplete: function () {
          // Add class to mark as animated
          document
            .querySelectorAll(".gallery-item:not(.animated)")
            .forEach((item) => {
              item.classList.add("animated");
            });
        },
      });
    }
  }

  // Setup copy address functionality
  function setupCopyAddress() {
    if (!copyBtn) return;

    copyBtn.addEventListener("click", function () {
      const textToCopy = this.dataset.clipboardText;

      // Copy to clipboard
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // Show success feedback
          this.classList.add("copied");

          // Create and show tooltip
          const tooltip = document.createElement("div");
          tooltip.classList.add("copy-tooltip");
          tooltip.textContent = "Token address copied!";
          this.appendChild(tooltip);

          // Remove after animation
          setTimeout(() => {
            tooltip.classList.add("fade-out");

            setTimeout(() => {
              this.removeChild(tooltip);
              this.classList.remove("copied");
            }, 300);
          }, 2000);
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    });
  }

  // Add this new function to handle initial navigation
  function handleInitialNavigation() {
    const params = getQueryParams();

    if (params.section || params.page) {
      // Find the matching navigation item
      const navItems = document.querySelectorAll(".nav-item");
      let targetNav = null;

      navItems.forEach((item) => {
        const href = item.getAttribute("href");
        if (params.section && href === `#${params.section}`) {
          targetNav = item;
        } else if (params.page && href === params.page) {
          targetNav = item;
        }
      });

      // If we found a matching nav item, simulate a click on it
      if (targetNav) {
        targetNav.click();
      }
    }
  }

  // Function to get current index in navigation sequence
  function getCurrentIndex() {
    if (activeSection === "iframe-content") {
      // If we're in an iframe, find the matching external content
      const iframe = document.getElementById("content-frame");
      const currentUrl = iframe.src.split("/").slice(-1)[0];
      return navigationSequence.findIndex((item) =>
        item.id.endsWith(currentUrl)
      );
    }
    return navigationSequence.findIndex((item) => item.id === activeSection);
  }

  // Function to navigate to adjacent section
  function navigateToAdjacentSection(direction) {
    if (isTransitioning) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    let targetIndex;
    if (direction === "prev") {
      targetIndex = Math.max(0, currentIndex - 1);
    } else {
      targetIndex = Math.min(navigationSequence.length - 1, currentIndex + 1);
    }

    // Only navigate if it's a different section
    if (targetIndex !== currentIndex) {
      const target = navigationSequence[targetIndex];

      if (target.type === "external") {
        const iframe = document.getElementById("content-frame");
        iframe.src = target.id;
        // Pause animation when viewing iframe content
        if (window.pauseEthereumAnimation) {
          window.pauseEthereumAnimation();
        }
        navigateToSection("iframe-content");
      } else {
        // Resume animation when navigating to a regular section
        if (window.resumeEthereumAnimation) {
          window.resumeEthereumAnimation();
        }
        navigateToSection(target.id);
      }
    }
  }

  // Function to update button states (disable at boundaries)
  function updateNavigationButtonStates() {
    const currentIndex = getCurrentIndex();

    // Disable previous button if at first section
    if (currentIndex <= 0) {
      prevSectionBtn.classList.add("disabled");
      prevSectionBtn.setAttribute("disabled", true);
    } else {
      prevSectionBtn.classList.remove("disabled");
      prevSectionBtn.removeAttribute("disabled");
    }

    // Disable next button if at last section
    if (currentIndex >= navigationSequence.length - 1) {
      nextSectionBtn.classList.add("disabled");
      nextSectionBtn.setAttribute("disabled", true);
    } else {
      nextSectionBtn.classList.remove("disabled");
      nextSectionBtn.removeAttribute("disabled");
    }
  }

  // Modify setupSectionNavigation to use the shared functions
  function setupSectionNavigation() {
    if (!prevSectionBtn || !nextSectionBtn) return;

    // Previous section button click
    prevSectionBtn.addEventListener("click", () => {
      navigateToAdjacentSection("prev");
    });

    // Next section button click
    nextSectionBtn.addEventListener("click", () => {
      navigateToAdjacentSection("next");
    });

    // Add observer to update button states when active section changes
    const sectionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("active")
        ) {
          updateNavigationButtonStates();
        }
      });
    });

    // Observe all sections for class changes
    sections.forEach((section) => {
      sectionObserver.observe(section, { attributes: true });
    });

    // Add touch event support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      false
    );

    document.addEventListener(
      "touchend",
      function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      false
    );

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - go to next section
          navigateToAdjacentSection("next");
        } else {
          // Swipe right - go to previous section
          navigateToAdjacentSection("prev");
        }
      }
    }
  }

  // Add mobile-specific handling
  function setupMobileHandling() {
    // Handle price container visibility on mobile
    const priceContainers = document.querySelectorAll(".price-container");
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile, show only essential price info
      priceContainers.forEach((container) => {
        const detailsBoxes = container.querySelectorAll(".price-details-box");
        detailsBoxes.forEach((box, index) => {
          // Hide less important details on mobile
          if (index > 1) {
            box.style.display = "none";
          }
        });
      });
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          // Reload the page if switching between mobile/desktop
          window.location.reload();
        }
      }, 250);
    });
  }

  // Initialize on page load
  initialize();

  // Initialize gallery if we're already on the gallery section
  if (window.location.hash === "#gallery") {
    loadGalleryContents();
  }
});
