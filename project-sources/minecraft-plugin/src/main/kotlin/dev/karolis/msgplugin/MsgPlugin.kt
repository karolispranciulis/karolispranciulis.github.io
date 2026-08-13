package dev.karolis.msgplugin

import org.bukkit.plugin.java.JavaPlugin

class MsgPlugin : JavaPlugin() {

    override fun onEnable() {
        logger.info("MsgPlugin enabled")
        getCommand("msg")?.setExecutor(MsgCommand())
    }

    override fun onDisable() {
        logger.info("MsgPlugin disabled")
    }
}
