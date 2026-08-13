---
layout: default
title: Home
---

<main class="site-container">

<section class="hero-section" id="top">
  <div class="hero-copy">
    <h1>xao3</h1>
    <p class="hero-role">Minecraft plugin developer.</p>
    <p class="hero-description">
      I build Minecraft plugins with Kotlin and Paper, and I enjoy turning
      ideas into clean, practical projects.
    </p>
  </div>
  <div class="code-brace hero-brace hero-brace-top">{</div>
  <div class="code-brace hero-brace hero-brace-bottom">}</div>
</section>

<section class="portfolio-section skills-section" id="skills">
  <div class="section-title-row">
    <h2>SKILLS</h2><span class="brace">{</span>
  </div>

  <div class="skills-layout">
    <div class="section-intro">
      <p>
        My current toolkit is focused on Minecraft development, Kotlin,
        and the tools I use to build and maintain plugins.
      </p>
    </div>

    <div class="skills-list">
      {% for skill in site.skills %}
      <article class="skill-item">
        <img src="{{ skill.image | relative_url }}" alt="{{ skill.name }} icon">
        <div>
          <h3>{{ skill.name }}</h3>
          <p>{{ skill.description }}</p>
        </div>
      </article>
      {% endfor %}
    </div>
  </div>

  <div class="section-brace">}</div>
</section>

<section class="portfolio-section projects-section" id="projects">
  <div class="section-title-row">
    <h2>PROJECTS</h2><span class="brace">{</span>
  </div>

  <div class="project-scroller-wrap">
    <div class="project-rail" id="projectRail" aria-label="Project selector"></div>

    <div class="project-scroller" id="projectScroller">
      {% for project in site.projects %}
      <a class="project-card" href="{{ project.url | relative_url }}"
         data-project-index="{{ forloop.index0 }}">
        <div class="project-image-wrap">
          <img src="{{ project.image | relative_url }}" alt="{{ project.name }}">
        </div>
        <h3>{{ project.name }}</h3>
        <p>{{ project.short_description }}</p>
        {% if project.tags %}
        <div class="project-tags">
          {% for tag in project.tags %}<span>{{ tag }}</span>{% endfor %}
        </div>
        {% endif %}
      </a>
      {% endfor %}
    </div>
  </div>

  <div class="section-brace">}</div>
</section>

<section class="portfolio-section about-section" id="about">
  <div class="section-title-row">
    <h2>ABOUT</h2><span class="brace">{</span>
  </div>

  <div class="about-copy">
    <p>I'm 17 years old and live in Kaunas, Lithuania.</p>
    <p>
      My hobbies are music and programming. I spend a lot of my programming
      time building Minecraft plugins and learning more about software development.
    </p>
  </div>

  <div class="section-brace">}</div>
</section>

<section class="portfolio-section contact-section" id="contact">
  <div class="section-title-row">
    <h2>CONTACT</h2><span class="brace">{</span>
  </div>

  <div class="contact-links">
    <a class="contact-icon-link" href="https://github.com/karolispranciulis"
       target="_blank" rel="noopener noreferrer" aria-label="GitHub">
      <span class="contact-icon github-icon">GH</span>
    </a>
    <a class="contact-icon-link" href="mailto:pranciuliskarolis@gmail.com"
       aria-label="Email">
      <span class="contact-icon mail-icon">@</span>
    </a>
  </div>

  <div class="section-brace">}</div>
</section>

</main>

<script src="{{ '/assets/js/home.js' | relative_url }}"></script>
