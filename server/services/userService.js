import { randomUUID } from 'crypto';

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    identityProvider: user.identity_provider,
    providerSubject: user.provider_subject || null,
    displayName: user.display_name
  };
}

export function createUserService({ logger, userRepository }) {
  if (!userRepository) {
    throw new Error('[User] 缺少 userRepository 依赖');
  }

  return {
    async createGuestUser() {
      const createdUser = await userRepository.insertUser({
        id: `usr_guest_${randomUUID().replace(/-/g, '')}`,
        identityProvider: 'guest',
        providerSubject: null,
        displayName: '访客用户'
      });

      logger?.info?.({ userId: createdUser?.id }, '[User] 已创建访客用户');
      return normalizeUser(createdUser);
    },

    async findUserById(userId) {
      return normalizeUser(await userRepository.findUserById(userId));
    },

    async findUserByProvider(identityProvider, providerSubject) {
      return normalizeUser(
        await userRepository.findUserByProvider(identityProvider, providerSubject)
      );
    },

    async touchUserLastSeen(userId) {
      return normalizeUser(await userRepository.touchUserLastSeen(userId));
    }
  };
}
