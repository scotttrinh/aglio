CREATE MIGRATION m1f4gsgqjr7xycldanjxgwk4sq4tiejv4pcfltn2oijezk44pmk5fq
    ONTO m1eoffkbd2ygr3lcm2hibh7v6zcinr5ocjo65y37ymbj54fpdylopq
{
  ALTER TYPE default::User {
      ALTER LINK sources {
          RESET ON SOURCE DELETE;
      };
  };
};
