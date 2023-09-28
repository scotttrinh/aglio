using extension pgcrypto;
using extension auth;

module default {
  global current_user := (
    assert_single((
      select User { id, name, email }
      filter global ext::auth::ClientTokenIdentity in .identities
    ))
  );

  type User {
    required name: str;
    email: str;
    email_verified: datetime;

    multi identities: ext::auth::Identity {
      constraint exclusive;
    };
    multi sources: Source {
      on target delete allow;
    };
  }

  type Source {
    required provider: str;
    required media_type: str;
    required url: str {
      constraint exclusive;
    };
    title: str;
    thumbnail: str;
    provider_meta: json;
  }

  scalar type Behavior extending enum<
    'PAUSES_VIDEO',
    'PAUSES_AUDIO',
  >;

  type Step {
    required duration: int64;
    required behaviors: array<Behavior>;
  }

  type Sequence {
    required name: str;
    multi steps: Step {
      on source delete delete target if orphan;
    };
    required owner: User;

    access policy owner_has_full_access
      allow all
      using (global current_user.id ?= .owner.id);
  }

}
