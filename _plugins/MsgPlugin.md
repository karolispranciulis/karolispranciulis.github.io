---
title: Example Minecraft Plugin

description: >
  A simple Minecraft plugin written in Kotlin using the Paper API.

project: Minecraft Plugin Development (Kotlin)

tags:
  - Kotlin
  - Paper
  - Minecraft

files:

  - name: Main.kt

    language: kotlin

    content: |
      package dev.karolis.example

      import org.bukkit.plugin.java.JavaPlugin

      class Main : JavaPlugin() {

          override fun onEnable() {
              logger.info("Example plugin has been enabled!")
          }

          override fun onDisable() {
              logger.info("Example plugin has been disabled!")
          }

      }


  - name: plugin.yml

    language: yaml

    content: |
      name: ExamplePlugin
      version: 1.0
      main: dev.karolis.example.Main
      api-version: '1.21'
---