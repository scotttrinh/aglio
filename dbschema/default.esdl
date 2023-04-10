module default {
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
    multi link playlists -> Playlist {
      on source delete delete target if orphan;
    };
    multi link sequences := .<owner[is Sequence];
  }

  type Playlist {
    required property url -> str {
      constraint exclusive;
    };
  }

  type Step {
    required property duration -> int64;
  }

  type Sequence {
    required property name -> str;
    multi link steps -> Step {
      on source delete delete target if orphan;
    };
    required link owner -> User;
  }
}
