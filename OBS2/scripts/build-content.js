#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const { JSDOM } = require('jsdom');

const CONTENT_PATH = path.resolve(__dirname, '..', 'content', 'siteContent.json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'dist');
const SOURCE_DIR = path.resolve(__dirname, '..');

const loadLocalContent = async () => {
  const raw = await fs.readFile(CONTENT_PATH, 'utf8');
  return JSON.parse(raw);
};

const setText = (document, selector, value) => {
  if (!value) return;
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
};

const setHTML = (document, selector, value) => {
  if (!value) return;
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = value;
  }
};

const setLink = (document, selector, link) => {
  if (!link) return;
  const element = document.querySelector(selector);
  if (!element) return;
  if (link.href) {
    element.setAttribute('href', link.href);
  }
  if (link.label) {
    element.textContent = link.label;
  }
};

const renderList = (document, selector, items, renderItem) => {
  if (!Array.isArray(items)) return;
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const node = renderItem(item);
    if (node) {
      fragment.appendChild(node);
    }
  });
  container.appendChild(fragment);
};

const applyHomeContent = (document, data) => {
  const hero = data.hero ?? {};
  setText(document, '[data-content="home-hero-eyebrow"]', hero.eyebrow);
  setText(document, '[data-content="home-hero-headline"]', hero.headline);
  setText(document, '[data-content="home-hero-body"]', hero.body);
  setLink(document, '[data-content="home-hero-primary-cta"]', hero.primaryCta);
  setLink(document, '[data-content="home-hero-secondary-cta"]', hero.secondaryCta);
  if (Array.isArray(hero.metrics)) {
    renderList(document, '[data-content="home-hero-metrics"]', hero.metrics, (item) => {
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
  setText(document, '[data-content="home-hero-featured-label"]', featured.label);
  setText(document, '[data-content="home-hero-featured-title"]', featured.title);
  setText(document, '[data-content="home-hero-featured-description"]', featured.description);
  renderList(document, '[data-content="home-hero-featured-bullets"]', featured.bullets, (bullet) => {
    const li = document.createElement('li');
    li.textContent = bullet ?? '';
    return li;
  });

  const services = data.services ?? {};
  setText(document, '[data-content="home-services-eyebrow"]', services.eyebrow);
  setText(document, '[data-content="home-services-headline"]', services.headline);
  setText(document, '[data-content="home-services-body"]', services.body);
  renderList(document, '[data-content="home-services-items"]', services.items, (item) => {
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
        li.textContent = bullet ?? '';
        list.appendChild(li);
      });
      article.appendChild(list);
    }
    return article;
  });

  const portfolio = data.portfolio ?? {};
  setText(document, '[data-content="home-portfolio-eyebrow"]', portfolio.eyebrow);
  setText(document, '[data-content="home-portfolio-headline"]', portfolio.headline);
  renderList(document, '[data-content="home-portfolio-items"]', portfolio.items, (item) => {
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
        li.textContent = bullet ?? '';
        list.appendChild(li);
      });
      article.appendChild(list);
    }
    return article;
  });

  const process = data.process ?? {};
  setText(document, '[data-content="home-process-eyebrow"]', process.eyebrow);
  setText(document, '[data-content="home-process-headline"]', process.headline);
  setText(document, '[data-content="home-process-body"]', process.body);
  setLink(document, '[data-content="home-process-cta"]', process.cta);
  renderList(document, '[data-content="home-process-steps"]', process.steps, (step) => {
    const li = document.createElement('li');
    if (step.title) {
      const h3 = document.createElement('h3');
      h3.textContent = step.title;
      li.appendChild(h3);
    }
    if (step.description) {
      const p = document.createElement('p');
      p.textContent = step.description;
      li.appendChild(p);
    }
    return li;
  });

  const testimonials = data.testimonials ?? {};
  setText(document, '[data-content="home-testimonials-eyebrow"]', testimonials.eyebrow);
  setText(document, '[data-content="home-testimonials-headline"]', testimonials.headline);
  renderList(document, '[data-content="home-testimonials-items"]', testimonials.items, (item) => {
    const figure = document.createElement('figure');
    figure.className = 'testimonial';
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = item.quote ?? '';
    figure.appendChild(blockquote);
    const figcaption = document.createElement('figcaption');
    if (item.name) {
      const name = document.createElement('span');
      name.className = 'testimonial-name';
      name.textContent = item.name;
      figcaption.appendChild(name);
    }
    if (item.role) {
      const role = document.createElement('span');
      role.className = 'testimonial-role';
      role.textContent = item.role;
      figcaption.appendChild(role);
    }
    figure.appendChild(figcaption);
    return figure;
  });

  const cta = data.cta ?? {};
  setText(document, '[data-content="home-cta-headline"]', cta.headline);
  setText(document, '[data-content="home-cta-body"]', cta.body);
  setLink(document, '[data-content="home-cta-cta"]', cta.link);
};

