

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
const openMailClient = (email, subject, body) => {
  const mailtoUrl = new URL(`mailto:${email}`);
  if (subject) {
    mailtoUrl.searchParams.set('subject', subject);
  }
  if (body) {
    mailtoUrl.searchParams.set('body', body);
  }
  window.location.href = mailtoUrl.toString();
};
const newsletterForms = document.querySelectorAll('form.newsletter');
newsletterForms.forEach((form) => {
  const targetEmail = form.dataset.mailto || '12134189a@gmail.com';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email') || formData.get('newsletter-email');

    if (!email) {
      handleStatus(form, 'Please provide an email address.', 'error');
      return;
    }

    const trimmedEmail = email.toString().trim();
    if (!trimmedEmail) {
      handleStatus(form, 'Please provide a valid email address.', 'error');
      return;
    }
    const subject = 'OBS newsletter subscription request';
    const body = [
      'Hello OBS team,',
      '',
      `Please add ${trimmedEmail} to the newsletter list.`,
      '',
      'Thank you!'
    ].join('\n');

    handleStatus(
      form,
      'Opening your email app so you can confirm the subscription request…',
      'success'
    );
    openMailClient(targetEmail, subject, body);
    form.reset();
  });
});

export { handleStatus };