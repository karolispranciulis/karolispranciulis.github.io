package dev.karolis.msgplugin

import org.bukkit.command.Command
import org.bukkit.command.CommandExecutor
import org.bukkit.command.CommandSender
import org.bukkit.entity.Player

class MsgCommand : CommandExecutor {
    override fun onCommand(
        sender: CommandSender,
        command: Command,
        label: String,
        args: Array<out String>
    ): Boolean {
        if (sender !is Player) {
            sender.sendMessage("Players only.")
            return true
        }
        if (args.size < 2) {
            sender.sendMessage("Usage: /msg <player> <message>")
            return true
        }
        val target = sender.server.getPlayer(args[0])
        if (target == null) {
            sender.sendMessage("Player not found.")
            return true
        }
        val message = args.drop(1).joinToString(" ")
        target.sendMessage("[${sender.name} -> you] $message")
        sender.sendMessage("[you -> ${target.name}] $message")
        return true
    }
}
