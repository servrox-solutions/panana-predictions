'use client';

import { RandomAvatar } from 'react-random-avatars';

export const Avatar = ({ address }: { address: string }) => {
    return <RandomAvatar name={address} size={60} />;
}