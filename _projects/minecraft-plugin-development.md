---
layout: default
title: Minecraft Plugin Development (Kotlin)
short_description: Minecraft plugin development with Kotlin and Paper, with source code presented in a simple browser IDE.
icon: /assets/projects/minecraft-plugin-development-kotlin.png
---

<main class="page">
  <div class="page-heading">
    <div class="eyebrow">PROJECT</div>
    <h1>{{ page.title }}</h1>
    <p>{{ page.short_description }}</p>
  </div>

  <section>
    <div class="section-label">PLUGINS</div>
    <div class="plugin-grid">
      {% assign plugins = site.plugins | where: "project", page.title %}
      {% for plugin in plugins %}
      <a class="plugin-card" href="{{ plugin.url | relative_url }}">
        <div class="plugin-card-top">
          <span class="plugin-icon">&lt;/&gt;</span>
          <span class="plugin-arrow">↗</span>
        </div>
        <h2>{{ plugin.title }}</h2>
        <p>{{ plugin.description }}</p>
        {% if plugin.tags %}
        <div class="project-tags">
          {% for tag in plugin.tags %}<span>{{ tag }}</span>{% endfor %}
        </div>
        {% endif %}
      </a>
      {% endfor %}
    </div>
  </section>
</main>
---
