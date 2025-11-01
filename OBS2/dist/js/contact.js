import './common.js';
import { db, collection, addDoc, serverTimestamp, isConfigComplete } from './firebase.js';

const contactForm = document.getElementById('contact-form');
const whatsappLinks = document.querySelectorAll('[data-whatsapp-number]');

const formatWhatsappLink = (number) => {
  const sanitizedNumber = number.replace(/[^\d]/g, '');
  const defaultMessage =
    'Hello OBS team! I would like to discuss a new project and learn more about your services.';
  const encodedMessage = encodeURIComponent(defaultMessage);
  return `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`;
};

whatsappLinks.forEach((link) => {
  const number = link.getAttribute('data-whatsapp-number');
  if (!number) {
    return;
  }
  const formattedLink = formatWhatsappLink(number);
  link.setAttribute('href', formattedLink);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  link.setAttribute('aria-label', `Start a WhatsApp chat with OBS at ${number}`);
});
if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusEl = contactForm.querySelector('.form-status');

  const setStatus = (message, variant = 'info') => {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.dataset.variant = variant;
    }
  };

  if (!isConfigComplete || !db) {
    setStatus('Connect Firebase to enable project submissions.', 'warning');
    if (submitButton) {
      submitButton.disabled = true;
    }
  } else {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting…';
      }
      setStatus('Sending your project request…');

      const formData = new FormData(contactForm);
      const payload = {
        fullName: formData.get('fullName')?.toString().trim() ?? '',
        email: formData.get('email')?.toString().trim() ?? '',
        company: formData.get('company')?.toString().trim() ?? '',
        projectType: formData.get('projectType')?.toString().trim() ?? '',
        budget: formData.get('budget')?.toString().trim() ?? '',
        timeline: formData.get('timeline')?.toString().trim() ?? '',
        message: formData.get('message')?.toString().trim() ?? '',
        createdAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, 'projectInquiries'), payload);
        contactForm.reset();
        setStatus('Thank you! We will be in touch shortly.', 'success');
      } catch (error) {
        console.error('Contact submission failed', error);
        setStatus('Something went wrong. Please try again later.', 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit project';
        }
      }
    });
  }
}