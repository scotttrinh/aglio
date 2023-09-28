CREATE MIGRATION m17cdmtnjztyd7olu6jwvghk2xxatttifscknch5zijr4qzkixg7oa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::Behavior EXTENDING enum<PAUSES_VIDEO, PAUSES_AUDIO>;
  CREATE TYPE default::Step {
      CREATE REQUIRED PROPERTY behaviors: array<default::Behavior>;
      CREATE REQUIRED PROPERTY duration: std::int64;
  };
  CREATE TYPE default::Source {
      CREATE REQUIRED PROPERTY media_type: std::str;
      CREATE REQUIRED PROPERTY provider: std::str;
      CREATE PROPERTY provider_meta: std::json;
      CREATE PROPERTY thumbnail: std::str;
      CREATE PROPERTY title: std::str;
      CREATE REQUIRED PROPERTY url: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK identities: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY email: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE MULTI LINK sources: default::Source {
          ON TARGET DELETE ALLOW;
      };
      CREATE PROPERTY email_verified: std::datetime;
  };
  CREATE GLOBAL default::current_user := (std::assert_single((SELECT
      default::User {
          id,
          name,
          email
      }
  FILTER
      (GLOBAL ext::auth::ClientTokenIdentity IN .identities)
  )));
  CREATE TYPE default::Sequence {
      CREATE REQUIRED LINK owner: default::User;
      CREATE ACCESS POLICY owner_has_full_access
          ALLOW ALL USING (((GLOBAL default::current_user).id ?= .owner.id));
      CREATE MULTI LINK steps: default::Step {
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
      CREATE REQUIRED PROPERTY name: std::str;
  };
};
