---
layout: default
title: Projects
permalink: /projects/
---

<main class="page">
  <div class="page-heading">
    <div class="eyebrow">SELECTED WORK</div>
    <h1>Projects</h1>
    <p>Explore my projects and open a project to see the plugins and source files inside it.</p>
  </div>

  <section class="project-list">
    {% for project in site.projects %}
    <a class="project-card project-card-large" href="{{ project.url | relative_url }}">
      <div class="project-card-top">
        <img src="{{ project.icon | relative_url }}" alt="{{ project.title }}">
        <span class="project-arrow">↗</span>
      </div>
      <div class="project-type">PROJECT</div>
      <h2>{{ project.title }}</h2>
      <p>{{ project.short_description }}</p>
      <div class="project-card-link">View project</div>
    </a>
    {% endfor %}
  </section>
</main>
