import './common.js';
import { db, doc, getDoc, isConfigComplete } from './firebase.js';

const pageId = document.body?.dataset?.contentPage;

if (!pageId) {
  console.warn('No data-content-page attribute found on <body>. Skipping Firestore content load.');
}

const setText = (selector, value) => {
  if (!value) return;
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
};

const setHTML = (selector, value) => {
  if (!value) return;
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = value;
  }
};

const setLink = (selector, link) => {
  if (!link) return;
  const element = document.querySelector(selector);
  if (element) {
    if (link.href) {
      element.setAttribute('href', link.href);
    }
    if (link.label) {
      element.textContent = link.label;
    }
  }
};

const createList = (items, renderItem) => {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const node = renderItem(item);
    if (node) {
      fragment.appendChild(node);
    }
  });
  return fragment;
};

const renderList = (selector, items, renderItem) => {
  if (!Array.isArray(items)) return;
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(createList(items, renderItem));
};

const applyHomeContent = (data) => {
  const hero = data.hero ?? {};
  setText('[data-content="home-hero-eyebrow"]', hero.eyebrow);
  setText('[data-content="home-hero-headline"]', hero.headline);
  setText('[data-content="home-hero-body"]', hero.body);
  setLink('[data-content="home-hero-primary-cta"]', hero.primaryCta);
  setLink('[data-content="home-hero-secondary-cta"]', hero.secondaryCta);

  if (Array.isArray(hero.metrics)) {
    renderList('[data-content="home-hero-metrics"]', hero.metrics, (item) => {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = item.value ?? '';
      const dd = document.createElement('dd');
      dd.textContent = item.label ?? '';
      wrapper.appendChild(dt);
      wrapper.appendChild(dd);
      return wrapper;
    });
  }

  const featured = hero.featuredProject ?? {};
  setText('[data-content="home-hero-featured-label"]', featured.label);
  setText('[data-content="home-hero-featured-title"]', featured.title);
  setText('[data-content="home-hero-featured-description"]', featured.description);
  if (Array.isArray(featured.bullets)) {
    renderList('[data-content="home-hero-featured-bullets"]', featured.bullets, (item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    });
  }

  const services = data.services ?? {};
  setText('[data-content="home-services-eyebrow"]', services.eyebrow);
  setText('[data-content="home-services-headline"]', services.headline);
  setText('[data-content="home-services-body"]', services.body);

  if (Array.isArray(services.items)) {
    renderList('[data-content="home-services-items"]', services.items, (item) => {
      const article = document.createElement('article');
      article.className = 'card';

      const title = document.createElement('h3');
      title.textContent = item.title ?? '';
      const description = document.createElement('p');
      description.textContent = item.description ?? '';
      article.appendChild(title);
      article.appendChild(description);

      if (Array.isArray(item.bullets) && item.bullets.length > 0) {
        const list = document.createElement('ul');
        item.bullets.forEach((bullet) => {
          const li = document.createElement('li');
          li.textContent = bullet;
          list.appendChild(li);
        });
        article.appendChild(list);
      }

      return article;
    });
  }

  const portfolio = data.portfolio ?? {};
  setText('[data-content="home-portfolio-eyebrow"]', portfolio.eyebrow);
  setText('[data-content="home-portfolio-headline"]', portfolio.headline);
  if (Array.isArray(portfolio.items)) {
    renderList('[data-content="home-portfolio-items"]', portfolio.items, (item) => {
      const article = document.createElement('article');
      article.className = 'card portfolio-card';

      if (item.badge) {
        const badge = document.createElement('div');
        badge.className = 'portfolio-card__badge';
        badge.textContent = item.badge;
        article.appendChild(badge);
      }

      const title = document.createElement('h3');
      title.textContent = item.title ?? '';
      article.appendChild(title);

      const description = document.createElement('p');
      description.textContent = item.description ?? '';
      article.appendChild(description);

      if (Array.isArray(item.bullets) && item.bullets.length > 0) {
        const list = document.createElement('ul');
        item.bullets.forEach((bullet) => {
          const li = document.createElement('li');
          li.textContent = bullet;
          list.appendChild(li);
        });
        article.appendChild(list);
      }

      return article;
    });
  }

  const process = data.process ?? {};
  setText('[data-content="home-process-eyebrow"]', process.eyebrow);
  setText('[data-content="home-process-headline"]', process.headline);
  setText('[data-content="home-process-body"]', process.body);
  setLink('[data-content="home-process-cta"]', process.cta);
  if (Array.isArray(process.steps)) {
    renderList('[data-content="home-process-steps"]', process.steps, (step) => {
      const li = document.createElement('li');
      if (step.title) {
        const heading = document.createElement('h3');
        heading.textContent = step.title;
        li.appendChild(heading);
      }
      if (step.description) {
        const copy = document.createElement('p');
        copy.textContent = step.description;
        li.appendChild(copy);
      }
      return li;
    });
  }

  const testimonials = data.testimonials ?? {};
  setText('[data-content="home-testimonials-eyebrow"]', testimonials.eyebrow);
  setText('[data-content="home-testimonials-headline"]', testimonials.headline);
  if (Array.isArray(testimonials.items)) {
    renderList('[data-content="home-testimonials-items"]', testimonials.items, (testimonial) => {
      const figure = document.createElement('figure');
      figure.className = 'testimonial';

      const blockquote = document.createElement('blockquote');
      blockquote.textContent = testimonial.quote ?? '';
      figure.appendChild(blockquote);

      const figcaption = document.createElement('figcaption');
      if (testimonial.name) {
        const name = document.createElement('span');
        name.className = 'testimonial-name';
        name.textContent = testimonial.name;
        figcaption.appendChild(name);
      }
      if (testimonial.role) {
        const role = document.createElement('span');
        role.className = 'testimonial-role';
        role.textContent = testimonial.role;
        figcaption.appendChild(role);
      }
      figure.appendChild(figcaption);
      return figure;
    });
  }

  const cta = data.cta ?? {};
  setText('[data-content="home-cta-headline"]', cta.headline);
  setText('[data-content="home-cta-body"]', cta.body);
  setLink('[data-content="home-cta-cta"]', cta.link);
};