const applyAboutContent = (document, data) => {
  const hero = data.hero ?? {};
  setText(document, '[data-content="about-hero-eyebrow"]', hero.eyebrow);
  setText(document, '[data-content="about-hero-headline"]', hero.headline);
  setText(document, '[data-content="about-hero-body"]', hero.body);

  const mission = data.mission ?? {};
  setText(document, '[data-content="about-mission-title"]', mission.title);
  setText(document, '[data-content="about-mission-body"]', mission.body);

  const values = data.values ?? {};
  setText(document, '[data-content="about-values-title"]', values.title);
  renderList(document, '[data-content="about-values-items"]', values.items, (item) => {
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

  const leadership = data.leadership ?? {};
  setText(document, '[data-content="about-leadership-eyebrow"]', leadership.eyebrow);
  setText(document, '[data-content="about-leadership-headline"]', leadership.headline);
  renderList(document, '[data-content="about-leadership-members"]', leadership.members, (member) => {
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

  const engagement = data.engagement ?? {};
  setText(document, '[data-content="about-engagement-title"]', engagement.title);
  setText(document, '[data-content="about-engagement-body"]', engagement.body);

  const partnerships = data.partnerships ?? {};
  setText(document, '[data-content="about-partnerships-title"]', partnerships.title);
  setText(document, '[data-content="about-partnerships-body"]', partnerships.body);

  const careers = data.careers ?? {};
  setText(document, '[data-content="about-careers-title"]', careers.title);
  setText(document, '[data-content="about-careers-body"]', careers.body);
  setLink(document, '[data-content="about-careers-cta"]', careers.cta);
  renderList(document, '[data-content="about-careers-stats"]', careers.stats, (stat) => {
    const wrapper = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = stat.value ?? '';
    const dd = document.createElement('dd');
    dd.textContent = stat.label ?? '';
    wrapper.appendChild(dt);
    wrapper.appendChild(dd);
    return wrapper;
  });
};

const applyContactContent = (document, data) => {
  const hero = data.hero ?? {};
  setText(document, '[data-content="contact-hero-eyebrow"]', hero.eyebrow);
  setText(document, '[data-content="contact-hero-headline"]', hero.headline);
  setText(document, '[data-content="contact-hero-body"]', hero.body);

  const intake = data.intake ?? {};
  setText(document, '[data-content="contact-intake-title"]', intake.title);
  setHTML(document, '[data-content="contact-intake-body"]', intake.body);
  const sidebar = data.sidebar ?? {};
  setText(document, '[data-content="contact-sidebar-title"]', sidebar.title);
  setText(document, '[data-content="contact-sidebar-body"]', sidebar.body);
  if (sidebar.emailLink) {
    setLink(document, '[data-content="contact-sidebar-email"]', sidebar.emailLink);
  }
  renderList(document, '[data-content="contact-sidebar-locations"]', sidebar.locations, (location) => {
    const li = document.createElement('li');
    li.textContent = location ?? '';
    return li;
  });
  renderList(document, '[data-content="contact-sidebar-guarantees"]', sidebar.guarantees, (item) => {
    const li = document.createElement('li');
    li.textContent = item ?? '';
    return li;
  });

  const footer = data.footer ?? {};
  setText(document, '[data-content="contact-footer-blurb"]', footer.blurb);
  renderList(document, '[data-content="contact-footer-explore"]', footer.exploreLinks, (item) => {
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
  renderList(document, '[data-content="contact-footer-connect"]', footer.connectLinks, (item) => {
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
};

const processors = {
  index: applyHomeContent,
  about: applyAboutContent,
  contact: applyContactContent
};

const buildPage = async (name, data) => {
  const fileName = `${name}.html`;
  const sourcePath = path.resolve(SOURCE_DIR, fileName);
  const markup = await fs.readFile(sourcePath, 'utf8');
  const dom = new JSDOM(markup);
  const document = dom.window.document;
  const apply = processors[name];
  if (apply) {
    apply(document, data);
  }
  const outputPath = path.resolve(OUTPUT_DIR, fileName);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dom.serialize(), 'utf8');
  console.log(`Built ${fileName} with managed content.`);
};

const copyRecursive = async (source, destination) => {
  const stats = await fs.stat(source);
  if (stats.isDirectory()) {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source);
    for (const entry of entries) {
      await copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
  } else {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
  }
};

const copyStaticAssets = async () => {
  const assets = ['css', 'js', 'images', 'favicon.ico', 'admin.html', 'content'];
  for (const asset of assets) {
    const source = path.resolve(SOURCE_DIR, asset);
    try {
      await copyRecursive(source, path.resolve(OUTPUT_DIR, asset));
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }
};

const run = async () => {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const content = await loadLocalContent();
  const pages = [
    { key: 'home', output: 'index' },
    { key: 'about', output: 'about' },
    { key: 'contact', output: 'contact' }
  ];

  for (const page of pages) {
    const data = content[page.key] ?? {};
    await buildPage(page.output, data);
  }
  await copyStaticAssets();
  console.log('Build completed. Output located in ./dist');
};

run().catch((error) => {
  console.error('Build failed', error);
  process.exitCode = 1;
});