import PacketComposer from '@Communication/outgoing/index';
import User from '@Models/user';
import UserNotification from '@Models/user_notification';
import NextChat from '@NextChat';

class NotificationCountComposer extends PacketComposer {
  constructor(
    private user: User,
  ) {
    super('notification_count');
  }

  async execute(): Promise<void> {
    const notifications: UserNotification[] = await NextChat.getDatabase().getUserNotifications().find({
      user: this.user,
      readed: false,
    });

    this.writeInteger(notifications.length);
  }
}

export default NotificationCountComposer;
