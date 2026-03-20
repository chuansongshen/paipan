import { describe, expect, it } from 'vitest';
import { createMemoryRepositories } from '../../server/repositories/memoryRepositories.js';

describe('userRepository', () => {
  it('创建并查询访客用户', async () => {
    const repositories = createMemoryRepositories();
    const user = await repositories.userRepository.insertUser({
      id: 'usr_guest_001',
      identityProvider: 'guest',
      providerSubject: null,
      displayName: '访客用户'
    });

    const found = await repositories.userRepository.findUserById(user.id);

    expect(found.id).toBe('usr_guest_001');
    expect(found.identity_provider).toBe('guest');
    expect(found.display_name).toBe('访客用户');
  });

  it('按外部身份查询用户', async () => {
    const repositories = createMemoryRepositories();

    await repositories.userRepository.insertUser({
      id: 'usr_wechat_001',
      identityProvider: 'wechat',
      providerSubject: 'openid_001',
      displayName: '微信用户'
    });

    const found = await repositories.userRepository.findUserByProvider('wechat', 'openid_001');

    expect(found.id).toBe('usr_wechat_001');
    expect(found.provider_subject).toBe('openid_001');
  });
});
