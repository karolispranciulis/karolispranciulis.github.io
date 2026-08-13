---
layout: project_ide
title: Example Minecraft Plugin
description: A small Kotlin and Paper plugin demonstrating the project IDE.
project: Minecraft Plugin Development (Kotlin)
tags:
  - Kotlin
  - Paper
  - Minecraft
files:
  - name: Main.kt
    content: |
      package dev.karolis.example

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
      main: dev.karolis.example.Main
      api-version: '1.21'
---
