import PacketComposer from '@Communication/outgoing/index';
import UserNotification, { NotificationType } from '@Models/user_notification';
import User from '@Models/user';
import NextChat from '@NextChat';

class NewNotificationComposer extends PacketComposer {
  constructor(
    private notification: UserNotification,
  ) {
    super('new_notification');
  }

  async execute(): Promise<void> {
    this.writeString(this.notification.type);
    
    switch (this.notification.type) {
      case NotificationType.FRIEND_ACCEPT:
      case NotificationType.FRIEND_REQUEST: {
        const user: User = await NextChat.getUsers().getById(this.notification.message.actor_id);

        this.writeBoolean(user != undefined && user != null);
        if (user) {
          this.writeString(user.username);
        }
        break;
      }
    }
  }
}

export default NewNotificationComposer;
