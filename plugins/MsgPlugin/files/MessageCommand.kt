package net.xao3.test

import net.kyori.adventure.text.minimessage.MiniMessage
import org.bukkit.Bukkit
import org.bukkit.command.Command
import org.bukkit.command.CommandExecutor
import org.bukkit.command.CommandSender
import org.bukkit.entity.Player

class MessageCommand : CommandExecutor{

    override fun onCommand(
        sender: CommandSender,
        command: Command,
        label: String,
        args: Array<out String>
    ): Boolean {
        if (args.size < 2) return false

        val player = Bukkit.getPlayer(args[0])

        if (player == null) {
            sender.sendMessage("The given player is offline or wrong username!")
            return false}

        val senderMessage = "<gray>[</gray><yellow>You</yellow> <gold>-></gold> <aqua>${player.name}</aqua><gray>]</gray> <white>${args.drop(1).joinToString(" ")}</white>"
        val receiverMessage = "<gray>[</gray><aqua>${sender.name}</aqua> <gold>-></gold> <yellow>You</yellow><gray>]</gray> <white>${args.drop(1).joinToString(" ")}</white>"


        if (sender is Player) {
            sender.sendMessage(MiniMessage.miniMessage().deserialize(senderMessage))
            player.sendMessage(MiniMessage.miniMessage().deserialize(receiverMessage))
        return true
        }


        sender.sendMessage(MiniMessage.miniMessage().deserialize(senderMessage))
        player.sendMessage(MiniMessage.miniMessage().deserialize(receiverMessage))
        return true}


}