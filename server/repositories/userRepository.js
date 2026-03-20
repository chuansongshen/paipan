export function createUserRepository(db) {
  return {
    async insertUser(user) {
      const result = await db.query(
        `
          insert into users (
            id,
            identity_provider,
            provider_subject,
            display_name
          )
          values ($1, $2, $3, $4)
          returning
            id,
            identity_provider,
            provider_subject,
            display_name,
            created_at,
            last_seen_at
        `,
        [
          user.id,
          user.identityProvider,
          user.providerSubject || null,
          user.displayName
        ]
      );

      return result.rows[0] || null;
    },

    async findUserById(userId) {
      const result = await db.query(
        `
          select
            id,
            identity_provider,
            provider_subject,
            display_name,
            created_at,
            last_seen_at
          from users
          where id = $1
          limit 1
        `,
        [userId]
      );

      return result.rows[0] || null;
    },

    async findUserByProvider(identityProvider, providerSubject) {
      const result = await db.query(
        `
          select
            id,
            identity_provider,
            provider_subject,
            display_name,
            created_at,
            last_seen_at
          from users
          where identity_provider = $1
            and provider_subject = $2
          limit 1
        `,
        [identityProvider, providerSubject]
      );

      return result.rows[0] || null;
    },

    async touchUserLastSeen(userId) {
      const result = await db.query(
        `
          update users
          set last_seen_at = now()
          where id = $1
          returning
            id,
            identity_provider,
            provider_subject,
            display_name,
            created_at,
            last_seen_at
        `,
        [userId]
      );

      return result.rows[0] || null;
    }
  };
}
