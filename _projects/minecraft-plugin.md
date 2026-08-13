---
layout: project_ide
title: Minecraft Plugin Development
short_description: Custom Minecraft plugin built in Kotlin.
icon: /assets/projects/minecraft-plugin-development-kotlin.png
tags:
  - Kotlin
  - Paper
  - Minecraft
files:
  - name: Main.kt
    content: |
      package dev.xao3.plugin

      import org.bukkit.plugin.java.JavaPlugin

      class Main : JavaPlugin() {
          override fun onEnable() {
              logger.info("Plugin has been enabled!")
          }

          override fun onDisable() {
              logger.info("Plugin has been disabled!")
          }
      }

  - name: plugin.yml
    content: |
      name: ExamplePlugin
      version: 1.0
      main: dev.xao3.plugin.Main
      api-version: '1.21'
---
