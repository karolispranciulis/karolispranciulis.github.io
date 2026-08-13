---
layout: default
title: Plugins
permalink: /projects/
---

<main class="page">
  <div class="page-heading">
    <div class="eyebrow">PLUGIN LIBRARY</div>
    <h1>Plugins</h1>
    <p>Open a plugin to browse its source files in the built-in IDE.</p>
  </div>

  <section class="project-grid">
    {% for project in site.projects %}
    <a class="project-card" href="{{ project.url | relative_url }}">
      <div class="project-card-top">
        <span class="project-icon">⌘</span>
        <span class="project-arrow">↗</span>
      </div>
      <div class="project-type">PLUGIN</div>
      <h2>{{ project.title }}</h2>
      <p>{{ project.short_description }}</p>
      {% if project.tags %}
      <div class="project-tags">
        {% for tag in project.tags %}<span>{{ tag }}</span>{% endfor %}
      </div>
      {% endif %}
    </a>
    {% endfor %}
  </section>
</main>
