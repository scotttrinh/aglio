CREATE MIGRATION m1a6wn7v24hhugfaoqm5wzd3m6p2lhv3lrigxmrngvr2bpjgci4wuq
    ONTO m1w7wwgy2yzgtsqnljlktg7tj4p4e35zcibwxnwvht55dw7ajow6fq
{
  ALTER TYPE default::User {
      CREATE MULTI LINK identities: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER GLOBAL default::current_user USING (std::assert_single((SELECT
      default::User {
          id,
          name,
          email
      }
  FILTER
      (GLOBAL ext::auth::ClientTokenIdentity IN .identities)
  )));
  ALTER TYPE default::Sequence {
      ALTER ACCESS POLICY owner_has_full_access USING (((GLOBAL default::current_user).id ?= .owner.id));
  };
  ALTER TYPE default::Account {
      DROP PROPERTY provider;
      DROP PROPERTY provider_account_id;
  };
  ALTER TYPE default::User {
      DROP LINK accounts;
  };
  DROP TYPE default::Account;
  DROP TYPE default::Session;
};
