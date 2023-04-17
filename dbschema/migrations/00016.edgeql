CREATE MIGRATION m15gb4bflnt4wadqk5pyk4s532yudu5o4r34vo3eoslxp26w4bqkua
    ONTO m1ot4tgajln2e4txshytnc24udvnattisc2bkzuvnj7oqtu7xkn2oq
{
  CREATE GLOBAL default::current_user -> std::uuid;
  ALTER TYPE default::Sequence {
      CREATE ACCESS POLICY owner_has_full_access
          ALLOW ALL USING ((GLOBAL default::current_user ?= .owner.id));
  };
};