const applyAboutContent = (data) => {
  const hero = data.hero ?? {};
  setText('[data-content="about-hero-eyebrow"]', hero.eyebrow);
  setText('[data-content="about-hero-headline"]', hero.headline);
  setText('[data-content="about-hero-body"]', hero.body);

  const mission = data.mission ?? {};
  setText('[data-content="about-mission-title"]', mission.title);
  setText('[data-content="about-mission-body"]', mission.body);

  const values = data.values ?? {};
  setText('[data-content="about-values-title"]', values.title);
  if (Array.isArray(values.items)) {
    renderList('[data-content="about-values-items"]', values.items, (item) => {
      const li = document.createElement('li');
      if (item?.label && item?.description) {
        const strong = document.createElement('strong');
        strong.textContent = `${item.label}:`;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(` ${item.description}`));
      } else if (typeof item === 'string') {
        li.textContent = item;
      }
      return li;
    });
  }

  const leadership = data.leadership ?? {};
  setText('[data-content="about-leadership-eyebrow"]', leadership.eyebrow);
  setText('[data-content="about-leadership-headline"]', leadership.headline);
  if (Array.isArray(leadership.members)) {
    renderList('[data-content="about-leadership-members"]', leadership.members, (member) => {
      const article = document.createElement('article');
      article.className = 'card profile-card';

      const name = document.createElement('h3');
      name.textContent = member.name ?? '';
      article.appendChild(name);

      if (member.role) {
        const role = document.createElement('p');
        role.className = 'profile-role';
        role.textContent = member.role;
        article.appendChild(role);
      }

      if (member.bio) {
        const bio = document.createElement('p');
        bio.textContent = member.bio;
        article.appendChild(bio);
      }

      return article;
    });
  }

  const engagement = data.engagement ?? {};
  setText('[data-content="about-engagement-title"]', engagement.title);
  setText('[data-content="about-engagement-body"]', engagement.body);

  const partnerships = data.partnerships ?? {};
  setText('[data-content="about-partnerships-title"]', partnerships.title);
  setText('[data-content="about-partnerships-body"]', partnerships.body);

  const careers = data.careers ?? {};
  setText('[data-content="about-careers-title"]', careers.title);
  setText('[data-content="about-careers-body"]', careers.body);
  setLink('[data-content="about-careers-cta"]', careers.cta);

  if (Array.isArray(careers.stats)) {
    renderList('[data-content="about-careers-stats"]', careers.stats, (stat) => {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = stat.value ?? '';
      const dd = document.createElement('dd');
      dd.textContent = stat.label ?? '';
      wrapper.appendChild(dt);
      wrapper.appendChild(dd);
      return wrapper;
    });
  }
};

