CREATE MIGRATION m1enkuhmuuxlcc2qr3ngb4xmxe6czo2a5ezn2df7cz2ju3eyvggzgq
    ONTO m134kgzge7zhhksao5q65ebthtookrnjkdhmw5gcxez7ladgf2eb4q
{
  CREATE TYPE default::Account {
      CREATE REQUIRED PROPERTY provider -> std::str;
      CREATE REQUIRED PROPERTY provider_account_id -> std::str;
  };
  CREATE TYPE default::Session {
      CREATE REQUIRED LINK user -> default::User;
      CREATE REQUIRED PROPERTY expires -> std::datetime;
      CREATE REQUIRED PROPERTY token -> std::str;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK sequences -> default::Sequence;
  };
};
