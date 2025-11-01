import { db, addDoc, collection, serverTimestamp, isConfigComplete } from './firebase.js';

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('is-open');
  });
}

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const handleStatus = (form, message, variant = 'info') => {
  const status = form.querySelector('.form-status');
  if (status) {
    status.textContent = message;
    status.dataset.variant = variant;
  }
};

const newsletterForms = document.querySelectorAll('form.newsletter');
newsletterForms.forEach((form) => {
  if (!isConfigComplete || !db) {
    handleStatus(form, 'Connect Firebase to enable newsletter signups.', 'warning');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email') || formData.get('newsletter-email');

    if (!email) {
      handleStatus(form, 'Please provide an email address.', 'error');
      return;
    }

    handleStatus(form, 'Saving your subscription…');

    try {
      await addDoc(collection(db, 'newsletterSubscriptions'), {
        email: email.toString().trim(),
        createdAt: serverTimestamp()
      });
      form.reset();
      handleStatus(form, 'Success! Welcome to the OBS newsletter.', 'success');
    } catch (error) {
      console.error('Newsletter submission failed', error);
      handleStatus(form, 'Unable to save right now. Please try again later.', 'error');
    }
  });
});