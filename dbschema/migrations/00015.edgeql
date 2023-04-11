CREATE MIGRATION m1ot4tgajln2e4txshytnc24udvnattisc2bkzuvnj7oqtu7xkn2oq
    ONTO m1f4gsgqjr7xycldanjxgwk4sq4tiejv4pcfltn2oijezk44pmk5fq
{
  ALTER TYPE default::User {
      ALTER LINK sources {
          ON TARGET DELETE ALLOW;
      };
  };
};
