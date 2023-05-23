module default {
  global current_user -> uuid;

  type Account {
    required property provider -> str;
    required property provider_account_id -> str;
  }

  type Session {
    required property expires -> datetime;
    required property token -> str;
    required link user -> User;
  }

  type User {
    required property name -> str;
    required property email -> str {
      constraint exclusive;
    };
    property email_verified -> datetime;

    multi link accounts -> Account;
    multi link sources -> Source {
      on target delete allow;
    };
  }

  type Source {
    required property provider -> str;
    required property media_type -> str;
    required property url -> str {
      constraint exclusive;
    };
    property title -> str;
    property thumbnail -> str;
    property provider_meta -> json;
  }

  scalar type Behavior extending enum<
    'PAUSES_VIDEO',
    'PAUSES_AUDIO',
  >;

  type Step {
    required property duration -> int64;
    required property behaviors -> array<Behavior>;
  }

  type Sequence {
    required property name -> str;
    multi link steps -> Step {
      on source delete delete target if orphan;
    };
    required link owner -> User;

    access policy owner_has_full_access
      allow all
      using (global current_user ?= .owner.id);
  }

}

using future nonrecursive_access_policies;
