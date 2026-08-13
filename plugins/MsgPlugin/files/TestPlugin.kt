package net.xao3.test

import org.bukkit.plugin.java.JavaPlugin

class TestPlugin : JavaPlugin() {

    override fun onEnable() { getCommand("msg")!!.setExecutor(MessageCommand())
    }



}