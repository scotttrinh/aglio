CREATE MIGRATION m1way6nq4hctudcme443hc7yzry4yeyz2qmeim3msmekbpxxar4oza
    ONTO m1zpesierj6quq4a4qfg4skdg4iiiqu4mxrsgiexoiy67bahe4wufq
{
  ALTER TYPE default::Playlist RENAME TO default::Source;
  ALTER TYPE default::Source {
      CREATE REQUIRED PROPERTY media_type -> std::str {
          SET REQUIRED USING (SELECT
              'playlist'
          );
      };
      CREATE REQUIRED PROPERTY provider -> std::str {
          SET REQUIRED USING (SELECT
              'youtube'
          );
      };
  };
  ALTER TYPE default::User {
      ALTER LINK playlists {
          RENAME TO sources;
      };
  };
};
