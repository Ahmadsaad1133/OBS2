import './common.js';

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
  const targetEmail = contactForm.dataset.mailto || '12134189a@gmail.com';

  const setStatus = (message, variant = 'info') => {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.dataset.variant = variant;
    }
  };

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Preparing email…';
    }
    setStatus('Opening your email app so you can send us the project brief…');

    const formData = new FormData(contactForm);
    const fullName = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const company = formData.get('company')?.toString().trim() ?? '';
    const message = formData.get('message')?.toString().trim() ?? '';

    if (!email) {
      setStatus('Please provide a valid email address.', 'error');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send message';
      }
      return;
    }

    const subject = fullName
      ? `New project inquiry from ${fullName}`
      : 'New project inquiry via obs.co';
    const lines = [
      'Hello OBS team,',
      '',
      fullName ? `Name: ${fullName}` : null,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      '',
      'Project vision:',
      message || 'No message provided.',
      '',
      'Sent via obs.co contact form'
    ].filter(Boolean);
    const body = lines.join('\n');

    const mailtoUrl = new URL(`mailto:${targetEmail}`);
    mailtoUrl.searchParams.set('subject', subject);
    mailtoUrl.searchParams.set('body', body);
    window.location.href = mailtoUrl.toString();

    setStatus('Your email app should now be open. Send the draft to complete your request.', 'success');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send message';
    }
    contactForm.reset();
  });
}