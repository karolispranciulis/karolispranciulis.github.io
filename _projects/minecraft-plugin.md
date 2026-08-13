---
layout: project_ide
title: Minecraft Plugin Development
short_description: Custom Minecraft plugin built in Kotlin.
icon: /assets/images/kotlin.png
---

Here is a snippet of my `Main.kt` plugin file:

```kotlin
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
