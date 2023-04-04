CREATE MIGRATION m134kgzge7zhhksao5q65ebthtookrnjkdhmw5gcxez7ladgf2eb4q
    ONTO initial
{
  CREATE TYPE default::Playlist {
      CREATE REQUIRED PROPERTY url -> std::str;
  };
  CREATE TYPE default::Step {
      CREATE REQUIRED LINK audio -> default::Playlist;
      CREATE REQUIRED LINK video -> default::Playlist;
      CREATE REQUIRED PROPERTY duration -> std::int64;
  };
  CREATE TYPE default::Sequence {
      CREATE MULTI LINK steps -> default::Step;
      CREATE REQUIRED PROPERTY name -> std::str;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY email -> std::str;
      CREATE REQUIRED PROPERTY name -> std::str;
  };
};
