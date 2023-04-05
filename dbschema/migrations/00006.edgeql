CREATE MIGRATION m1fy342rmgxbqfcgmmdnq4q2nutkjepx5wnkjhkbhzh6mf72gwxdrq
    ONTO m17qsdwd5buir2lqqb6uwbxtub5jwetfkuxp7zyhyupe3fibl237la
{
  ALTER TYPE default::Playlist {
      ALTER PROPERTY url {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
