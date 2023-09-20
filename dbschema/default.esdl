using extension auth;

module default {
  global current_user: uuid;

  type Account {
    required provider: str;
    required provider_account_id: str;
  }

  type Session {
    required expires: datetime;
    required token: str;
    required user: User;
  }

  type User {
    required name: str;
    required email: str {
      constraint exclusive;
    };
    email_verified: datetime;

    multi accounts: Account;
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
      using (global current_user ?= .owner.id);
  }

}
