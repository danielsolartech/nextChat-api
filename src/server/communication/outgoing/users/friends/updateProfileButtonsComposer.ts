import PacketComposer from '@Communication/outgoing/index';
import User from '@Models/user';

interface ButtonsProps {
  type: 'FRIEND_REQUEST' | 'FRIEND' | 'FOLLOW';
  userOne: User;
  userTwo: User;
  options?: boolean;
}

class UpdateProfileButtonsComposer extends PacketComposer {
  constructor(
    private props: ButtonsProps,
  ) {
    super('update_profile_buttons');
  }

  async execute(): Promise<void> {
    this.writeString(this.props.type);
    this.writeString(this.props.userOne.username);

    if (this.props.type === 'FRIEND_REQUEST') {
      this.writeBoolean((await this.props.userOne.isFriendRequest(this.props.userTwo)) != null);
      this.writeBoolean(this.props.options || false);
    } else if (this.props.type === 'FOLLOW') {
      this.writeBoolean((await this.props.userOne.isFollower(this.props.userTwo)) != null);
      this.writeBoolean((await this.props.userOne.isFollowing(this.props.userTwo)) != null);
    }
  }
}

export default UpdateProfileButtonsComposer;