const applyContactContent = (data) => {
  const hero = data.hero ?? {};
  setText('[data-content="contact-hero-eyebrow"]', hero.eyebrow);
  setText('[data-content="contact-hero-headline"]', hero.headline);
  setText('[data-content="contact-hero-body"]', hero.body);

  const intake = data.intake ?? {};
  setText('[data-content="contact-intake-title"]', intake.title);

  const sidebar = data.sidebar ?? {};
  setText('[data-content="contact-sidebar-title"]', sidebar.title);
  setText('[data-content="contact-sidebar-body"]', sidebar.body);
  if (sidebar.emailLink) {
    const link = document.querySelector('[data-content="contact-sidebar-email"]');
    if (link) {
      link.textContent = sidebar.emailLink.label ?? link.textContent;
      link.setAttribute('href', sidebar.emailLink.href ?? link.getAttribute('href'));
    }
  }

  if (Array.isArray(sidebar.locations)) {
    renderList('[data-content="contact-sidebar-locations"]', sidebar.locations, (location) => {
      const li = document.createElement('li');
      li.textContent = location;
      return li;
    });
  }

  if (Array.isArray(sidebar.guarantees)) {
    renderList('[data-content="contact-sidebar-guarantees"]', sidebar.guarantees, (item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    });
  }

  const footer = data.footer ?? {};
  setText('[data-content="contact-footer-blurb"]', footer.blurb);
  if (Array.isArray(footer.exploreLinks)) {
    renderList('[data-content="contact-footer-explore"]', footer.exploreLinks, (item) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.textContent = item.label ?? '';
      if (item.href) {
        anchor.setAttribute('href', item.href);
      }
      if (item.active) {
        anchor.classList.add('is-active');
      }
      li.appendChild(anchor);
      return li;
    });
  }

  if (Array.isArray(footer.connectLinks)) {
    renderList('[data-content="contact-footer-connect"]', footer.connectLinks, (item) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.textContent = item.label ?? '';
      if (item.href) {
        anchor.setAttribute('href', item.href);
      }
      if (item.external) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noreferrer');
      }
      li.appendChild(anchor);
      return li;
    });
  }
};

const applyContentForPage = (page, data) => {
  switch (page) {
    case 'home':
      applyHomeContent(data);
      break;
    case 'about':
      applyAboutContent(data);
      break;
    case 'contact':
      applyContactContent(data);
      break;
    default:
      console.warn(`No renderer configured for page: ${page}`);
      break;
  }
};

const hydrateContent = async () => {
  if (!pageId) return;
  if (!isConfigComplete || !db) {
    console.info('Skipping Firestore content load because Firebase is not configured.');
    return;
  }

  try {
    const snapshot = await getDoc(doc(db, 'siteContent', pageId));
    if (!snapshot.exists()) {
      console.warn(`No Firestore content found for page: ${pageId}`);
      return;
    }

    const data = snapshot.data();
    applyContentForPage(pageId, data);
  } catch (error) {
    console.error('Failed to load managed content from Firestore', error);
  }
};

hydrateContent();